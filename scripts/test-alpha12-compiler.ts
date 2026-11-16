import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const executable = process.argv[2]
if (!executable) throw new Error('Usage: npm run test:alpha12-compiler -- /absolute/path/to/scarp')
const compiler = resolve(executable)
const base = resolve(root, 'conformance/alpha12')
function run(args: string[]) {
  const result = spawnSync(compiler, args, {
    cwd: root, encoding: 'utf8', timeout: 90000, maxBuffer: 2 * 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Compiler could not execute ' + args.join(' '))
  return result
}
for (const name of [
  'data_destructure','variant_validation','typed_propagation','typed_dynamic_lists',
  'persistent_list_updates','typed_maps','persistent_maps','ui_event_patterns'
]) {
  const path = resolve(base, name + '.srp')
  const verify = run(['verify', path])
  assert.equal(verify.status, 0, name + ' did not verify: ' + verify.stderr)
  const result = run(['exec', path])
  assert.equal(result.status, 0, name + ' failed: ' + result.stderr)
  assert.equal(result.stdout, readFileSync(resolve(base,name + '.stdout'),'utf8'),
    name + ' byte-exact output changed')
  assert.equal(result.stderr, '', name + ' unexpected stderr')
}
const project = resolve(base, 'projects/task-board')
const verified = run(['verify', project])
assert.equal(verified.status, 0, 'Task board verification: ' + verified.stderr)
const launched = run(['launch', project])
assert.equal(launched.status, 0, 'Task board execution: ' + launched.stderr)
assert.equal(launched.stdout, readFileSync(resolve(project, 'stdout.txt'),'utf8'),
  'Task board output differs from the published release')
assert.equal(launched.stderr, '', 'Task board unexpected stderr')
const tested = run(['test', '--require-tests', project])
assert.equal(tested.status, 0, 'Three published project tests failed: ' + tested.stderr)
console.log('PASS: alpha.12 tagged interpreter verifies and executes eight programs and the full tested task-board')
