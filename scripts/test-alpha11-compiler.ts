import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const executable = process.argv[2]
if (!executable) throw new Error('Usage: npm run test:alpha11-compiler -- /absolute/path/to/scarp')
const compiler = resolve(executable)
const fixture = (name: string, extension: string): string =>
  resolve(root, 'conformance/alpha11/' + name + extension)
function run(args: string[], input?: string) {
  const result = spawnSync(compiler, args, {
    cwd: root, input, encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Compiler invocation failed: ' + args.join(' '))
  return result
}
for (const name of ['decimal_exact', 'interactive_exact_decimal']) {
  const path = fixture(name, '.srp')
  const verify = run(['verify', path])
  assert.equal(verify.status, 0, name + ' static verification failed: ' + verify.stderr)
  const interactive = name.startsWith('interactive_')
  const input = interactive ? readFileSync(fixture(name, '.stdin'), 'utf8') : undefined
  const result = run(interactive ? ['exec', '--interactive', path] : ['exec', path], input)
  assert.equal(result.status, 0, name + ' interpreter execution failed: ' + result.stderr)
  assert.equal(result.stdout, readFileSync(fixture(name, '.stdout'), 'utf8'),
    name + ' stdout drift')
  assert.equal(result.stderr, '', name + ' unexpected diagnostic')
}
console.log('PASS: published alpha.11 interpreter verifies and executes two exact Decimal examples')
