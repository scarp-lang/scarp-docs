import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences } from './lib/code-fences.ts'
import { validateCompilerEvidence } from './lib/compiler-release-drift.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (p: string) => readFileSync(join(root,p), 'utf8')
const tag = 'v0.0.7-alpha.1'
const commit = '996bd5b83c8cb26e98637563729f67bdacc61cd4'
const evidence = JSON.parse(read('data/compiler-v007-alpha1-release.json'))
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
    assert.equal(run(['version']), 'scarp 0.0.7-alpha.1\n')
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
  } finally { rmSync(work,{recursive:true,force:true}) }
}
console.log('PASS: v0.0.7-alpha.1 bilingual release evidence and examples'+(process.argv[2]?' (executed)':' (static only)'))
