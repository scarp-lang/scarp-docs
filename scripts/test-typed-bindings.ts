import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTypedBindingsLesson } from './lib/typed-bindings-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file: string): string => readFileSync(resolve(root, file), 'utf8')
const en = read('docs/language/typed-bindings-alpha2.md')
const hi = read('docs/hi/language/typed-bindings-alpha2.md')
const cases = [
  { name: 'typed-declarations', source: read('conformance/alpha2/typed_declarations.srp'), expected: read('conformance/alpha2/typed_declarations.stdout') },
  { name: 'exact-scalar-conversions', source: read('conformance/alpha2/scalar_conversions.srp'), expected: read('conformance/alpha2/scalar_conversions.stdout') }
]
const issues = (a: string, b: string, c = cases): string[] => verifyTypedBindingsLesson(a, b, c)
assert.deepEqual(issues(en, hi), [])
assert.ok(issues(en.replace('<!-- scarp-language-release: v0.0.5-alpha.2 -->', ''), hi)
  .some(x => x.includes('release marker')))
assert.ok(issues(en, hi.replace('total += 0.5;', 'total += 0.25;'))
  .some(x => x.includes('code fences do not match')))
assert.ok(issues(en.replace('typed true 6.5', 'typed true 6.25'), hi)
  .some(x => x.includes('expected stdout')))
assert.ok(issues(en, hi.replace('scarp check typed_declarations.srp', 'scarp verify typed_declarations.srp'))
  .some(x => x.includes('missing alpha.2 CLI command')))
assert.ok(issues(en.replace('e4db8e191cd7ea623123cae7348450ca6c95b170', 'unreleased'), hi)
  .some(x => x.includes('source commit')) === false) // Same exact SHA appears twice; only one occurrence was changed.
assert.ok(issues(en.replaceAll('e4db8e191cd7ea623123cae7348450ca6c95b170', 'unreleased'), hi)
  .some(x => x.includes('source commit')))
assert.ok(issues(en, hi, cases.slice(1))
  .some(x => x.includes('wrong pinned alpha.2 fixture set')))
console.log('PASS: typed lesson contract rejects translation, source, CLI, release and stdout drift')
