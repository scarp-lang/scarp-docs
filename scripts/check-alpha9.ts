import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { commandAdvice, LATEST_RELEASE } from './lib/command-finder.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
const tag='v0.0.6-alpha.9'
const source='0814997dc43982eb707a9a1aee72aab3a7ac8b41'
const published='2026-11-13T11:22:47Z'
const manifest=JSON.parse(read('conformance/alpha9-manifest.json')) as {
  compilerRepository:string;compilerRef:string;compilerCommit:string;
  releasedAt:string;status:string;
  cases:Array<{source:string;localSource:string;gitBlobSha:string}>
}
const current=JSON.parse(read('data/compiler-latest-release.json')) as {
  compilerRepository:string;compilerRef:string;compilerCommit:string;
  releasedAt:string;status:string;assets:string[]
}
for(const value of [manifest,current]){
  assert.equal(value.compilerRepository,'scarp-lang/scarp')
  assert.equal(value.compilerRef,tag)
  assert.equal(value.compilerCommit,source)
  assert.equal(value.releasedAt,published)
  assert.equal(value.status,'published-prerelease')
}
assert.equal(LATEST_RELEASE,tag)
assert.deepEqual(manifest.cases.map(c=>c.source),[
  'examples/bigint_arithmetic.srp','examples/bigint_arithmetic.stdout',
  'examples/bigint_sequences.srp','examples/bigint_sequences.stdout'
])
for(const c of manifest.cases){
  assert.equal(c.localSource,'conformance/alpha9/'+c.source.split('/').at(-1),
    'The local example must stay at its pinned compiler path')
  assert.match(c.gitBlobSha,/^[a-f0-9]{40}$/)
  const bytes=readFileSync(resolve(root,c.localSource))
  const blob=createHash('sha1').update('blob '+bytes.length+'\\0').update(bytes).digest('hex')
  assert.equal(blob,c.gitBlobSha,'Upstream Git blob mismatch: '+c.source)
}
const code=read('conformance/alpha9/bigint_arithmetic.srp').trimEnd()
const output=read('conformance/alpha9/bigint_arithmetic.stdout').trimEnd()
assert.ok(output.startsWith('1000000000000000000000000000000'))
assert.ok(read('conformance/alpha9/bigint_sequences.stdout').includes('354224848179261915075'))
for(const path of ['releases/'+tag,'language/bigint-alpha9','tooling/test-json-v2-alpha9']){
  const en=read('docs/'+path+'.md')
  const hi=read('docs/hi/'+path+'.md')
  for(const text of [en,hi]){
    assert.ok(text.includes('<!-- scarp-cli-release: '+tag+' -->'),path+': wrong release marker')
    assert.ok(text.includes(tag),path+': missing current compiler release')
  }
  assert.equal(firstMissingCodeBlock(extractCodeFences(en),extractCodeFences(hi)),-1,
    path+': English/Hindi code fences differ')
  assert.ok((hi.match(/[\\u0900-\\u097f]/gu)??[]).length>=90,
    path+': Hindi translation missing')
}
for(const path of ['docs/releases/'+tag+'.md','docs/hi/releases/'+tag+'.md',
  'docs/language/bigint-alpha9.md','docs/hi/language/bigint-alpha9.md']){
  const text=read(path)
  assert.ok(text.includes(code),path+': exact tagged BigInt program missing')
  assert.ok(text.includes(output),path+': exact tagged stdout missing')
}
for(const locale of ['', 'hi/']){
  const page=read('docs/'+locale+'releases/'+tag+'.md')
  assert.ok(page.includes('<!-- scarp-current-source: '+source+' -->'))
  assert.ok(page.includes('<!-- scarp-current-release: '+tag+' -->'))
  for(const platform of [
    'x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ]){
    const asset='scarp-0.0.6-alpha.9-'+platform
    const uri='https://github.com/scarp-lang/scarp/releases/download/'+tag+'/'+asset
    assert.ok(page.includes(']('+uri+')'))
    assert.ok(page.includes(']('+uri+'.sha256)'))
    assert.ok(current.assets.includes(asset))
  }
  assert.ok(page.includes('SHA256SUMS'))
  assert.ok(read('docs/'+locale+'index.md').includes('](/'+locale+'releases/'+tag+')'))
  assert.ok(read('docs/'+locale+'reference/status.md').includes('](/'+locale+'releases/'+tag+')'))
  assert.ok(read('docs/'+locale+'reference/compatibility.md').includes('](/'+locale+'releases/'+tag+')'))
  assert.ok(read('docs/'+locale+'tooling/test-json-v2-alpha9.md').includes('scarp test --json=v2'))
}
assert.deepEqual(commandAdvice(tag,'test-json-v2').commands,
  ['scarp test --json=v2 PROJECT_DIRECTORY'])
assert.equal(commandAdvice('v0.0.6-alpha.8','test-json-v2').supported,false)
assert.equal(current.assets.length,4)
console.log('PASS: alpha.9 release provenance, 4 exact Git blobs, 3 bilingual guides, downloads and CLI boundary')
