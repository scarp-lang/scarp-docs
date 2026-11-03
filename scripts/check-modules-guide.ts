import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateModuleGuide } from './lib/modules-guide-evidence.ts'
import type { ExecutableExample } from './lib/tutorial-evidence.ts'

interface Case { name: string; source: string; expected: string; supportingSources?: string[]; inspectionSnapshot?: string }
interface Manifest { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Case[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const alpha1 = JSON.parse(read('conformance/manifest.json')) as Manifest
const alpha2 = JSON.parse(read('conformance/alpha2-manifest.json')) as Manifest
const errorsManifest = JSON.parse(read('conformance/alpha2-errors-manifest.json')) as Manifest
const issues: string[] = []
const identities = [
  [alpha1, 'v0.0.5-alpha.1', 'afe8b5380c9d6c4774162e51c6c9bc8b90901671'],
  [alpha2, 'v0.0.5-alpha.2', 'e4db8e191cd7ea623123cae7348450ca6c95b170'],
  [errorsManifest, 'v0.0.5-alpha.2', 'e4db8e191cd7ea623123cae7348450ca6c95b170']
] as const
for (const [m, tag, sha] of identities) {
  if (m.compilerRepository !== 'scarp-lang/scarp' || m.compilerRef !== tag || m.compilerCommit !== sha) {
    issues.push('module evidence compiler identity drift: ' + tag)
  }
}
const pick = (manifest: Manifest, name: string): Case | null => {
  const item = manifest.cases.find(c => c.name === name)
  if (!item) issues.push('missing published module case ' + name)
  return item ?? null
}
const safe = (name: string, ending: 'srp' | 'stdout' | 'stderr'): boolean =>
  new RegExp('^(?:modules/)?[a-z0-9_]+\\.' + ending + '$').test(name)

function loadCase(manifest: Manifest, name: string, folder: string, knownSupport?: readonly string[]): ExecutableExample {
  const item = pick(manifest, name)
  if (!item || !safe(item.source, 'srp') ||
      !(safe(item.expected, 'stdout') || safe(item.expected, 'stderr'))) {
    issues.push('missing or unsafe module source/output ' + name)
    return { name, source: '', expected: '' }
  }
  const supporting = knownSupport ?? item.supportingSources ?? []
  if (supporting.some(path => !safe(path, 'srp'))) issues.push('unsafe module dependency in ' + name)
  return {
    name,
    source: read(folder + '/' + item.source),
    expected: read(folder + '/' + item.expected),
    supportingSources: supporting.map(path => ({ name: path, source: read(folder + '/' + path) }))
  }
}

const alpha1Module = loadCase(alpha1, 'modules', 'conformance/programs', [
  'modules/settings.srp', 'modules/linear.srp'
])
alpha1Module.name = 'modules-alpha1'
if (alpha1Module.source.trim() !== read('conformance/programs/module_demo.srp').trim()) {
  issues.push('alpha.1 module entry source drift')
}
const inspection = loadCase(alpha2, 'static-module-introspection', 'conformance/alpha2')
const jsonCase = loadCase(alpha2, 'inspection-json-schema', 'conformance/alpha2')
const privateCase = loadCase(errorsManifest, 'private-imported-member', 'conformance/alpha2-errors')
const cycle = loadCase(errorsManifest, 'cyclic-module-import', 'conformance/alpha2-errors')
for (const [source, expected] of [[privateCase, 'E0041'], [cycle, 'E0039']] as const) {
  if (!source.expected.startsWith('error[' + expected + ']:')) issues.push('wrong tagged ' + expected + ' module error')
}

issues.push(...validateModuleGuide(
  read('docs/language/modules-and-visibility.md'),
  read('docs/hi/language/modules-and-visibility.md'),
  [alpha1Module, inspection, jsonCase, privateCase, cycle],
  read('conformance/alpha2/inspection_json.modules.json')
))
if (issues.length) {
  for (const issue of issues) console.error('FAIL module guide: ' + issue)
  process.exitCode = 1
} else {
  console.log('PASS: alpha.1 imports + alpha.2 inspection/visibility, 5 exact bilingual cases and JSON snapshot')
}
