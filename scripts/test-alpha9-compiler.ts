import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const binary=process.argv[2]
if(!binary)throw new Error('Usage: npm run test:alpha9-compiler -- /absolute/path/to/scarp')
const compiler=resolve(binary)
function run(args:string[]){
  const result=spawnSync(compiler,args,{cwd:root,encoding:'utf8',timeout:30_000,maxBuffer:1024*1024})
  assert.equal(result.error,undefined,'Compiler failed to launch: '+args.join(' '))
  return result
}
for(const stem of ['bigint_arithmetic','bigint_sequences']){
  const program=resolve(root,'conformance/alpha9/'+stem+'.srp')
  const expected=readFileSync(resolve(root,'conformance/alpha9/'+stem+'.stdout'),'utf8')
  const verify=run(['verify',program])
  assert.equal(verify.status,0,'static verify failed: '+verify.stderr)
  const execution=run(['exec',program])
  assert.equal(execution.status,0,'published BigInt source failed: '+execution.stderr)
  assert.equal(execution.stdout,expected,stem+': byte-exact compiler output drift')
}
const project=resolve(root,'conformance/alpha8/calculator')
const report=run(['test','--json=v2',project])
assert.equal(report.status,0,'published structured test report failed: '+report.stderr)
const parsed=JSON.parse(report.stdout) as {schema_version:number;mode:string;tests:unknown[]}
assert.equal(parsed.schema_version,2)
assert.equal(parsed.mode,'run')
assert.ok(Array.isArray(parsed.tests))
const old=run(['test','--json',project])
assert.equal(old.status,0,old.stderr)
assert.equal(JSON.parse(old.stdout).schema_version,1,'Original JSON schema drift')
console.log('PASS: tagged alpha.9 BigInt stdout, static verification and backward-compatible JSON v1/v2')
