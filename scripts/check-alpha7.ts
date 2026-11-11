import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(p:string):string=>readFileSync(resolve(root,p),'utf8')
const tag='v0.0.6-alpha.7', source='b1c1fd232b418267d95520c69ee563ac99ecae30'
const manifest=JSON.parse(read('conformance/alpha7-manifest.json')) as {compilerRepository:string;compilerRef:string;compilerCommit:string;cases:{localSource:string;localStdout:string}[]}
assert.equal(manifest.compilerRepository,'scarp-lang/scarp')
assert.equal(manifest.compilerRef,tag)
assert.equal(manifest.compilerCommit,source)
assert.equal(manifest.cases.length,1)
const fixture=read(manifest.cases[0]!.localSource).trimEnd()
const stdout=read(manifest.cases[0]!.localStdout).trimEnd()
for(const p of ['releases/'+tag,'language/conditional-expressions-alpha7','language/unicode-escapes-alpha7']){
 const en=read('docs/'+p+'.md'),hi=read('docs/hi/'+p+'.md')
 for(const body of [en,hi]){
  assert.ok(body.includes('<!-- scarp-current-release: '+tag+' -->'),p+': release marker drift')
  assert.ok(body.includes('<!-- scarp-current-source: '+source+' -->'),p+': source marker drift')
  assert.ok(body.includes(fixture),p+': pinned example changed')
  assert.ok(body.includes(stdout),p+': stdout changed')
 }
 assert.ok((hi.match(/[\u0900-\u097f]/gu)??[]).length>=50,p+': insufficient Hindi translation')
 assert.equal(firstMissingCodeBlock(extractCodeFences(en),extractCodeFences(hi)),-1,p+': code parity failed')
}
for(const p of ['docs/releases/'+tag+'.md','docs/hi/releases/'+tag+'.md']){
 const body=read(p)
 for(const archive of ['scarp-0.0.6-alpha.7-x86_64-pc-windows-msvc.zip','scarp-0.0.6-alpha.7-x86_64-unknown-linux-gnu.tar.gz','scarp-0.0.6-alpha.7-aarch64-apple-darwin.tar.gz']){
  assert.ok(body.includes('releases/download/'+tag+'/'+archive+')'),p+': missing archive')
  assert.ok(body.includes('releases/download/'+tag+'/'+archive+'.sha256)'),p+': missing checksum')
 }
 assert.ok(body.includes('SHA256SUMS') && body.includes('E0003'),p+': missing release evidence')
}
console.log('PASS: published alpha.7 exact source, stdout, bilingual parity and download evidence')
