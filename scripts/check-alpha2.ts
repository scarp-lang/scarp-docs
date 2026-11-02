import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTutorialExamples } from './lib/tutorial-evidence.ts'
import { extractCodeFences } from './lib/code-fences.ts'

type Fixture = { name: string; source: string; expected: string; supportingSources?: string[]; inspectionSnapshot?: string }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Fixture[]; pages: Array<{ page: string; cases: string[] }>; upstreamGitBlobs: Record<string, string> }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const folder = join(root, 'conformance/alpha2')
const manifest = JSON.parse(readFileSync(join(root, 'conformance/alpha2-manifest.json'), 'utf8')) as Manifest
const failures: string[] = []
if (manifest.compilerRepository !== 'scarp-lang/scarp' || manifest.compilerRef !== 'v0.0.5-alpha.2' ||
    manifest.compilerCommit !== 'e4db8e191cd7ea623123cae7348450ca6c95b170') {
  failures.push('release identity differs from the published alpha.2 tag')
}
if (manifest.cases.length < 12 || new Set(manifest.cases.map(c => c.name)).size !== manifest.cases.length) {
  failures.push('expected at least twelve unique published alpha.2 cases')
}
const safeFixture = (name: string): boolean => /^(?:modules\/)?[a-z0-9_]+\.(?:srp|stdout|modules\.json)$/.test(name)
function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return collectFiles(full)
    if (!entry.isFile()) { failures.push(`non-file in fixture directory: ${full}`); return [] }
    return [relative(folder, full).replaceAll('\\', '/')]
  })
}
const recordedFiles = collectFiles(folder).sort()
const declaredFiles = Object.keys(manifest.upstreamGitBlobs).sort()
if (JSON.stringify(recordedFiles) !== JSON.stringify(declaredFiles)) failures.push('fixture directory files differ from pinned blob inventory')
for (const name of declaredFiles) {
  if (!safeFixture(name)) { failures.push(`unsafe fixture name: ${name}`); continue }
  const bytes = readFileSync(join(folder, name))
  const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (manifest.upstreamGitBlobs[name] !== sha) failures.push(`upstream published Git blob mismatch: ${name}`)
  if (process.argv[2]) {
    const upstream = readFileSync(join(resolve(process.argv[2]), name))
    if (!upstream.equals(bytes)) failures.push(`source differs from alpha.2 release checkout: ${name}`)
  }
}
const evidence = manifest.cases.flatMap(item => {
  if (!/^[a-z0-9_]+\.srp$/.test(item.source) || !/^[a-z0-9_]+\.stdout$/.test(item.expected) ||
      !manifest.upstreamGitBlobs[item.source] || !manifest.upstreamGitBlobs[item.expected]) {
    failures.push(`invalid or unpinned case paths: ${item.name}`)
    return []
  }
  const supportingSources: Array<{ name: string; source: string }> = []
  for (const name of item.supportingSources ?? []) {
    if (!/^modules\/[a-z0-9_]+\.srp$/.test(name) || !manifest.upstreamGitBlobs[name]) {
      failures.push(`invalid or unpinned supporting file for ${item.name}: ${name}`)
      continue
    }
    supportingSources.push({ name, source: readFileSync(join(folder, name), 'utf8') })
  }
  if (item.inspectionSnapshot && (!/^[a-z0-9_]+\.modules\.json$/.test(item.inspectionSnapshot) ||
      !manifest.upstreamGitBlobs[item.inspectionSnapshot])) {
    failures.push(`invalid or unpinned JSON inspection snapshot: ${item.name}`)
  }
  return [{ name: item.name, source: readFileSync(join(folder, item.source), 'utf8'),
    expected: readFileSync(join(folder, item.expected), 'utf8'), supportingSources }]
})
const caseByName = new Map(evidence.map(item => [item.name, item]))
const seenPages = new Set<string>()
const covered = new Set<string>()
if (!Array.isArray(manifest.pages) || manifest.pages.length < 2) failures.push('missing page mapping for both alpha.2 tutorials')
for (const entry of manifest.pages ?? []) {
  if (typeof entry.page !== 'string' || !/^(?:releases|tutorials)\/[a-z0-9.-]+\.md$/.test(entry.page)) {
    failures.push(`invalid alpha.2 page path: ${entry.page}`)
    continue
  }
  if (seenPages.has(entry.page)) failures.push(`repeated alpha.2 page: ${entry.page}`)
  seenPages.add(entry.page)
  if (!Array.isArray(entry.cases) || entry.cases.length < 1) {
    failures.push(`empty case mapping for ${entry.page}`)
    continue
  }
  const grouped = []
  for (const name of entry.cases) {
    if (typeof name !== 'string' || !caseByName.has(name)) {
      failures.push(`unknown alpha.2 fixture: ${String(name)}`)
      continue
    }
    if (covered.has(name)) failures.push(`duplicate alpha.2 fixture coverage: ${name}`)
    covered.add(name)
    grouped.push(caseByName.get(name)!)
  }
  for (const locale of ['en', 'hi'] as const) {
    const path = join(root, 'docs', locale === 'hi' ? 'hi' : '', entry.page)
    const markdown = readFileSync(path, 'utf8')
    failures.push(...verifyTutorialExamples(markdown, grouped).map(problem => `${locale}/${entry.page}: ${problem}`))
    const jsonFences = extractCodeFences(markdown).filter(fence => fence.language === 'json').map(fence => fence.code)
    for (const caseName of entry.cases) {
      const item = manifest.cases.find(candidate => candidate.name === caseName)
      if (!item?.inspectionSnapshot) continue
      const snapshot = readFileSync(join(folder, item.inspectionSnapshot), 'utf8').trim()
      if (!jsonFences.includes(snapshot)) failures.push(`${locale}/${entry.page}: missing or altered tagged JSON snapshot for ${caseName}`)
    }
  }
}
for (const name of caseByName.keys()) if (!covered.has(name)) failures.push(`unmapped alpha.2 case: ${name}`)
const legacy = JSON.parse(readFileSync(join(root, 'data/compiler-baseline.json'), 'utf8')) as { release: string }
if (legacy.release !== 'v0.0.5-alpha.1') failures.push('legacy compiler baseline changed without full migration')
if (failures.length) {
  console.error(failures.map(problem => `FAIL alpha.2 evidence: ${problem}`).join('\n'))
  process.exitCode = 1
} else console.log(`PASS: ${manifest.cases.length} published alpha.2 programs and ${declaredFiles.length} pinned Git blobs have full bilingual source/output evidence across mapped pages`)
