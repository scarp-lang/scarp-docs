import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

type Case = { name: string; source: string; expected: string; code: string }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/alpha2-bit-errors-manifest.json'), 'utf8')) as
  { compilerRef: string; compilerCommit: string; cases: Case[] }
if (!process.argv[2]) {
  console.error('Usage: npm run test:bitwise-alpha2 -- /path/to/published/scarp')
  process.exit(2)
}
const executable = resolve(process.argv[2])
const directory = resolve(root, 'conformance/alpha2-bit-errors')
const invoke = (args: string[]) => spawnSync(executable, args, {
  cwd: directory, encoding: null, timeout: 30000, maxBuffer: 1024 * 1024
})
const version = invoke(['--version'])
if (version.error || version.status !== 0 ||
    !version.stdout?.toString().includes(manifest.compilerRef.slice(1))) {
  throw new Error('bitwise diagnostic test needs published ' + manifest.compilerRef + ' executable')
}
let failures = 0
for (const c of manifest.cases) {
  const source = basename(c.source)
  const stderr = readFileSync(resolve(directory, c.expected))
  for (const mode of ['check', 'run'] as const) {
    const actual = invoke([mode, source])
    if (actual.error || actual.status !== 1 || actual.stdout?.length ||
        !actual.stderr?.equals(stderr) || !stderr.toString().startsWith('error[' + c.code + ']:')) {
      failures++
      console.error('FAIL ' + mode + ' ' + c.name + ': expected status=1, stdout empty, byte-exact stderr ' + c.code)
      console.error(JSON.stringify({
        status: actual.status,
        stdout: actual.stdout?.toString(),
        stderr: actual.stderr?.toString(),
        error: String(actual.error)
      }))
    } else {
      console.log('PASS ' + mode + ' ' + c.name + ': exact ' + c.code + ', stdout empty')
    }
  }
}
if (failures) process.exit(1)
console.log('PASS: all alpha.2 shift/radix failure cases are release-tested through check and run')
