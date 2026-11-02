import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkCountClaims, type CountClaim } from './lib/coverage-statistics.ts'

interface Case { name: string; source: string; expected: string }
interface Manifest { cases: Case[]; upstreamGitBlobs: Record<string, string> }

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as Manifest
const caseCount = manifest.cases.length
const fileCount = Object.keys(manifest.upstreamGitBlobs).length
const cases = new Set(manifest.cases.map(x => x.name))
if (cases.size !== caseCount) throw Error('duplicate fixture case names')

const counts = (values: Array<[string, RegExp, number]>): CountClaim[] =>
  values.map(([label, pattern, expected]) => ({ label, pattern, expected }))

const files: Record<string, CountClaim[]> = {
  'README.md': counts([
    ['tutorial coverage', /requires all (\d+) pinned examples/, caseCount],
    ['conformance inventory', /contains (\d+) pinned source\/output pairs/, caseCount]
  ]),
  'docs/reference/evidence.md': counts([
    ['pinned files', /all (\d+) mirrored files/, fileCount],
    ['executed examples', /on (\d+) examples/, caseCount],
    ['tutorial programs', /all (\d+) compiler programs/, caseCount]
  ]),
  'docs/hi/reference/evidence.md': counts([
    ['प्रकाशित उदाहरण', /(\d+) प्रकाशित Scarp उदाहरणों की \d+ source\/output फ़ाइलों/, caseCount],
    ['प्रमाणित फ़ाइलें', /\d+ प्रकाशित Scarp उदाहरणों की (\d+) source\/output फ़ाइलों/, fileCount],
    ['सभी जोड़े', /सभी (\d+) स्रोत-आउटपुट जोड़ों/, caseCount]
  ]),
  'docs/examples/index.md': counts([
    ['executed samples', /tests (\d+) `\.srp` programs/, caseCount],
    ['mirrored programs', /All (\d+) mirrored compiler programs/, caseCount]
  ]),
  'docs/hi/examples/index.md': counts([
    ['कार्यक्रम', /(\d+) कार्यक्रमों/, caseCount],
    ['conformance', /(\d+) conformance उदाहरण/, caseCount]
  ]),
  'docs/hi/project/maintenance.md': counts([
    ['संकलित उदाहरण', /(\d+) copied examples/, caseCount]
  ])
}

const problems: string[] = []
let total = 0
for (const [path, rules] of Object.entries(files)) {
  const source = readFileSync(resolve(root, path), 'utf8')
  problems.push(...checkCountClaims(source, rules).map(problem => `${path}: ${problem}`))
  total += rules.length
}
if (problems.length) {
  console.error(`FAIL: ${problems.length} stale/missing fixture count claims:\n${problems.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${total} bilingual coverage claims match ${caseCount} executable fixtures and ${fileCount} pinned compiler files`)
}
