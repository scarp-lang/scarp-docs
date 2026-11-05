import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

if (!process.argv[2] || !process.argv[3]) {
  throw new Error('Usage: test-alpha6-compiler.ts COMPILER_BINARY TAGGED_EXAMPLES_DIRECTORY')
}
const bin = resolve(process.argv[2])
const examples = resolve(process.argv[3])
function call(args: string[]): string {
  const run = spawnSync(bin,args,{encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024})
  if (run.error) throw run.error
  assert.equal(run.status,0,JSON.stringify(args)+'\n'+run.stderr)
  assert.equal(run.stderr,'',JSON.stringify(args)+' unexpected stderr')
  return run.stdout
}
for (const name of ['symbol_navigation','root_mean_square']) {
  const file = join(examples,name+'.srp')
  assert.equal(call(['exec',file]),readFileSync(join(examples,name+'.stdout'),'utf8'))
  assert.equal(call(['verify',file]),'')
}
for (const [topic,kind] of [
  ['symbols','scarp.symbols'],['references','scarp.references']
]) {
  const output = JSON.parse(call(['inspect',topic,'--json',
    join(examples,'symbol_navigation.srp')])) as Record<string,unknown>
  assert.equal(output.schema_version,1)
  assert.equal(output.kind,kind)
  assert.equal(output.span_encoding,'utf-8-bytes')
  assert.equal(output.column_encoding,'unicode-scalar')
  assert.equal(output.position_base,1)
  assert.ok(Array.isArray(output.files) && output.files.length >= 2)
  assert.ok(Array.isArray(output.symbols) && output.symbols.length > 0)
  if (topic === 'references') {
    assert.ok(Array.isArray(output.references) && output.references.length > 0)
  }
}
const bad = spawnSync(bin,['inspect','symbols','--json',
  join(examples,'missing-input.srp')],{encoding:'utf8',timeout:60000})
assert.equal(bad.status,1)
assert.equal(bad.stdout,'')
assert.ok(bad.stderr.length > 0)
console.log('PASS: published alpha.6 interpreter output, static verify, JSON navigation and failure atomicity')
