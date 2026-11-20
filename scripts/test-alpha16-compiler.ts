import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) {
  throw new Error('Usage: npm run test:alpha16-compiler -- /absolute/path/to/scarp')
}
const compiler = resolve(process.argv[2])
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const directory = mkdtempSync(join(tmpdir(), 'scarp-alpha16-docs-'))
function run(args: string[]): string {
  const result = spawnSync(compiler, args, {
    cwd: directory, encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Unable to run published compiler')
  assert.equal(result.status, 0, args.join(' ') + ': ' + result.stderr)
  assert.equal(result.stderr, '', args.join(' ') + ': unexpected stderr')
  return result.stdout
}
try {
  assert.equal(run(['version']), 'scarp 0.0.6-alpha.16\n')
  mkdirSync(join(directory, 'modules'))
  const cases = ['order_statistics', 'core_collections']
  for (const name of cases) {
    writeFileSync(join(directory, name + '.srp'),
      readFileSync(join(root, 'conformance/alpha16/' + name + '.srp'), 'utf8'))
  }
  writeFileSync(join(directory, 'modules/collection_tools.srp'),
    readFileSync(join(root, 'conformance/alpha16/modules/collection_tools.srp'), 'utf8'))
  for (const name of cases) {
    assert.equal(run(['verify', name + '.srp']), '', name + ' must verify silently')
    assert.equal(run(['exec', name + '.srp']),
      readFileSync(join(root, 'conformance/alpha16/' + name + '.stdout'), 'utf8'),
      name + ' expected output mismatch')
  }
} finally {
  rmSync(directory, { recursive: true, force: true })
}
console.log('PASS: published alpha.16 executes both tagged statistics and Unicode/module programs')
