import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const binary=process.argv[2]
if(!binary)throw new Error('Usage: npm run test:alpha8-compiler -- /absolute/path/to/scarp')
const compiler=resolve(binary)
const project=resolve(root,'conformance/alpha8/calculator')
const run=(args:string[],cwd=root)=>{
  const result=spawnSync(compiler,args,{cwd,encoding:'utf8',timeout:20000,maxBuffer:1024*1024})
  assert.equal(result.error,undefined,args.join(' ')+': could not start Scarp compiler')
  return result
}
const okay=(args:string[],cwd=root)=>{
  const result=run(args,cwd)
  assert.equal(result.status,0,args.join(' ')+': unexpected failure: '+result.stderr)
  return result
}
assert.ok(existsSync(join(project,'scarp.project')))
const verify=okay(['verify',project])
assert.equal(verify.stdout,'','Project verification must not execute its entrypoint')
const execution=okay(['run',project])
assert.equal(execution.stdout,
  readFileSync(join(root,'conformance/alpha8/calculator.stdout'),'utf8'),
  'Tagged calculator interpreter output changed')
const projectInfo=JSON.parse(okay(['project','info','--json',project]).stdout) as {
  schema_version:number;name:string;format:string;manifest:string;entry:string
}
assert.equal(projectInfo.schema_version,1)
assert.equal(projectInfo.name,'calculator')
assert.equal(projectInfo.format,'v2')
assert.equal(projectInfo.manifest,'scarp.project')
assert.equal(projectInfo.entry,'src/main.srp')
const listing=okay(['test','--list',project])
assert.match(listing.stdout,/addition\.srp/)
assert.match(listing.stdout,/input\.srp/)
const tests=okay(['test','--require-tests',project])
assert.match(tests.stdout,/2 passed/i)
const filtered=JSON.parse(okay(['test','--json','--filter','input',project]).stdout) as {
  schema_version:number;mode:string;discovered:number;passed:number;failed:number;
  tests:Array<{path:string;status:string}>
}
assert.equal(filtered.schema_version,1)
assert.equal(filtered.mode,'run')
assert.equal(filtered.discovered,1)
assert.equal(filtered.passed,1)
assert.equal(filtered.failed,0)
assert.equal(filtered.tests.length,1)
assert.equal(filtered.tests[0]?.path,'tests/input.srp')
const sandbox=mkdtempSync(join(tmpdir(),'scarp-alpha8-conformance-'))
try {
  const destination=join(sandbox,'fresh')
  okay(['init',destination])
  assert.ok(existsSync(join(destination,'scarp.project')),
    'New alpha.8 projects must create a declarative scarp.project')
  okay(['verify',destination])
  assert.notEqual(run(['init',destination]).status,0,
    'The init command must refuse to overwrite an existing directory')
  const assertion=join(sandbox,'assertion-check.srp')
  writeFileSync(assertion,'assert(false, "verified E0065");\n','utf8')
  const staticCheck=okay(['verify',assertion])
  assert.equal(staticCheck.stdout,'','Static verification must not evaluate assertions')
  const failure=run(['exec',assertion])
  assert.notEqual(failure.status,0,'False assertion must fail at runtime')
  assert.match(failure.stderr,/E0065/,'Native assertion failure must report E0065')
} finally {
  rmSync(sandbox,{recursive:true,force:true})
}
console.log('PASS: exact published alpha.8 project verify/run, metadata JSON, two real tests, filtered report, stdin fixture, init safety and E0065')
