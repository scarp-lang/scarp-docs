import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { DIAGNOSE_FIELDS } from './lib/alpha6-diagnose-policy.ts'

if(!process.argv[2]) {
  throw new Error('Usage: test-alpha6-diagnose-compiler.ts COMPILER_BINARY')
}
const binary=resolve(process.argv[2])
const workingDir=mkdtempSync(join(tmpdir(),'scarp-alpha6-diagnose-'))
const sentinel=join(workingDir,'do-not-change.txt')
writeFileSync(sentinel,'untouched\n','utf8')
interface Execution { status: number | null; stdout: string; stderr: string }
function run(args: string[]): Execution {
  const r=spawnSync(binary,args,{encoding:'utf8',cwd:workingDir,timeout:60000,maxBuffer:4*1024*1024})
  if(r.error) throw r.error
  return {status:r.status,stdout:r.stdout,stderr:r.stderr}
}
function success(args: string[]): string {
  const result=run(args)
  assert.equal(result.status,0,JSON.stringify(args)+': '+result.stderr)
  assert.equal(result.stderr,'',JSON.stringify(args)+': unexpected stderr')
  return result.stdout
}
try {
  const version=success(['version'])
  assert.equal(version,'scarp 0.0.6-alpha.1\n','this job must test the exact published alpha.6 binary')
  assert.equal(success(['--version']),version)

  const guide=success(['guide','diagnose'])
  assert.match(guide,/Usage: scarp diagnose \[--json\]/)
  assert.match(success(['diagnose','--help']),/Usage: scarp diagnose/)
  assert.match(success(['diagnose','-h']),/Usage: scarp diagnose/)

  const human=success(['diagnose'])
  assert.ok(human.endsWith('\n'))
  assert.match(human,/Scarp compiler: 0\.0\.6-alpha\.1/)
  assert.match(human,/Execution: interpreter/)
  assert.match(human,/Native executable emission: unavailable/)
  assert.match(human,/Package management: unavailable/)
  assert.match(human,/Project create\/launch: available/)

  const json=success(['diagnose','--json'])
  assert.ok(json.endsWith('\n'),'JSON report ends in newline')
  assert.equal(json.trim().split('\n').length,1,'JSON report must be one line')
  const data=JSON.parse(json) as Record<string,unknown>
  assert.deepEqual(Object.keys(data).sort(),Object.keys(DIAGNOSE_FIELDS).sort(),
    'published schema must contain exactly the documented ten keys')
  for(const [key,type] of Object.entries(DIAGNOSE_FIELDS)) {
    const kind=typeof data[key]
    assert.equal(kind,type==='integer'?'number':type,key+' JSON field type mismatch')
  }
  assert.equal(data.schema_version,1)
  assert.equal(data.version,'0.0.6-alpha.1')
  assert.equal(data.execution,'interpreter')
  assert.ok(typeof data.host_os==='string' && data.host_os.length>0)
  assert.ok(typeof data.host_arch==='string' && data.host_arch.length>0)
  for(const key of ['static_verify','module_inspection','project_workflow']) {
    assert.equal(data[key],true,key+' available in tagged alpha.6')
  }
  assert.equal(data.native_executable,false)
  assert.equal(data.package_manager,false)
  assert.ok(human.includes('Host: '+data.host_os+'/'+data.host_arch),
    'human report and JSON must describe the same host')
  for(const args of [
    ['diagnose','--format=json'],
    ['diagnose','--json','extra'],
    ['diagnose','--diagnostic-format=json'],
    ['diagnose','unexpected']
  ]) {
    const result=run(args)
    assert.equal(result.status,2,JSON.stringify(args)+' must reject unsupported arguments')
    assert.equal(result.stdout,'',JSON.stringify(args)+' cannot emit partial capability data')
    assert.match(result.stderr,/invalid diagnose arguments/)
  }
  assert.equal(readFileSync(sentinel,'utf8'),'untouched\n',
    'diagnose must not mutate an unrelated file')
} finally {
  rmSync(workingDir,{recursive:true,force:true})
}
console.log('PASS: tagged alpha.6 diagnose version, text/JSON capability schema, host, help, errors and no file mutation')
