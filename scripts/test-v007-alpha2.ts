import assert from 'node:assert/strict'
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkSnippetPolicy } from './lib/snippet-policy.ts'
import { extractCodeFences } from './lib/code-fences.ts'
import { validateCompilerEvidence } from './lib/compiler-release-drift.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (p: string) => readFileSync(join(root,p), 'utf8')
const tag = 'v0.0.7-alpha.2'
const commit = '638dc4c227f34f1c660be66834bcc0cbdb22dec8'
const evidence = JSON.parse(read('data/compiler-v007-alpha2-release.json'))
assert.equal(evidence.compilerRef, tag)
assert.equal(evidence.compilerCommit, commit)
assert.deepEqual(validateCompilerEvidence(evidence), [])
assert.deepEqual(JSON.parse(read('data/compiler-latest-release.json')), evidence)
const lessons = ['', 'hi/'].map(prefix => {
  const page = read('docs/'+prefix+'guide/alpha7-first.md')
  assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  const release = read('docs/'+prefix+'releases/'+tag+'.md')
  for (const name of evidence.assets as string[]) {
    if (!name.endsWith('.sha256') && name !== 'SHA256SUMS') {
      assert.ok(release.includes(name))
      assert.ok(release.includes(evidence.assetDigests[name].slice(7)))
    }
  }
  return extractCodeFences(page).map(({language,code})=>({language,code}))
})
assert.deepEqual(lessons[0], lessons[1])
assert.deepEqual(lessons[0].map(x=>x.language), ['scarp','text','scarp','text'])
const expected = ['4\n2 8\n2', '6\n6\n60\n0']
for (const [i,value] of expected.entries()) assert.equal(lessons[0][2*i+1].code,value)
const types = ['', 'hi/'].map(prefix => {
  const page = read('docs/'+prefix+'guide/current-types.md')
  assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  return extractCodeFences(page).map(({language,code})=>({language,code}))
})
assert.deepEqual(types[0], types[1], 'Bilingual current type snippets differ')
assert.deepEqual(types[0].map(x=>x.language), Array.from({length:5},()=>['scarp','text']).flat())
const nativePages = ['', 'hi/'].map(prefix=>read('docs/'+prefix+'guide/native-object.md'))
const native = nativePages.map(page=>extractCodeFences(page).map(({language,code})=>({language,code})))
assert.deepEqual(native[0],native[1],'Native tutorial fences must match across languages')
assert.deepEqual(native[0].map(x=>x.language),['scarp','sh'])
for(const page of nativePages) {
  assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  assert.deepEqual(checkSnippetPolicy(page),[])
  assert.ok(checkSnippetPolicy(page.replace(tag,'v0.0.7-alpha.1')).some(issue=>issue.message.includes('native-object requires')))
}
if (process.argv[2]) {
  const binary = resolve(process.argv[2])
  const work = mkdtempSync(join(tmpdir(),'scarp-docs-v007-'))
  try {
    function run(args: string[]) {
      const result = spawnSync(binary,args,{cwd:work,encoding:'utf8',timeout:30000})
      assert.equal(result.error,undefined)
      assert.equal(result.status,0,result.stderr)
      assert.equal(result.stderr,'')
      return result.stdout
    }
    assert.equal(run(['version']), 'scarp 0.0.7-alpha.2\n')
    for (const [i,value] of expected.entries()) {
      const name = 'lesson-'+i+'.srp'
      writeFileSync(join(work,name),lessons[0][2*i].code+'\n')
      assert.equal(run(['verify',name]),'')
      assert.equal(run(['exec',name]),value+'\n')
    }
    for (let i=0; i<types[0].length; i+=2) {
      const name = 'type-'+i+'.srp'
      writeFileSync(join(work,name),types[0][i].code+'\n')
      assert.equal(run(['verify',name]),'')
      assert.equal(run(['exec',name]),types[0][i+1].code+'\n')
    }
    writeFileSync(join(work,'calls.srp'),native[0][0].code+'\n')
    const command = native[0][1].code.trim().split(/\s+/).slice(1)
    const report = JSON.parse(run(command))
    assert.equal(report.schema_version,1)
    assert.equal(report.target,'x86_64-none')
    assert.equal(report.mode,'bounded-entry')
    assert.equal(report.symbol,'evaluate')
    assert.equal(report.max_work,1000)
    assert.equal(report.max_stack_bytes,512)
    assert.ok(Number.isInteger(report.peak_stack_bytes) && report.peak_stack_bytes<=512)
    assert.equal(report.span_encoding,'utf-8-bytes')
    assert.ok(Array.isArray(report.failure_spans))
    const output = join(work,'calls.o')
    const bytes = readFileSync(output)
    assert.equal(bytes.subarray(0,4).toString('hex'),'7f454c46')
    assert.equal(bytes[4],2,'ELF64')
    assert.equal(bytes[5],1,'Little endian ELF')
    assert.equal(bytes.readUInt16LE(16),1,'ET_REL')
    assert.equal(bytes.readUInt16LE(18),62,'EM_X86_64')
    const repeated = spawnSync(binary,command,{cwd:work,encoding:'utf8',timeout:30000})
    assert.equal(repeated.status,1)
    assert.equal(repeated.stdout,'')
    assert.deepEqual(readFileSync(output),bytes,'Existing object must remain untouched')
    const rejected = [...command]
    rejected[rejected.indexOf('512')]='0'
    rejected[rejected.length-1]='rejected.o'
    const denied = spawnSync(binary,rejected,{cwd:work,encoding:'utf8',timeout:30000})
    assert.equal(denied.error,undefined)
    assert.notEqual(denied.status,0)
    assert.equal(denied.stdout,'')
    assert.ok(!existsSync(join(work,'rejected.o')),'Rejected stack budget must not publish an object')
  } finally { rmSync(work,{recursive:true,force:true}) }
}
console.log('PASS: v0.0.7-alpha.2 bilingual release evidence and examples'+(process.argv[2]?' (executed)':' (static only)'))
