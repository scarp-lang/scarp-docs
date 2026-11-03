import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateReleaseStatusPages, type StatusSources } from './lib/release-status.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const load = (path: string): unknown => JSON.parse(read(path))
const sources: StatusSources = {
  baseline: load('data/compiler-baseline.json') as StatusSources['baseline'],
  alpha2: load('conformance/alpha2-manifest.json') as StatusSources['alpha2'],
  alpha3: load('conformance/alpha3-manifest.json') as StatusSources['alpha3']
}
const problems = validateReleaseStatusPages(
  read('docs/reference/status.md'), read('docs/hi/reference/status.md'), sources
)
if (problems.length) {
  for (const problem of problems) console.error('FAIL released feature status: ' + problem)
  process.exitCode = 1
} else {
  console.log('PASS: alpha.1 baseline, all 12 alpha.2 and 4 alpha.3 tagged examples, English/Hindi feature-status parity')
}
