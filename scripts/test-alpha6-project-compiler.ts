import assert from 'node:assert/strict'
import { readFileSync, cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

if (!process.argv[2]) throw new Error('Usage: test-alpha6-project-compiler.ts COMPILER_BINARY')
const executable = resolve(process.argv[2])
const project = resolve('conformance/alpha6-project')
const source = join(project,'src','main.srp')
const expected = readFileSync(join(project,'expected.stdout'),'utf8')
interface RunResult { status: number | null; stdout: string; stderr: string }
function execute(args: string[]): RunResult {
  const child = spawnSync(executable,args,{
    encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024
  })
  if (child.error) throw child.error
  return {status:child.status,stdout:child.stdout,stderr:child.stderr}
}
function success(args: string[],stdout: string): RunResult {
  const result = execute(args)
  assert.equal(result.status,0,JSON.stringify(args)+'\n'+result.stderr)
  assert.equal(result.stderr,'',JSON.stringify(args)+' unexpected stderr')
  assert.equal(result.stdout,stdout,JSON.stringify(args)+' unexpected stdout')
  return result
}
success(['verify',project],'')
success(['verify',source],'')
success(['launch',project],expected)
success(['exec',source],expected)
for (const kind of ['modules','symbols','references'] as const) {
  const projectView = JSON.parse(success(['inspect',kind,'--json',project],
    execute(['inspect',kind,'--json',project]).stdout).stdout) as Record<string,unknown>
  assert.equal(projectView.schema_version,1)
  assert.ok(Array.isArray(projectView.files) && projectView.files.length >= 2)
  const fileResult = execute(['inspect',kind,'--json',source])
  assert.equal(fileResult.status,0,'file inspection must succeed: '+fileResult.stderr)
  assert.equal(fileResult.stderr,'')
  const fileView = JSON.parse(fileResult.stdout) as Record<string,unknown>
  assert.equal(fileView.schema_version,1)
  assert.deepEqual(projectView.kind,fileView.kind)
  if (kind === 'modules') continue
  assert.equal(projectView.kind,'scarp.'+kind)
  assert.equal(projectView.span_encoding,'utf-8-bytes')
  assert.equal(projectView.column_encoding,'unicode-scalar')
  assert.equal(projectView.position_base,1)
  assert.ok(Array.isArray(projectView.symbols))
  const symbols = projectView.symbols as Array<{id:number;name:string;kind:string}>
  assert.ok(symbols.some(s=>s.name==='library' && s.kind==='import_alias'))
  assert.ok(symbols.some(s=>s.name==='twice' && s.kind==='function'))
  assert.ok(symbols.some(s=>s.name==='adjust' && s.kind==='function'))
  assert.equal(symbols.filter(s=>s.name==='base' && s.kind==='binding').length,2)
  assert.ok(Array.isArray(fileView.symbols))
  const fileSymbols = fileView.symbols as Array<{name:string;kind:string}>
  assert.deepEqual(
    symbols.map(s=>[s.name,s.kind]),
    fileSymbols.map(s=>[s.name,s.kind]),
    'project and file compilation must identify the same definitions'
  )
  if (kind==='references') {
    assert.ok(Array.isArray(projectView.references))
    const refs = projectView.references as Array<{target:number;kind:string}>
    assert.ok(refs.some(r=>r.kind==='call'))
    assert.ok(refs.some(r=>r.kind==='argument_label'))
    const ids=new Set(symbols.map(s=>s.id))
    for(const ref of refs) assert.ok(ids.has(ref.target),'dangling reference target')
  }
}
// Reject a manifest escape without emitting any successful inventory or runtime output.
const temporary = mkdtempSync(join(tmpdir(),'scarp-alpha6-docs-project-'))
try {
  const invalidProject = join(temporary,'navigation-lab')
  cpSync(project,invalidProject,{recursive:true})
  writeFileSync(join(invalidProject,'Scarp.project'),
    'scarp-project: 1\nname: navigation-lab\nentry: ../outside.srp\n')
  for (const args of [
    ['verify',invalidProject],
    ['inspect','symbols','--json',invalidProject],
    ['inspect','references','--json',invalidProject],
    ['launch',invalidProject]
  ]) {
    const failed=execute(args)
    assert.equal(failed.status,1,JSON.stringify(args)+' expected source/manifest failure')
    assert.equal(failed.stdout,'','failed checks must not emit partial output')
    assert.ok(failed.stderr.length>0,'failures must be reported')
  }
} finally {
  rmSync(temporary,{recursive:true,force:true})
}
console.log('PASS: tagged alpha.6 project verify, launch, exec, file/project JSON, references, and unsafe-manifest errors')
