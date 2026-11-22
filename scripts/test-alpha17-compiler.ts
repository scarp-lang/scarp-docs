import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) throw new Error('Usage: npm run test:alpha17-compiler -- /absolute/path/to/scarp')
const binary = resolve(process.argv[2])
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const work = mkdtempSync(join(tmpdir(), 'scarp-docs-alpha17-'))
const fixture = (path: string): string => readFileSync(join(root, 'conformance/alpha17', path), 'utf8')
const names = ['array_traversal.srp', 'interactive/boolean_prompt.srp', 'interactive/boolean_prompt.stdin'] as const
function run(args: string[]): { stdout: string; stderr: string } {
  const result = spawnSync(binary, args, { cwd: work, encoding: 'utf8', timeout: 30000,
    maxBuffer: 2 * 1024 * 1024 })
  assert.equal(result.error, undefined, 'Cannot execute pinned published compiler')
  assert.equal(result.status, 0, args.join(' ') + ': ' + result.stderr)
  return { stdout: result.stdout, stderr: result.stderr }
}
try {
  for (const name of names) {
    const output = join(work, name)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, fixture(name), 'utf8')
  }
  assert.equal(run(['version']).stdout, 'scarp 0.0.6-alpha.17\n')
  assert.equal(run(['verify', 'array_traversal.srp']).stdout, '')
  assert.equal(run(['exec', 'array_traversal.srp']).stdout, fixture('array_traversal.stdout'))
  assert.equal(run(['verify', 'interactive/boolean_prompt.srp']).stdout, '')
  const prompt = run(['exec', '--interactive', '--input-file', 'interactive/boolean_prompt.stdin',
    'interactive/boolean_prompt.srp'])
  assert.equal(prompt.stdout, fixture('interactive/boolean_prompt.stdout'),
    'The published Boolean input output must match every UTF-8 byte')
  assert.equal(prompt.stderr, '')
} finally {
  rmSync(work, { recursive: true, force: true })
}
console.log('PASS: exact alpha.17 array traversal and typed Boolean terminal input')
