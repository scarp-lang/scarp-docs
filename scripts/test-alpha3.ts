import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Case = { name: string; source: string; expected: string }
type Manifest = { compilerRef: string; cases: Case[]; diagnostic: { source: string; expected: string; code: string } }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/alpha3-manifest.json'), 'utf8')) as Manifest
const binary = process.argv[2] ? resolve(process.argv[2]) : null
if (!binary) { console.error('Usage: npm run test:alpha3 -- /path/to/alpha3/scarp'); process.exit(2) }
const workdir = resolve(root, 'conformance/alpha3')
const run = (args: string[], cwd = workdir) => spawnSync(binary, args, { cwd, encoding: null, maxBuffer: 8 * 1024 * 1024, timeout: 30000 })
let failures = 0
function good(label: string, args: string[], mustInclude?: string, cwd = workdir): Buffer | null {
  const result = run(args, cwd)
  if (result.error || result.status !== 0 || result.stderr?.length ||
      (mustInclude !== undefined && !result.stdout?.toString().includes(mustInclude))) {
    failures++
    console.error('FAIL alpha.3 ' + label + ': status=' + result.status + ', error=' + result.error + ', stderr=' + result.stderr?.toString())
    return null
  }
  console.log('PASS alpha.3 ' + label)
  return result.stdout ?? Buffer.alloc(0)
}
const version = good('version', ['version'], manifest.compilerRef.slice(1))
const versionFlag = good('version flag', ['--version'], manifest.compilerRef.slice(1))
if (!version || !versionFlag || !version.equals(versionFlag)) { failures++; console.error('FAIL alpha.3 version/--version mismatch') }
for (const item of manifest.cases) {
  const expected = readFileSync(resolve(workdir, item.expected))
  const verified = run(['verify', item.source])
  const executed = run(['exec', item.source])
  const legacy = run(['run', item.source])
  if (verified.error || verified.status !== 0 || verified.stdout?.length || verified.stderr?.length ||
      executed.error || executed.status !== 0 || executed.stderr?.length || !executed.stdout?.equals(expected) ||
      legacy.error || legacy.status !== 0 || legacy.stderr?.length || !legacy.stdout?.equals(expected)) {
    failures++
    console.error('FAIL alpha.3 program ' + item.name + ': verify=' + verified.status + ', exec=' + executed.status +
      ', run=' + legacy.status + ', expected=' + JSON.stringify(expected.toString()) +
      ', actual=' + JSON.stringify(executed.stdout?.toString()) + ', stderr=' + executed.stderr?.toString())
  } else console.log('PASS alpha.3 ' + item.name + ': static verify, byte-exact exec and legacy run')
}
const report = good('offline diagnostic inventory', ['diagnose', '--json'])
if (report) {
  try {
    const json = JSON.parse(report.toString()) as { schema_version?: number }
    if (json.schema_version !== 1 || !report.toString().includes('0.0.5-alpha.3')) throw Error('missing published version/schema')
  } catch (err) { failures++; console.error('FAIL alpha.3 diagnose JSON: ' + String(err)) }
}
good('CLI contextual guide', ['guide', 'exec'], 'scarp exec')
good('lexer inspection', ['inspect', 'tokens', 'text_construction.srp'], 'print')
const ast = good('parser-only AST inspection', ['inspect', 'ast', 'text_construction.srp'])
if (!ast?.length) { failures++; console.error('FAIL alpha.3 AST output empty') }
const modules = good('source-module JSON inspection', ['inspect', 'modules', '--json', 'collection_module.srp'])
if (modules) {
  try {
    const json = JSON.parse(modules.toString()) as { schema_version?: number; modules?: unknown[] }
    if (json.schema_version !== 1 || !Array.isArray(json.modules) || json.modules.length !== 2) {
      throw Error('expected schema 1 and two-module source graph')
    }
  } catch (err) { failures++; console.error('FAIL alpha.3 module JSON inspection: ' + String(err)) }
}
const diag = manifest.diagnostic
const diagnosticsDir = resolve(workdir, 'diagnostics')
const typedError = run(['verify', '--diagnostic-format=json', 'type_error.srp'], diagnosticsDir)
if (typedError.error || typedError.status !== 1 || typedError.stdout?.length) {
  failures++; console.error('FAIL alpha.3 structured compiler diagnostic exit/streams: ' + String(typedError.status))
} else {
  try {
    const actual = JSON.parse(typedError.stderr?.toString() ?? '') as { schema_version?: number; code?: string; severity?: string; primary?: unknown }
    const fixture = JSON.parse(readFileSync(resolve(workdir, diag.expected), 'utf8')) as typeof actual
    if (actual.schema_version !== fixture.schema_version || actual.code !== diag.code ||
        actual.severity !== 'error' || !actual.primary) throw Error('missing expected published E0015 diagnostic metadata')
    console.log('PASS alpha.3 JSON diagnostic error schema and E0015 code')
  } catch (err) { failures++; console.error('FAIL alpha.3 diagnostic JSON: ' + String(err)) }
}
good('source-free diagnostic explanation', ['explain', 'E0015'], 'E0015')
if (failures) process.exit(1)
console.log('PASS: 4 published alpha.3 programs, exact output, Scarp-first CLI and JSON diagnosis')
