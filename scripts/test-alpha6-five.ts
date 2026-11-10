import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha65Docs, type Alpha65Manifest } from './lib/alpha6-five-evidence.ts'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(p:string)=>readFileSync(resolve(root,p),'utf8')
const metadata=JSON.parse(read('conformance/alpha6-five-manifest.json')) as Alpha65Manifest
const pages={english:read('docs/releases/v0.0.6-alpha.5.md'),hindi:read('docs/hi/releases/v0.0.6-alpha.5.md')}
const fixtures=Object.fromEntries(Object.keys(metadata.fixtures).map(name=>[name,read('conformance/alpha6-five/'+name)]))
const current=JSON.parse(read('data/compiler-latest-release.json'))
const check=(m=metadata,p=pages,f=fixtures,c=current)=>validateAlpha65Docs(m,p,f,c)
assert.deepEqual(check(),[],'historical alpha.5 evidence must pass with the newer published compiler')
assert.deepEqual(check(metadata,pages,fixtures,{...current,compilerRef:'v0.0.6-alpha.5',compilerCommit:metadata.compilerCommit}),[],
  'historical alpha.5 remains self-contained and valid')
assert.ok(check({...metadata,compilerCommit:'0'.repeat(40)}).length>0)
assert.ok(check(metadata,pages,{...fixtures,'nucleus_selection.srp':fixtures['nucleus_selection.srp']+'// drift\n'}).length>0)
assert.ok(check(metadata,pages,{...fixtures,'pearson_correlation.stdout':'1.0\n1.0\n0.0\n'}).length>0)
assert.ok(check(metadata,{...pages,english:pages.english.replace('top_p(probabilities, mass)','top_p(probabilities)')}).length===0,
  'Prose is not tagged code; source and output fences remain authoritative')
assert.ok(check(metadata,{...pages,english:pages.english.replace('~~~scarp','~~~text')}).length>0)
assert.ok(check(metadata,{...pages,hindi:pages.hindi.replace('205e92f166f186c3905e5880d41c31717b697b8e','0'.repeat(40))}).length>0)
assert.ok(check(metadata,pages,fixtures,{...current,compilerRef:'v0.0.6-alpha.4'}).length>0)
assert.ok(check(metadata,pages,fixtures,{...current,compilerCommit:'0'.repeat(40)}).length>0)
assert.ok(check({...metadata,fixtures:{...metadata.fixtures,'nucleus_selection.stdout':{
  ...metadata.fixtures['nucleus_selection.stdout'],gitBlobSha:'0'.repeat(40)
}}}).length>0)
console.log('PASS: alpha.6.5 provenance and bilingual regression mutations')
