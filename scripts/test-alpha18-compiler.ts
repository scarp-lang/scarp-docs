import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) throw new Error('Usage: npm run test:alpha18-compiler -- /absolute/path/to/scarp')
const binary = resolve(process.argv[2])
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const work = mkdtempSync(join(tmpdir(), 'scarp-docs-alpha18-'))
const fixture = (path: string): string => readFileSync(join(root, 'conformance/alpha18', path), 'utf8')
function invoke(args: string[], cwd: string = work) {
  const result = spawnSync(binary, args, { cwd, encoding: 'utf8', timeout: 30000,
    maxBuffer: 2 * 1024 * 1024 })
  assert.equal(result.error, undefined, 'Cannot execute published alpha.18 binary')
  return result
}
function run(args: string[], cwd: string = work): string {
  const result = invoke(args, cwd)
  assert.equal(result.status, 0, args.join(' ') + ': ' + result.stderr)
  assert.equal(result.stderr, '', 'unexpected stderr: ' + args.join(' '))
  return result.stdout
}
try {
  for (const name of ['array_updates', 'lifetime_windows']) {
    writeFileSync(join(work, name + '.srp'), fixture(name + '.srp'), 'utf8')
  }
  assert.equal(run(['version']), 'scarp 0.0.6-alpha.18\n')
  for (const name of ['array_updates', 'lifetime_windows']) {
    assert.equal(run(['verify', name + '.srp']), '')
    assert.equal(run(['exec', name + '.srp']), fixture(name + '.stdout'),
      'Tagged immutable example output differs: ' + name)
  }
  const defaultFolder = join(work, 'default')
  mkdirSync(defaultFolder)
  writeFileSync(join(defaultFolder,'main.srp'), 'print("root entry");\n')
  assert.equal(run(['exec'], defaultFolder), 'root entry\n')
  mkdirSync(join(defaultFolder,'src'))
  writeFileSync(join(defaultFolder,'src/main.srp'), 'print("src entry");\n')
  assert.equal(run(['exec'], defaultFolder), 'src entry\n',
    'src/main.srp must win when no manifest is present')
  assert.equal(run(['exec','main.srp'], defaultFolder), 'root entry\n',
    'Explicit source paths must continue to win over automatic selection')
  writeFileSync(join(defaultFolder,'scarp.project'), 'this is not a valid manifest\n')
  const invalid = invoke(['exec'], defaultFolder)
  assert.notEqual(invalid.status, 0, 'Malformed manifest must be a hard error')
  assert.equal(invalid.stdout, '', 'Invalid manifest must not execute a fallback program')
} finally {
  rmSync(work, { recursive: true, force: true })
}
console.log('PASS: exact alpha.18 array and Lifetime fixtures, default entrypoints and manifest failure')
