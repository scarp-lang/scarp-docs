import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateCompilerEvidence } from './lib/compiler-release-drift.ts'
import { extractCodeFences } from './lib/code-fences.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = (path: string) => readFileSync(join(root, path), 'utf8')
const tag = 'v0.0.7-alpha.3'
const commit = '44a3bb0a91e67570e46ce058a3f6211f8e5db0f5'
const evidence = JSON.parse(read('data/compiler-v007-alpha3-release.json'))
assert.equal(evidence.compilerRef, tag)
assert.equal(evidence.compilerCommit, commit)
assert.equal(evidence.releasedAt, '2026-11-27T12:32:43Z')
assert.deepEqual(validateCompilerEvidence(evidence), [])
const manifest = JSON.parse(read('conformance/v007-alpha3/manifest.json')) as {
  compilerCommit: string; files: {name:string; upstream:string; blob:string}[]
}
assert.equal(manifest.compilerCommit, commit)
assert.deepEqual(manifest.files.map(x=>x.name), ["string_operators.srp","string_operators.stdout","native_aggregate_locals.srp","native_aggregate_locals.stdout"])
for (const file of manifest.files) {
  assert.equal(file.upstream, 'examples/'+file.name)
  const bytes = readFileSync(join(root,'conformance/v007-alpha3',file.name))
  const hash = createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
  assert.equal(hash,file.blob,'Git blob drift: '+file.name)
  if (process.argv[3]) assert.deepEqual(bytes,readFileSync(join(resolve(process.argv[3]),file.upstream)))
}
const pages = ['', 'hi/'].map(locale => {
  const release = read('docs/'+locale+'releases/'+tag+'.md')
  assert.ok(release.includes(commit))
  for (const name of evidence.assets as string[]) {
    if (name.endsWith('.sha256') || name==='SHA256SUMS') continue
    assert.ok(release.includes(name))
    assert.ok(release.includes(evidence.assetDigests[name].slice(7)))
  }
  return extractCodeFences(read('docs/'+locale+'guide/v007-alpha3-generics-strings.md'))
    .map(({language,code})=>({language,code}))
})
assert.deepEqual(pages[0],pages[1])
assert.deepEqual(pages[0].map(x=>x.language),['scarp','text','scarp','text','scarp','text','scarp','text'])
const expected = ["100 Scarp true\n7 0.01","[list: <string>] [list: <integer>]","Scarp","Hello Scarp\nababab\nliteral\\n\nfirst\nsecond"]
for (let i=0;i<expected.length;i++) assert.equal(pages[0][i*2+1].code,expected[i])
if (process.argv[2]) {
  const binary=resolve(process.argv[2])
  const work=mkdtempSync(join(tmpdir(),'scarp-docs-alpha3-'))
  try {
    function run(args:string[],success=true) {
      const result=spawnSync(binary,args,{cwd:work,encoding:'utf8',timeout:30000})
      assert.equal(result.error,undefined)
      if (success) {
        assert.equal(result.status,0,result.stderr)
        assert.equal(result.stderr,'')
      } else {
        assert.notEqual(result.status,0)
        assert.notEqual(result.status,null)
        assert.equal(result.stdout,'')
        assert.ok(result.stderr.length>0)
      }
      return result.stdout
    }
    assert.equal(run(['version']),'scarp 0.0.7-alpha.3\n')
    for(let i=0;i<expected.length;i++) {
      const name='lesson-'+i+'.srp'
      writeFileSync(join(work,name),pages[0][i*2].code+'\n')
      assert.equal(run(['verify',name]),'')
      assert.equal(run(['exec',name]),expected[i]+'\n')
    }
    for(const stem of ['string_operators','native_aggregate_locals']) {
      const name=stem+'.srp'
      writeFileSync(join(work,name),read('conformance/v007-alpha3/'+name))
      assert.equal(run(['verify',name]),'')
      assert.equal(run(['exec',name]),read('conformance/v007-alpha3/'+stem+'.stdout'))
    }
    const negative=[
      'pure funcra empty<T>() -> list<T> { return [list: <T>]; } print(empty());',
      'pure funcra square<T: Numeric>(x:T)->T{return x*x;} print(square("text"));',
      'print(3 * "a");'
    ]
    for(const [i,code] of negative.entries()) {
      const name='negative-'+i+'.srp'
      writeFileSync(join(work,name),code+'\n')
      run(['verify',name],false)
    }
  } finally {rmSync(work,{recursive:true,force:true})}
}
console.log('PASS: alpha.3 release evidence, bilingual examples and tagged fixture integrity'+(process.argv[2]?' (executed)':' (static only)'))
