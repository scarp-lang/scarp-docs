import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

interface Case { name: string; source: string; expected: string }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/alpha2-manifest.json'), 'utf8')) as { compilerRef: string; cases: Case[] }
const binary = process.argv[2]
if (!binary) { console.error('Usage: npm run test:alpha2 -- /path/to/scarp'); process.exit(2) }
const executable = resolve(binary)
const workdir = resolve(root, 'conformance/alpha2')
const execute = (args: string[]) => spawnSync(executable, args, { cwd: workdir, encoding: null, maxBuffer: 10 * 1024 * 1024, timeout: 30000 })
const version = execute(['--version'])
if (version.error || version.status !== 0 || !version.stdout?.toString().includes(manifest.compilerRef.slice(1))) {
  throw Error(`expected published ${manifest.compilerRef} interpreter; got ${version.stdout?.toString() || version.error || version.status}`)
}
let failures = 0
for (const item of manifest.cases) {
  const check = execute(['check', item.source])
  const run = execute(['run', item.source])
  const expected = readFileSync(resolve(workdir, item.expected))
  if (check.error || check.status !== 0 || check.stdout?.length || check.stderr?.length ||
      run.error || run.status !== 0 || run.stderr?.length || !run.stdout?.equals(expected)) {
    failures++
    console.error(`FAIL alpha.2 ${item.name}: check=${check.status} (${check.stderr?.toString()}); run=${run.status} (${run.stderr?.toString()}); expected=${JSON.stringify(expected.toString())}; actual=${JSON.stringify(run.stdout?.toString())}`)
  } else console.log(`PASS alpha.2 ${item.name}: check and byte-exact run`)
}
// Released alpha.2 also exposes additive source-free diagnostics and static module inspection.
// These smoke tests intentionally avoid claiming the module inventory is a full runtime execution.
for (const [label, args] of [
  ['module inspection help', ['modules', '--help']],
  ['source-free diagnostic explanation', ['explain', 'E0044']]
] as const) {
  const response = execute([...args])
  if (response.error || response.status !== 0 || !response.stdout?.length || response.stderr?.length) {
    failures++
    console.error(`FAIL alpha.2 ${label}: ${response.error || response.stderr?.toString() || response.status}`)
  } else console.log(`PASS alpha.2 ${label}`)
}
if (failures) process.exit(1)
console.log(`PASS: all ${manifest.cases.length} published alpha.2 programs and two CLI checks`)
