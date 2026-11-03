import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateBitwiseLesson } from './lib/bitwise-lesson-evidence.ts'

type Case = { name: string; source: string; expected: string; code?: string }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Case[]; upstreamGitBlobs?: Record<string, string>; origin?: string; guide?: string }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (name: string): string => readFileSync(resolve(root, name), 'utf8')
const manifest = JSON.parse(read('conformance/alpha2-bit-errors-manifest.json')) as Manifest
const alpha2 = JSON.parse(read('conformance/alpha2-manifest.json')) as Manifest
const errors: string[] = []
const RELEASE = 'v0.0.5-alpha.2'
const SHA = 'e4db8e191cd7ea623123cae7348450ca6c95b170'
for (const data of [manifest, alpha2]) {
  if (data.compilerRepository !== 'scarp-lang/scarp' ||
      data.compilerRef !== RELEASE || data.compilerCommit !== SHA) {
    errors.push('bitwise release identity does not match published compiler tag')
  }
}
if (manifest.origin !== 'tests/fixtures/bits/' ||
    manifest.guide !== 'language/bitwise-operators-alpha2.md' ||
    manifest.cases.length !== 2 ||
    manifest.cases[0]?.name !== 'shift-count-out-of-range' ||
    manifest.cases[1]?.name !== 'invalid-binary-radix') {
  errors.push('unexpected alpha.2 bitwise negative case inventory')
}
const dir = resolve(root, 'conformance/alpha2-bit-errors')
const files = readdirSync(dir).sort()
const upstream = manifest.upstreamGitBlobs ?? {}
if (JSON.stringify(files) !== JSON.stringify(Object.keys(upstream).sort())) {
  errors.push('untracked or missing published bitwise negative source/stderr')
}
for (const name of Object.keys(upstream)) {
  if (!/^(?:shift|radix)\.(?:srp|stderr)$/.test(name)) {
    errors.push('unsafe bitwise fixture filename: ' + name)
    continue
  }
  const bytes = readFileSync(resolve(dir, name))
  const hash = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
  if (hash !== upstream[name]) errors.push('wrong published Git blob for ' + name)
  if (process.argv[2]) {
    const published = readFileSync(resolve(process.argv[2], name))
    if (!published.equals(bytes)) errors.push('local bitwise snapshot differs from official tagged source: ' + name)
  }
}
const positive = alpha2.cases.find(c => c.name === 'integer-bit-operations')
if (!positive || positive.source !== 'bit_fields.srp' || positive.expected !== 'bit_fields.stdout') {
  errors.push('published successful bit-field case missing or moved')
}
const example = positive ? [{
  name: positive.name,
  source: read('conformance/alpha2/' + positive.source),
  expected: read('conformance/alpha2/' + positive.expected)
}] : []
const failures = manifest.cases.flatMap(item => {
  if (!/^(?:shift|radix)\.srp$/.test(item.source) ||
      !/^(?:shift|radix)\.stderr$/.test(item.expected) ||
      !upstream[item.source] || !upstream[item.expected] ||
      !/^(?:E0046|E0006)$/.test(item.code ?? '')) {
    errors.push('invalid alpha.2 bitwise error case: ' + item.name)
    return []
  }
  const expected = read('conformance/alpha2-bit-errors/' + item.expected)
  if (!expected.startsWith('error[' + item.code + ']:')) {
    errors.push('wrong diagnostic code for ' + item.name)
  }
  return [{
    name: item.name,
    source: read('conformance/alpha2-bit-errors/' + item.source),
    expected
  }]
})
errors.push(...validateBitwiseLesson(
  read('docs/language/bitwise-operators-alpha2.md'),
  read('docs/hi/language/bitwise-operators-alpha2.md'),
  [...example, ...failures]
))
if (errors.length) {
  for (const error of errors) console.error('FAIL bitwise release docs: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: published bitwise program, two exact tagged diagnostics, Git blobs, English/Hindi and alpha.2 CLI')
}
