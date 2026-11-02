import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Fixture = { name: string; source: string; expected: string }
type Manifest = { compilerRef: string; compilerCommit: string; cases: Fixture[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const old = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as Manifest
const newer = JSON.parse(readFileSync(resolve(root, 'conformance/alpha2-manifest.json'), 'utf8')) as Manifest
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8')) as { release: string }
const executable = process.argv[2] ? resolve(process.argv[2]) : null
if (!executable) {
  console.error('Usage: npm run test:alpha2-backcompat -- /path/to/alpha2/scarp')
  process.exit(2)
}
if (old.compilerRef !== 'v0.0.5-alpha.1' || old.compilerCommit !== 'afe8b5380c9d6c4774162e51c6c9bc8b90901671' ||
    baseline.release !== old.compilerRef || newer.compilerRef !== 'v0.0.5-alpha.2' ||
    newer.compilerCommit !== 'e4db8e191cd7ea623123cae7348450ca6c95b170') {
  throw Error('Versioned source identities changed; review the upgrade test before proceeding')
}
if (old.cases.length !== 11 || new Set(old.cases.map(item => item.name)).size !== 11) {
  throw Error('Expected exactly eleven uniquely named original alpha.1 examples')
}
const workdir = resolve(root, 'conformance/programs')
const run = (args: string[]) => spawnSync(executable!, args, {
  cwd: workdir, encoding: null, timeout: 30000, maxBuffer: 10 * 1024 * 1024
})
const version = run(['--version'])
if (version.error || version.status !== 0 || !version.stdout?.toString().includes(newer.compilerRef.slice(1))) {
  console.error('Backcompat requires the published alpha.2 interpreter, got ' + String(version.stdout?.toString() || version.error || version.status))
  process.exit(1)
}
let failures = 0
for (const fixture of old.cases) {
  const expected = readFileSync(resolve(workdir, fixture.expected))
  const checked = run(['check', fixture.source])
  if (checked.error || checked.status !== 0 || checked.stdout?.length || checked.stderr?.length) {
    failures++
    console.error('FAIL alpha.1 -> alpha.2 check: ' + fixture.name + ', status=' + checked.status + ', stderr=' + checked.stderr?.toString())
    continue
  }
  const executed = run(['run', fixture.source])
  if (executed.error || executed.status !== 0 || executed.stderr?.length || !executed.stdout?.equals(expected)) {
    failures++
    console.error('FAIL alpha.1 -> alpha.2 run: ' + fixture.name + ', status=' + executed.status +
      ', expected=' + JSON.stringify(expected.toString()) + ', received=' + JSON.stringify(executed.stdout?.toString()) +
      ', stderr=' + executed.stderr?.toString())
    continue
  }
  console.log('PASS alpha.1 -> alpha.2: ' + fixture.name + ' (silent check and byte-exact stdout)')
}
const tokens = run(['tokens', 'hello.srp'])
if (tokens.error || tokens.status !== 0 || !tokens.stdout?.toString().includes('identifier(print)')) {
  failures++
  console.error('FAIL alpha.1 -> alpha.2: original hello.srp tokenization')
} else {
  console.log('PASS alpha.1 -> alpha.2: tokenization smoke check')
}
if (failures) process.exit(1)
console.log('PASS: 11 original alpha.1 programs and tokens smoke test remain executable on the published alpha.2 compiler')
