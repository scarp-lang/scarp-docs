import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

if(!process.argv[2] || !process.argv[3]) {
  throw new Error('Usage: test-alpha6-ast-compiler.ts COMPILER_BINARY TAGGED_EXAMPLES_DIRECTORY')
}
const executable=resolve(process.argv[2])
const examples=resolve(process.argv[3])

interface Result {
  status: number | null
  stdout: string
  stderr: string
}
function run(args:string[],cwd?:string):Result {
  const result=spawnSync(executable,args,{
    encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024,cwd
  })
  if(result.error) throw result.error
  return {status:result.status,stdout:result.stdout,stderr:result.stderr}
}
function success(args:string[],cwd?:string):string {
  const result=run(args,cwd)
  assert.equal(result.status,0,JSON.stringify(args)+' failed: '+result.stderr)
  assert.equal(result.stderr,'',JSON.stringify(args)+' unexpectedly wrote stderr')
  return result.stdout
}
const version=success(['version'])
assert.equal(version,'scarp 0.0.6-alpha.1\n','must run exact published release')
assert.match(success(['guide','inspect','ast']),/Usage: scarp inspect ast/)
assert.match(success(['inspect','ast','--help']),/Usage: scarp inspect ast/)
const example=join(examples,'hello.srp')
const ast=success(['inspect','ast',example])
assert.match(ast,/Program/,'real parser must emit a program debug tree')
assert.match(ast,/(Output|Println)/,'the actual tagged hello example contains output')
assert.equal(success(['verify',example]),'','valid sample must verify without execution')

const scratch=mkdtempSync(join(tmpdir(),'scarp-docs-alpha6-ast-'))
try {
  const lateError=join(scratch,'parser-only नमस्ते.srp')
  // Imported module cannot be found and the expression would fail at
  // runtime: parse-only AST inspection must neither resolve nor evaluate it.
  writeFileSync(lateError,'import "missing.srp" as missing; print(1 / 0);','utf8')
  const result=success(['inspect','ast',lateError])
  assert.match(result,/Import/)
  assert.match(result,/(Output|Println)/)
  const verified=run(['verify',lateError])
  assert.equal(verified.status,1,'verify must diagnose the missing imported source')
  assert.equal(verified.stdout,'','invalid program must not produce successful output')

  const broken=join(scratch,'broken.srp')
  writeFileSync(broken,'print(1 + );','utf8')
  const json=run(['inspect','ast','--diagnostic-format=json',broken])
  assert.equal(json.status,1,'invalid syntax is a compile failure')
  assert.equal(json.stdout,'','error diagnostics must not leak an AST on stdout')
  assert.match(json.stderr,/"schema_version":1/)
  assert.match(json.stderr,/"severity":"error"/)

  for (const args of [
    ['inspect','ast','--json',example],
    ['inspect','ast','--max-steps','1',example],
    ['ast',example]
  ]) {
    const rejected=run(args)
    assert.equal(rejected.status,2,JSON.stringify(args)+' must be a usage error')
    assert.equal(rejected.stdout,'','bad CLI flags must not produce partial AST output')
    assert.ok(rejected.stderr.length>0,'bad CLI flags must report usage error')
  }

  writeFileSync(join(scratch,'-source.srp'),'print(12);','utf8')
  assert.match(success(['inspect','ast','--','-source.srp'],scratch),/Program/,
    'dash-leading path requires explicit separator')
} finally {
  rmSync(scratch,{recursive:true,force:true})
}
console.log('PASS: published alpha.6 AST debug output, parser-only semantics, diagnostics, unsupported JSON and Unicode paths')
