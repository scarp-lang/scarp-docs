import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const executable = process.argv[2]
if (!executable) throw new Error('Usage: npm run test:alpha13-compiler -- /absolute/path/to/scarp')
const compiler = resolve(executable)
function run(args: string[]) {
  const result = spawnSync(compiler, args, {
    cwd: root, encoding: 'utf8', timeout: 90000, maxBuffer: 2 * 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Compiler could not execute ' + args.join(' '))
  return result
}
for (const [dir, names] of [
  ['alpha13', ["revision_range_snapshot","revision_ceiling_snapshot","map_projection_snapshots","aggregate_resource_boundaries"]],
  ['alpha12', [
    'data_destructure','variant_validation','typed_propagation','typed_dynamic_lists',
    'persistent_list_updates','typed_maps','persistent_maps','ui_event_patterns'
  ]]
] as const) {
  for (const name of names) {
    const base = resolve(root, 'conformance', dir, name)
    const verify = run(['verify', base + '.srp'])
    assert.equal(verify.status, 0, dir + '/' + name + ' verification: ' + verify.stderr)
    const result = run(['exec', base + '.srp'])
    assert.equal(result.status, 0, dir + '/' + name + ' execution: ' + result.stderr)
    assert.equal(result.stdout, readFileSync(base + '.stdout', 'utf8'), name + ' byte-exact stdout')
    assert.equal(result.stderr, '', name + ' unexpected stderr')
  }
}
const project = resolve(root, 'conformance/alpha12/projects/task-board')
const verified = run(['verify', project])
assert.equal(verified.status, 0, 'Task board verification: ' + verified.stderr)
const launched = run(['launch', project])
assert.equal(launched.status, 0, 'Task board execution: ' + launched.stderr)
assert.equal(launched.stdout, readFileSync(resolve(project, 'stdout.txt'), 'utf8'))
assert.equal(launched.stderr, '', 'Task board unexpected stderr')
const tests = run(['test', '--require-tests', project])
assert.equal(tests.status, 0, 'Three task-board tests failed: ' + tests.stderr)
console.log('PASS: alpha.13 interpreter verifies and executes 12 programs and the alpha.12 project regression')
