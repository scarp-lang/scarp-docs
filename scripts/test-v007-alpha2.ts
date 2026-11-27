import assert from 'node:assert/strict'
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve, join, dirname } from 'node:path'
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
const frozen = JSON.parse(read('conformance/v007-alpha2/guide-fences.json')) as Record<string,string>
const historicalGuide = (path: string) => { assert.ok(frozen[path], 'Missing frozen guide: '+path); return frozen[path] }
const lessons = ['', 'hi/'].map(prefix => {
  const page = historicalGuide('docs/'+prefix+'guide/alpha7-first.md')
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
  const page = historicalGuide('docs/'+prefix+'guide/current-types.md')
  assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  return extractCodeFences(page).map(({language,code})=>({language,code}))
})
assert.deepEqual(types[0], types[1], 'Bilingual current type snippets differ')
assert.deepEqual(types[0].map(x=>x.language), Array.from({length:5},()=>['scarp','text']).flat())
const nativePages = ['', 'hi/'].map(prefix=>historicalGuide('docs/'+prefix+'guide/native-object.md'))
const native = nativePages.map(page=>extractCodeFences(page).map(({language,code})=>({language,code})))
assert.deepEqual(native[0],native[1],'Native tutorial fences must match across languages')
assert.deepEqual(native[0].map(x=>x.language),['scarp','sh'])
for(const page of nativePages) {
  assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  assert.deepEqual(checkSnippetPolicy(page),[])
  assert.ok(checkSnippetPolicy(page.replace(tag,'v0.0.7-alpha.1')).some(issue=>issue.message.includes('native-object requires')))
}
function bilingualFences(guide: string, languages: string[]) {
  const pages = ['', 'hi/'].map(prefix=>historicalGuide('docs/'+prefix+'guide/'+guide+'.md'))
  for (const page of pages) {
    assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
    assert.deepEqual(checkSnippetPolicy(page),[])
  }
  const snippets = pages.map(page=>extractCodeFences(page).map(({language,code})=>({language,code})))
  assert.deepEqual(snippets[0],snippets[1],guide+' bilingual snippets differ')
  assert.deepEqual(snippets[0].map(x=>x.language),languages)
  return snippets[0]
}
const abi = bilingualFences('native-abi',['c','sh'])
const layout = bilingualFences('native-layout',['rust'])
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
    assert.equal(report.symbol,'scarp_bounded_integer_entry')
    assert.equal(report.integer_arguments,1)
    assert.equal(report.call_stack_alignment,16)
    assert.equal(report.stack_argument_bytes,0)
    assert.equal(report.max_active_frames,2)
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
    // Link the documented C harness independently and check real native execution.
    function hostRun(command: string, args: string[]) {
      const result = spawnSync(command,args,{cwd:work,encoding:'utf8',timeout:30000})
      assert.equal(result.error,undefined,String(result.error))
      assert.equal(result.status,0,result.stderr)
      return result.stdout
    }
    writeFileSync(join(work,'host.c'),abi[0].code+'\n')
    for (const line of abi[1].code.trim().split('\n')) {
      const [command,...args] = line.split(/\s+/)
      hostRun(command,args)
    }
    // Build the documented Rust host query against the same exact compiler.
    const build = dirname(binary)
    writeFileSync(join(work,'layout.rs'),layout[0].code+'\n')
    hostRun('rustc',['--edition=2021','--extern','scarp='+join(build,'libscarp.rlib'),
      '-L','dependency='+join(build,'deps'),'layout.rs','-o','layout-check'])
    hostRun('./layout-check',[])
    const repeated = spawnSync(binary,command,{cwd:work,encoding:'utf8',timeout:30000})
    assert.equal(repeated.status,1)
    assert.equal(repeated.stdout,'')
    assert.deepEqual(readFileSync(output),bytes,'Existing object must remain untouched')
    // The exact reported peak must produce identical bytes.
    const exact = [...command]
    exact[exact.indexOf('512')]=String(report.peak_stack_bytes)
    exact[exact.length-1]='exact.o'
    const exactReport = JSON.parse(run(exact))
    assert.equal(exactReport.peak_stack_bytes,report.peak_stack_bytes)
    assert.equal(exactReport.max_stack_bytes,report.peak_stack_bytes)
    assert.deepEqual(readFileSync(join(work,'exact.o')),bytes)
    assert.ok(report.peak_stack_bytes>0)
    const rejected = [...command]
    rejected[rejected.indexOf('512')]=String(report.peak_stack_bytes-1)
    rejected[rejected.length-1]='rejected.o'
    const denied = spawnSync(binary,rejected,{cwd:work,encoding:'utf8',timeout:30000})
    assert.equal(denied.error,undefined)
    assert.equal(denied.status,1)
    assert.match(denied.stderr,/exceeding the caller budget/)
    assert.equal(denied.stdout,'')
    assert.ok(!existsSync(join(work,'rejected.o')),'Rejected stack budget must not publish an object')
    // A malformed target is a usage failure, even with a missing input.
    const invalid = spawnSync(binary,['native-object','--json','x86_64','checked',
      'missing.srp','-o','invalid.o'],{cwd:work,encoding:'utf8',timeout:30000})
    assert.equal(invalid.error,undefined)
    assert.equal(invalid.status,2)
    assert.equal(invalid.stdout,'')
    assert.ok(invalid.stderr.length>0)
    assert.ok(!existsSync(join(work,'invalid.o')))
    // Validate original byte spans with UTF-8 and CRLF before the arithmetic.
    const unicode = '// जहाँ 😀\r\npure funcra f(a:integer,b:integer)->integer{return a/b;}'
    writeFileSync(join(work,'unicode.srp'),unicode)
    for (const [mode,extra,symbol] of [
      ['checked',[],'scarp_checked_integer_function'],
      ['bounded',['1000'],'scarp_bounded_integer_function']
    ] as const) {
      const metadata = JSON.parse(run(['native-object','--json','x86_64-none',mode,...extra,
        'unicode.srp','-o',mode+'.o']))
      assert.equal(metadata.symbol,symbol)
      assert.equal(metadata.mode,mode)
      assert.equal(metadata.max_work,mode==='checked'?null:1000)
      assert.equal(metadata.integer_arguments,2)
      const sourceBytes=Buffer.from(unicode,'utf8')
      const division=sourceBytes.indexOf('/b;')
      assert.ok(metadata.failure_spans.some((span: number[])=>span[0]===division&&span[1]===division+1))
      for(const [start,end] of metadata.failure_spans) {
        assert.ok(Number.isInteger(start)&&Number.isInteger(end)&&start>=0&&end>=start&&end<=sourceBytes.length)
      }
    }
  } finally { rmSync(work,{recursive:true,force:true}) }
}
console.log('PASS: v0.0.7-alpha.2 bilingual release evidence and examples'+(process.argv[2]?' (executed)':' (static only)'))
