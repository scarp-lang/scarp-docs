import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateModuleGuide } from './lib/modules-guide-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f: string): string => readFileSync(resolve(root, f), 'utf8')
const en = read('docs/language/modules-and-visibility.md')
const hi = read('docs/hi/language/modules-and-visibility.md')
const snap = read('conformance/alpha2/inspection_json.modules.json')
const cases = [
  {
    name: 'modules-alpha1',
    source: read('conformance/programs/module_demo.srp'),
    expected: read('conformance/programs/module_demo.stdout'),
    supportingSources: ['modules/settings.srp', 'modules/linear.srp']
      .map(name => ({ name, source: read('conformance/programs/' + name) }))
  },
  {
    name: 'static-module-introspection',
    source: read('conformance/alpha2/module_inspection.srp'),
    expected: read('conformance/alpha2/module_inspection.stdout'),
    supportingSources: [{ name: 'modules/inspection.srp', source: read('conformance/alpha2/modules/inspection.srp') }]
  },
  {
    name: 'inspection-json-schema',
    source: read('conformance/alpha2/inspection_json.srp'),
    expected: read('conformance/alpha2/inspection_json.stdout')
  },
  {
    name: 'private-imported-member',
    source: read('conformance/alpha2-errors/modules/private.srp'),
    expected: read('conformance/alpha2-errors/modules/private.stderr'),
    supportingSources: [{ name: 'modules/library.srp', source: read('conformance/alpha2-errors/modules/library.srp') }]
  },
  {
    name: 'cyclic-module-import',
    source: read('conformance/alpha2-errors/modules/cycle.srp'),
    expected: read('conformance/alpha2-errors/modules/cycle.stderr'),
    supportingSources: [{ name: 'modules/loop.srp', source: read('conformance/alpha2-errors/modules/loop.srp') }]
  }
]
const check = (a: string, b: string, j = snap) => validateModuleGuide(a, b, cases, j)
assert.deepEqual(check(en, hi), [])
assert.ok(check(en.replace('<!-- scarp-modules-release: v0.0.5-alpha.1+v0.0.5-alpha.2 -->', ''), hi)
  .some(x => x.includes('release marker')))
assert.ok(check(en, hi.replace('pub bind gain = 1.0;', 'pub bind gain = 2.0;'))
  .some(x => x.includes('English/Hindi source')))
assert.ok(check(en.replace('Modular inference\n[4.0, 1.0]', 'Modular inference\n[5.0, 1.0]'), hi)
  .some(x => x.includes('modules-alpha1')))
assert.ok(check(en.replace('module tools 42', 'module tools 41'), hi)
  .some(x => x.includes('static-module-introspection')))
assert.ok(check(en, hi.replace('error[E0041]', 'error[E0040]'))
  .some(x => x.includes('private-imported-member')))
assert.ok(check(en.replace('error[E0039]', 'error[E0038]'), hi)
  .some(x => x.includes('cyclic-module-import')))
assert.ok(check(en.replace('scarp modules --json inspection_json.srp', 'scarp inspect inspection_json.srp'), hi)
  .some(x => x.includes('command sequence')))
assert.ok(check(en, hi.replace('"schema_version":1', '"schema_version":2'))
  .some(x => x.includes('JSON inspection snapshot')))
assert.ok(check(en.replaceAll('e4db8e191cd7ea623123cae7348450ca6c95b170', 'unreleased'), hi)
  .some(x => x.includes('compiler identity')))
assert.ok(validateModuleGuide(en, hi, cases.slice(1), snap)
  .some(x => x.includes('missing, reordered')))
console.log('PASS: modules guide regression checks catch release, imports, API visibility, stdout, JSON and CLI drift')
