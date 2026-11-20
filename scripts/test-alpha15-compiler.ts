import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { extractCodeFences } from './lib/code-fences.ts'

if (!process.argv[2]) throw new Error('Usage: npm run test:alpha15-compiler -- /absolute/path/to/scarp')
const compiler = resolve(process.argv[2])
const directory = mkdtempSync(join(tmpdir(), 'scarp-alpha15-docs-'))
function run(args: string[], cwd = directory) {
  const result = spawnSync(compiler, args, {
    cwd, encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024
  })
  assert.equal(result.error, undefined, 'Unable to run published compiler')
  return result
}

try {
  assert.equal(run(['version']).stdout, 'scarp 0.0.6-alpha.15\n')
  const source = join(directory, 'hello.srp')
  writeFileSync(source, 'bind left = "नमस्ते";\nbind right = "नमस्ते";\nprint(left == right);\nprint(left != right);\n')
  const commands: Array<{args: string[]; output: string}> = [
    {args: ['verify', source], output: ''},
    {args: ['exec', source], output: 'true\nfalse\n'}
  ]
  for (const command of commands) {
    const result = run(command.args)
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
    const result = run(args)
    assert.notEqual(result.status, 0, 'Oversized input must fail: ' + args.join(' '))
  }

  const project = join(directory, 'greetings')
  const init = run(['init', 'greetings'])
  assert.equal(init.status, 0, init.stderr)
  const page = new URL('../docs/tooling/project-testing-alpha15.md', import.meta.url)
  const localized = new URL('../docs/hi/tooling/project-testing-alpha15.md', import.meta.url)
  const examples = (url: URL) => extractCodeFences(readFileSync(url, 'utf8'))
    .filter(block => block.language === 'scarp').map(block => block.code)
  const example = examples(page)
  assert.equal(example.length, 1)
  assert.deepEqual(examples(localized), example)
  writeFileSync(join(project, 'tests/greeting.srp'), example[0] + '\n')
  writeFileSync(join(project, 'tests/greeting.stdin'), 'नमस्ते\n')
  writeFileSync(join(project, 'tests/greeting.stdout'), 'नमस्ते\n')
  const expectedStderr = join(project, 'tests/greeting.stderr')
  writeFileSync(expectedStderr, 'done\n')

  const args = ['test', '--json=v2', '--require-tests', '--filter', 'greeting']
  const passing = run(args, project)
  assert.equal(passing.status, 0, passing.stderr)
  assert.equal(passing.stderr, '')
  assert.deepEqual(JSON.parse(passing.stdout), {
    schema_version: 2, mode: 'run', discovered: 1, passed: 1, failed: 0,
    tests: [{path: 'tests/greeting.srp', status: 'passed'}]
  })

  writeFileSync(expectedStderr, 'done')
  const failing = run(args, project)
  assert.equal(failing.status, 1, failing.stderr)
  assert.equal(failing.stderr, '')
  const failure = JSON.parse(failing.stdout).tests[0]
  assert.equal(failure.phase, 'runtime')
  assert.match(failure.diagnostic.message, /stderr differs from \.stderr at byte 4/)
} finally {
  rmSync(directory, {recursive: true, force: true})
}
console.log('PASS: alpha.15 interpreter, CLI source inspection bounds and bilingual project testing guide')
