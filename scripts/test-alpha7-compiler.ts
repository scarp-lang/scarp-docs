import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const binary=process.argv[2]
if(!binary)throw new Error('Usage: npm run test:alpha7-compiler -- /absolute/path/to/scarp')
const source=resolve(root,'conformance/alpha7/conditional_unicode.srp')
const stdout=readFileSync(resolve(root,'conformance/alpha7/conditional_unicode.stdout'))
for(const command of ['verify','exec']){
 const result=spawnSync(binary,[command,source],{encoding:null,timeout:15000,maxBuffer:1024*1024})
 assert.equal(result.error,undefined,command+': compiler could not be launched')
 assert.equal(result.status,0,command+': compiler failed: '+result.stderr?.toString())
 assert.deepEqual(result.stdout,command==='verify'?Buffer.alloc(0):stdout,command+': wrong stdout')
}
console.log('PASS: published alpha.7 static verification and byte-exact interpreter stdout')
