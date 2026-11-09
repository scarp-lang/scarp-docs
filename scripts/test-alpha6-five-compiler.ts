import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
if(!process.argv[2]||!process.argv[3])
  throw Error('Usage: test-alpha6-five-compiler.ts COMPILER_BINARY PUBLISHED_EXAMPLES_DIRECTORY')
const compiler=resolve(process.argv[2])
const examples=resolve(process.argv[3])
const run=(args:string[])=>{
  const call=spawnSync(compiler,args,{encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024})
  if(call.error)throw call.error
  assert.equal(call.status,0,JSON.stringify(args)+': '+call.stderr)
  assert.equal(call.stderr,'',JSON.stringify(args)+': unexpected diagnostics')
  return call.stdout
}
assert.ok(run(['version']).includes('0.0.6-alpha.5'),'Must execute the alpha.5 prerelease binary')
for(const name of ['nucleus_selection','pearson_correlation']){
  const file=join(examples,name+'.srp')
  assert.equal(readFileSync(file,'utf8'),readFileSync(resolve('conformance/alpha6-five',name+'.srp'),'utf8'))
  assert.equal(readFileSync(join(examples,name+'.stdout'),'utf8'),
    readFileSync(resolve('conformance/alpha6-five',name+'.stdout'),'utf8'))
  assert.equal(run(['verify',file]),'','Static verify should not run the program: '+name)
  assert.equal(run(['exec',file]),readFileSync(join(examples,name+'.stdout'),'utf8'),
    'Interpreter stdout drifted from the published release: '+name)
}
console.log('PASS: exact published alpha.6.5 interpreter, static verify and byte-identical Top-P/Pearson stdout')
