import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha65Docs, type Alpha65Manifest } from './lib/alpha6-five-evidence.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
const metadata=JSON.parse(read('conformance/alpha6-five-manifest.json')) as Alpha65Manifest
const fixtures=Object.fromEntries(Object.keys(metadata.fixtures).map(name=>
  [name,read('conformance/alpha6-five/'+name)]))
const current=JSON.parse(read('data/compiler-latest-release.json'))
const errors=validateAlpha65Docs(metadata,{
  english:read('docs/releases/v0.0.6-alpha.5.md'),
  hindi:read('docs/hi/releases/v0.0.6-alpha.5.md')
},fixtures,current)
if(process.argv[2]){
  const tagged=resolve(process.argv[2])
  for(const [name,item] of Object.entries(metadata.fixtures)){
    if(readFileSync(join(tagged,name),'utf8')!==fixtures[name])
      errors.push('Published tagged compiler differs: '+item.compilerPath)
  }
}
if(errors.length){
  for(const error of errors)console.error('FAIL alpha.6.5: '+error)
  process.exitCode=1
}else console.log('PASS: four release-pinned alpha.6.5 Git blobs, exact bilingual code/output, asset/source identity and tag parity')
