import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTutorialExamples } from './lib/tutorial-evidence.ts'

type Case = { name: string; source: string; expected: string; code: string; supportingSources?: string[] }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; origin: string; page: string; cases: Case[]; upstreamGitBlobs: Record<string, string> }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const folder = resolve(root, 'conformance/alpha2-errors')
const manifest = JSON.parse(readFileSync(join(root, 'conformance/alpha2-errors-manifest.json'), 'utf8')) as Manifest
const failures: string[] = []
const isSafe = (name: string): boolean => /^(?:scalar_text|constants|modules)\/[a-z0-9_]+\.(?:srp|stderr)$/.test(name)
if (manifest.compilerRepository !== 'scarp-lang/scarp' || manifest.compilerRef !== 'v0.0.5-alpha.2' ||
    manifest.compilerCommit !== 'e4db8e191cd7ea623123cae7348450ca6c95b170' ||
    manifest.origin !== 'tests/fixtures/' || manifest.page !== 'tutorials/alpha2-diagnostics-and-repairs.md') {
  failures.push('published alpha.2 diagnostic provenance differs from pinned release')
}
function allFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return allFiles(path)
    if (!entry.isFile()) { failures.push('unexpected fixture entry: ' + path); return [] }
    return [relative(folder, path).replaceAll('\\', '/')]
  })
}
const onDisk = allFiles(folder).sort()
const blobs = Object.keys(manifest.upstreamGitBlobs).sort()
if (JSON.stringify(onDisk) !== JSON.stringify(blobs)) failures.push('unrecorded or missing alpha.2 diagnostic fixtures')
for (const name of blobs) {
  if (!isSafe(name)) { failures.push('unsafe fixture path: ' + name); continue }
  const bytes = readFileSync(join(folder, name))
  const hash = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
  if (hash !== manifest.upstreamGitBlobs[name]) failures.push('published Git blob mismatch: ' + name)
  if (process.argv[2]) {
    const path = resolve(process.argv[2], name)
    if (!statSync(path).isFile() || !readFileSync(path).equals(bytes)) failures.push('published release checkout differs: ' + name)
  }
}
if (!Array.isArray(manifest.cases) || manifest.cases.length !== 6 ||
    new Set(manifest.cases.map(item => item.name)).size !== 6) failures.push('expected six unique diagnostic cases')
const cases = []
const used = new Set<string>()
for (const entry of manifest.cases) {
  if (!isSafe(entry.source) || !entry.source.endsWith('.srp') || !isSafe(entry.expected) ||
      !entry.expected.endsWith('.stderr') || !manifest.upstreamGitBlobs[entry.source] ||
      !manifest.upstreamGitBlobs[entry.expected] || !/^E\d{4}$/.test(entry.code)) {
    failures.push('invalid diagnostic case identity or file paths: ' + entry.name)
    continue
  }
  const expected = readFileSync(join(folder, entry.expected), 'utf8')
  if (!expected.startsWith('error[' + entry.code + ']: ')) failures.push('unexpected error code in tagged stderr: ' + entry.name)
  const supportingSources = []
  for (const path of entry.supportingSources ?? []) {
    if (!isSafe(path) || !path.endsWith('.srp') || !manifest.upstreamGitBlobs[path]) {
      failures.push('invalid imported fixture source: ' + path); continue
    }
    supportingSources.push({ name: path, source: readFileSync(join(folder, path), 'utf8') })
    used.add(path)
  }
  cases.push({ name: entry.name, source: readFileSync(join(folder, entry.source), 'utf8'), expected, supportingSources })
  used.add(entry.source)
  used.add(entry.expected)
}
for (const path of blobs) if (!used.has(path)) failures.push('orphaned diagnostic fixture blob: ' + path)
for (const locale of ['en', 'hi'] as const) {
  const path = join(root, 'docs', locale === 'hi' ? 'hi' : '', manifest.page)
  const page = readFileSync(path, 'utf8')
  failures.push(...verifyTutorialExamples(page, cases).map(error => locale + ': ' + error))
}
const baseline = JSON.parse(readFileSync(join(root, 'data/compiler-baseline.json'), 'utf8')) as { release: string }
if (baseline.release !== 'v0.0.5-alpha.1') failures.push('original alpha.1 documentation baseline changed unexpectedly')
if (failures.length) {
  for (const error of failures) console.error('FAIL alpha.2 diagnostics: ' + error)
  process.exit(1)
}
console.log('PASS: ' + cases.length + ' published failed-program examples and ' + blobs.length + ' tagged files match complete bilingual source/stderr fences')
