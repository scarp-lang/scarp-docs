import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const executable = process.argv[2]
if (!executable) throw new Error('Usage: npm run test:alpha10-compiler -- /absolute/path/to/scarp')
const compiler = resolve(executable)
const fixture = (name: string, extension: string): string =>
  resolve(root, 'conformance/alpha10/' + name + extension)
function run(args: string[], input?: string) {
  const result = spawnSync(compiler, args, {
    cwd: root, input, encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Compiler process failed: ' + args.join(' '))
  return result
}
for (const name of ['fixed_arrays', 'interactive_greeting', 'interactive_typed_calculator']) {
  const source = fixture(name, '.srp')
  const verify = run(['verify', source])
  assert.equal(verify.status, 0, name + ' static verification: ' + verify.stderr)
  const interactive = name.startsWith('interactive_')
  const input = interactive ? readFileSync(fixture(name, '.stdin'), 'utf8') : undefined
  const args = interactive ? ['exec', '--interactive', source] : ['exec', source]
  const result = run(args, input)
  assert.equal(result.status, 0, name + ' published interpreter execution: ' + result.stderr)
  assert.equal(result.stdout, readFileSync(fixture(name, '.stdout'), 'utf8'),
    name + ': byte-exact upstream stdout changed')
  assert.equal(result.stderr, '', name + ': unexpected diagnostic')
}
console.log('PASS: exact alpha.10 compiler verifies and executes tagged arrays and both interactive programs')
