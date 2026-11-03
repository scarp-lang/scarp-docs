import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateReleaseStatusPages, type StatusSources } from './lib/release-status.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const sources: StatusSources = {
  baseline: JSON.parse(read('data/compiler-baseline.json')) as StatusSources['baseline'],
  alpha2: JSON.parse(read('conformance/alpha2-manifest.json')) as StatusSources['alpha2'],
  alpha3: JSON.parse(read('conformance/alpha3-manifest.json')) as StatusSources['alpha3']
}
const en = read('docs/reference/status.md')
const hi = read('docs/hi/reference/status.md')
const check = (e: string, h: string, s = sources): string[] => validateReleaseStatusPages(e, h, s)
assert.deepEqual(check(en, hi), [])
assert.ok(check(en.replace('<!-- scarp-release-status: v0.0.5-alpha.3 -->', ''), hi)
  .some(problem => problem.includes('current-release marker')))
assert.ok(check(en.replaceAll(sources.alpha3.compilerCommit, 'not-published'), hi)
  .some(problem => problem.includes('source commit')))
assert.ok(check(en.replaceAll('**12**', '**13**'), hi)
  .some(problem => problem.includes('evidence count')))
assert.ok(check(en, hi.replaceAll('/hi/tooling/cli-alpha1', '/hi/tooling/cli-old'))
  .some(problem => problem.includes('related reference')))
assert.ok(check(en.replace('bit_fields.srp', 'invented_feature.srp'), hi)
  .some(problem => problem.includes('exactly one tagged row')))
assert.ok(check(en, hi.replace('text_construction.srp', 'wrong_source.srp'))
  .some(problem => problem.includes('exactly one tagged row')))
const extended: StatusSources = {
  ...sources,
  alpha3: { ...sources.alpha3, cases: [...sources.alpha3.cases, {name: 'future',source:'not-released.srp'}] }
}
assert.ok(check(en, hi, extended).some(problem => problem.includes('not-released.srp')))
console.log('PASS: release-status validator detects source, version, row, translation and count drift')
