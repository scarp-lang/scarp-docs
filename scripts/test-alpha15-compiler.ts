import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

if (!process.argv[2]) throw new Error('Usage: npm run test:alpha15-compiler -- /absolute/path/to/scarp')
const compiler = resolve(process.argv[2])
const directory = mkdtempSync(join(tmpdir(), 'scarp-alpha15-docs-'))
try {
  const source = join(directory, 'hello.srp')
  writeFileSync(source, 'bind left = "नमस्ते";\nbind right = "नमस्ते";\nprint(left == right);\nprint(left != right);\n')
  const commands: Array<{args: string[]; output: string}> = [
    {args: ['verify', source], output: ''},
    {args: ['exec', source], output: 'true\nfalse\n'}
  ]
  for (const command of commands) {
    const result = spawnSync(compiler, command.args, {
      encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024
    })
    assert.equal(result.error, undefined, 'Unable to run published compiler')
    assert.equal(result.status, 0, command.args.join(' ') + ': ' + result.stderr)
    assert.equal(result.stderr, '', 'unexpected stderr')
    assert.equal(result.stdout, command.output, 'unexpected interpreter stdout')
  }

  const oversized = join(directory, 'oversized.srp')
  writeFileSync(oversized, '//' + 'x'.repeat(1024 * 1024))
  for (const args of [
    ['inspect', 'tokens', oversized],
    ['inspect', 'ast', oversized],
    ['tokens', oversized]
  ]) {
    const result = spawnSync(compiler, args, {
      encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024
    })
    assert.equal(result.error, undefined, 'Unable to run inspect command')
    assert.notEqual(result.status, 0, 'Oversized input must fail: ' + args.join(' '))
  }
} finally {
  rmSync(directory, {recursive: true, force: true})
}
console.log('PASS: alpha.15 interpreter and one-MiB CLI source inspection bounds')
