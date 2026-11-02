import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

type Case = { name: string; source: string; expected: string; code: string; supportingSources?: string[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const rootFixtures = resolve(root, 'conformance/alpha2-errors')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/alpha2-errors-manifest.json'), 'utf8')) as { compilerRef: string; cases: Case[] }
const executable = process.argv[2] ? resolve(process.argv[2]) : null
if (!executable) { console.error('Usage: npm run test:alpha2-errors -- /path/to/scarp'); process.exit(2) }
function invoke(args: string[], cwd: string) {
  return spawnSync(executable!, args, { cwd, encoding: null, maxBuffer: 1024 * 1024, timeout: 30000 })
}
const version = invoke(['--version'], rootFixtures)
if (version.error || version.status !== 0 || !version.stdout?.toString().includes(manifest.compilerRef.slice(1))) {
  throw Error('Expected published compiler ' + manifest.compilerRef + ', got ' + String(version.stdout?.toString() || version.error || version.status))
}
let failures = 0
for (const item of manifest.cases) {
  const directory = resolve(rootFixtures, dirname(item.source))
  const source = basename(item.source)
  const expected = readFileSync(resolve(rootFixtures, item.expected))
  for (const action of ['check', 'run']) {
    const result = invoke([action, source], directory)
    // Native filesystem loaders show absolute paths for imported modules,
    // whereas the compiler's own in-memory golden fixtures use short labels.
    // Only normalize the exact resolved paths of declared tagged support files;
    // every remaining byte of the published diagnostic must still agree.
    let received = result.stderr?.toString('utf8') ?? ''
    for (const path of item.supportingSources ?? []) {
      received = received.replaceAll(resolve(rootFixtures, path), basename(path))
    }
    if (result.error || result.status !== 1 || result.stdout?.length || received !== expected.toString('utf8')) {
      failures++
      console.error('FAIL ' + action + ' ' + item.name + ': expected status=1, stdout empty, byte-exact stderr ' + item.code)
      console.error('received status=' + result.status + ', stdout=' + JSON.stringify(result.stdout?.toString()) + ', normalized stderr=' + JSON.stringify(received) + ', error=' + String(result.error))
    } else {
      console.log('PASS ' + action + ' ' + item.name + ': exact published ' + item.code + ' diagnostic')
    }
  }
}
const unknown = invoke(['explain', 'E9999'], rootFixtures)
if (unknown.error || unknown.status !== 2 || unknown.stdout?.length || !unknown.stderr?.length) {
  failures++
  console.error('FAIL unknown diagnostic code should return usage status 2 with stderr and no stdout')
} else console.log('PASS unknown explain code produces usage error')
if (failures) process.exit(1)
console.log('PASS: ' + manifest.cases.length + ' release-backed failure cases tested via both run and check, plus CLI error behavior')
