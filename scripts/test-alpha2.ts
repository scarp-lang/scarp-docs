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
// Verify both human-readable and machine-readable module inventories against
// a single-file fixture in the published compiler. Unlike a help smoke test,
// these calls exercise compilation, source spans, and JSON serialization.
const inventory = execute(['modules', 'bit_fields.srp'])
if (inventory.error || inventory.status !== 0 || inventory.stderr?.length ||
    !inventory.stdout?.toString().includes('bit_fields.srp')) {
  failures++
  console.error(`FAIL alpha.2 text module inspection: ${inventory.error || inventory.stderr?.toString() || inventory.stdout?.toString()}`)
} else console.log('PASS alpha.2 static module inventory')

const jsonInventory = execute(['modules', '--json', 'bit_fields.srp'])
if (jsonInventory.error || jsonInventory.status !== 0 || jsonInventory.stderr?.length) {
  failures++
  console.error(`FAIL alpha.2 JSON module inspection: ${jsonInventory.error || jsonInventory.stderr?.toString() || jsonInventory.status}`)
} else {
  try {
    const parsed: unknown = JSON.parse(jsonInventory.stdout?.toString() ?? '')
    if (!parsed || typeof parsed !== 'object') throw Error('expected a JSON object')
    const report = parsed as Record<string, unknown>
    if (report.schema_version !== 1 || report.entry !== 0 || !Array.isArray(report.modules) ||
        report.modules.length !== 1 || !Array.isArray(report.constant_dependencies)) {
      throw Error('expected schema version 1, entry 0, one module and constant dependency list')
    }
    console.log('PASS alpha.2 module JSON schema and single-file graph')
  } catch (error) {
    failures++
    console.error(`FAIL alpha.2 module JSON schema: ${error instanceof Error ? error.message : String(error)}`)
  }
}
if (failures) process.exit(1)
console.log(`PASS: all ${manifest.cases.length} published alpha.2 programs and four CLI/inspection checks`)
