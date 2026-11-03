import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const executable = process.argv[2] ? resolve(process.argv[2]) : ''
if (!executable) {
  console.error('Usage: npm run test:module-inspection-alpha2 -- /absolute/path/to/scarp')
  process.exit(2)
}
const folder = resolve(root, 'conformance/alpha2')
const failures: string[] = []
function invoke(args: string[], cwd = folder) {
  return spawnSync(executable, args, { cwd, encoding: null, timeout: 30000, maxBuffer: 1024 * 1024 })
}
const version = invoke(['--version'])
if (version.error || version.status !== 0 || !version.stdout?.toString().includes('0.0.5-alpha.2')) {
  throw new Error('module inspection contract must use the official tagged alpha.2 compiler')
}
const text = invoke(['modules', 'module_inspection.srp'])
const summary = text.stdout?.toString('utf8') ?? ''
for (const expected of [
  'modules: 2, imports: 1',
  'import tools =',
  'pub bind label: string',
  'private bind offset: integer',
  'pub pure funcra adjusted(',
  'private pure funcra helper('
]) {
  if (!summary.includes(expected)) failures.push('static inventory missing ' + expected)
}
if (text.error || text.status !== 0 || text.stderr?.length ||
    summary.includes('module tools 42')) {
  failures.push('plain module inspector must not execute the entry print or report diagnostics')
}
const actualRun = invoke(['run', 'module_inspection.srp'])
const expectedRun = readFileSync(resolve(folder, 'module_inspection.stdout'))
if (actualRun.error || actualRun.status !== 0 || actualRun.stderr?.length ||
    !actualRun.stdout?.equals(expectedRun)) {
  failures.push('actual module execution differs from the published stdout')
}

const metadata = invoke(['modules', '--json', 'module_inspection.srp'])
if (metadata.error || metadata.status !== 0 || metadata.stderr?.length) {
  failures.push('static JSON module inspection failed')
} else {
  try {
    const parsed = JSON.parse(metadata.stdout!.toString('utf8')) as {
      schema_version: number
      entry: number
      modules: Array<{
        symbols: Array<{ name: string; public: boolean; kind: string; pure?: boolean }>
        imports: Array<{ alias: string; target: number }>
        dependencies: number[]
      }>
    }
    if (parsed.schema_version !== 1 || parsed.entry !== 0 || parsed.modules.length !== 2) {
      failures.push('JSON module graph has wrong schema, entry or number of sources')
    }
    const exported = parsed.modules.find(m => m.symbols.some(s => s.name === 'adjusted'))
    if (!exported) failures.push('module JSON inventory omits imported library')
    else {
      const symbols = new Map(exported.symbols.map(s => [s.name, s]))
      for (const [name, isPublic, kind] of [
        ['label', true, 'constant'], ['offset', false, 'constant'],
        ['adjusted', true, 'function'], ['helper', false, 'function']
      ] as const) {
        const item = symbols.get(name)
        if (!item || item.public !== isPublic || item.kind !== kind) {
          failures.push('incorrect JSON module symbol visibility/type: ' + name)
        }
      }
      for (const name of ['adjusted', 'helper']) {
        if (symbols.get(name)?.pure !== true) {
          failures.push('incorrect pure function metadata: ' + name)
        }
      }
    }
    const entry = parsed.modules[parsed.entry]
    if (!entry || entry.imports.length !== 1 || entry.imports[0].alias !== 'tools' ||
        entry.dependencies.length !== 1 || entry.dependencies[0] !== entry.imports[0].target) {
      failures.push('wrong import alias or module dependency edge')
    }
  } catch (cause) {
    failures.push('invalid module JSON metadata: ' + String(cause))
  }
}
const errorsDir = resolve(root, 'conformance/alpha2-errors/modules')
for (const [name, code] of [['private.srp', 'E0041'], ['cycle.srp', 'E0039']] as const) {
  for (const mode of ['modules', 'modules-json'] as const) {
    const args = mode === 'modules' ? ['modules', name] : ['modules', '--json', name]
    const result = invoke(args, errorsDir)
    const error = result.stderr?.toString('utf8') ?? ''
    if (result.error || result.status !== 1 || result.stdout?.length || !error.startsWith('error[' + code + ']:')) {
      failures.push(mode + ' must reject ' + name + ' with ' + code + ' and empty stdout')
    }
  }
}
if (failures.length) {
  for (const issue of failures) console.error('FAIL module inspection: ' + issue)
  process.exit(1)
}
console.log('PASS: tagged alpha.2 static modules text/JSON inventory, visibility and purity, real run, private and cyclic rejection')
