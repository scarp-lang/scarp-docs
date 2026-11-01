import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { compilerRef, cases } = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as { compilerRef: string; cases: Array<{name: string; source: string; expected: string}> }
const binary = process.argv[2]
if (!binary) {
  console.error('Usage: npm run test:compiler -- <path-to-scarp-binary>')
  process.exit(2)
}
const exe = resolve(binary)
const workdir = resolve(root, 'conformance/programs')
let failed = 0

function call(args: string[]) {
  return spawnSync(exe, args, { cwd: workdir, encoding: null, maxBuffer: 10 * 1024 * 1024, timeout: 30000 })
}
const version = call(['--version'])
if (version.error || version.status !== 0 || !version.stdout?.toString().includes(compilerRef.slice(1))) {
  console.error(`Compiler mismatch: expected ${compilerRef}, got ${version.stdout?.toString() || version.error || version.status}`)
  process.exit(1)
}
for (const { name, source, expected } of cases) {
  const want = readFileSync(resolve(workdir, expected))
  const checked = call(['check', source])
  const run = call(['run', source])
  if (checked.error || checked.status !== 0 || checked.stdout?.length || checked.stderr?.length) {
    console.error(`FAIL ${name}: check must succeed silently: ${checked.error || checked.stderr?.toString()}`)
    failed++
  } else if (run.error || run.status !== 0 || run.stderr?.length || !run.stdout?.equals(want)) {
    console.error(`FAIL ${name}: run mismatch\n  error: ${run.error || run.stderr?.toString()}\n  expected: ${JSON.stringify(want.toString())}\n  received: ${JSON.stringify(run.stdout?.toString())}`)
    failed++
  } else console.log(`PASS ${name} (check and byte-exact run)`)
}
const tokens = call(['tokens', 'hello.srp'])
if (tokens.error || tokens.status !== 0 || !tokens.stdout?.toString().includes('identifier(print)')) {
  console.error('FAIL tokens smoke test')
  failed++
} else console.log('PASS tokens smoke test')
if (failed) process.exit(1)
console.log(`PASS: all ${cases.length} conformance cases matched the published compiler`)
