import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences } from './lib/code-fences.ts'
import { verifyTutorialExamples } from './lib/tutorial-evidence.ts'

type Case = { name: string; source: string; expected: string; supportingSources?: string[] }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Case[];
  diagnostic: { source: string; expected: string; code: string }; upstreamGitBlobs: Record<string, string>; guide: string }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const folder = join(root, 'conformance/alpha3')
const manifest = JSON.parse(readFileSync(join(root, 'conformance/alpha3-manifest.json'), 'utf8')) as Manifest
const problems: string[] = []
if (manifest.compilerRepository !== 'scarp-lang/scarp' || manifest.compilerRef !== 'v0.0.5-alpha.3' ||
    manifest.compilerCommit !== '7715c28df09c7703b39e14fddb963275b25df476' ||
    manifest.guide !== 'releases/v0.0.5-alpha.3.md') problems.push('alpha.3 published release identity changed')
if (manifest.cases.length !== 4 || new Set(manifest.cases.map(c => c.name)).size !== 4) {
  problems.push('expected exactly four unique published alpha.3 examples')
}
const safeFile = (name: string): boolean => /^(?:modules|diagnostics)\/[a-z0-9_]+\.(?:srp|stdout|diagnostic\.json)$|^[a-z0-9_]+\.(?:srp|stdout)$/.test(name)
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return files(full)
    if (!entry.isFile()) { problems.push('unexpected fixture entry ' + full); return [] }
    return [relative(folder, full).replaceAll('\\', '/')]
  })
}
const actualFiles = files(folder).sort()
const declared = Object.keys(manifest.upstreamGitBlobs).sort()
if (JSON.stringify(actualFiles) !== JSON.stringify(declared)) problems.push('alpha.3 fixture inventory mismatch')
for (const name of declared) {
  if (!safeFile(name)) { problems.push('unsafe alpha.3 fixture path: ' + name); continue }
  const bytes = readFileSync(join(folder, name))
  const sha = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
  if (sha !== manifest.upstreamGitBlobs[name]) problems.push('release blob mismatch: ' + name)
  if (process.argv[2]) {
    const upstream = readFileSync(resolve(process.argv[2], name))
    if (!bytes.equals(upstream)) problems.push('differs from alpha.3 tagged compiler checkout: ' + name)
  }
}
const used = new Set<string>()
const examples = manifest.cases.flatMap(item => {
  if (!safeFile(item.source) || !item.source.endsWith('.srp') ||
      !safeFile(item.expected) || !item.expected.endsWith('.stdout') ||
      !manifest.upstreamGitBlobs[item.source] || !manifest.upstreamGitBlobs[item.expected]) {
    problems.push('bad alpha.3 case: ' + item.name); return []
  }
  used.add(item.source); used.add(item.expected)
  const supportingSources = []
  for (const name of item.supportingSources ?? []) {
    if (!/^modules\/[a-z0-9_]+\.srp$/.test(name) || !manifest.upstreamGitBlobs[name]) {
      problems.push('bad supporting source: ' + name); continue
    }
    used.add(name)
    supportingSources.push({ name, source: readFileSync(join(folder, name), 'utf8') })
  }
  return [{ name: item.name, source: readFileSync(join(folder, item.source), 'utf8'),
    expected: readFileSync(join(folder, item.expected), 'utf8'), supportingSources }]
})
const diag = manifest.diagnostic
if (diag.code !== 'E0015' || diag.source !== 'diagnostics/type_error.srp' ||
    diag.expected !== 'diagnostics/type_error.diagnostic.json' ||
    !manifest.upstreamGitBlobs[diag.source] || !manifest.upstreamGitBlobs[diag.expected]) {
  problems.push('missing or unexpected pinned alpha.3 JSON diagnostic case')
}
used.add(diag.source); used.add(diag.expected)
for (const path of declared) if (!used.has(path)) problems.push('unused pinned release file: ' + path)
const diagnosticSource = readFileSync(join(folder, diag.source), 'utf8').trim()
const diagnosticJson = readFileSync(join(folder, diag.expected), 'utf8').trim()
const parsed = JSON.parse(diagnosticJson) as { schema_version?: number; code?: string; span_encoding?: string }
if (parsed.schema_version !== 1 || parsed.code !== diag.code || parsed.span_encoding !== 'utf-8-bytes') {
  problems.push('tagged diagnostic snapshot schema has drifted')
}
for (const locale of ['', 'hi/']) {
  const path = join(root, 'docs', locale, manifest.guide)
  const markdown = readFileSync(path, 'utf8')
  if (!markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.3 -->')) problems.push(path + ': missing release-specific CLI marker')
  problems.push(...verifyTutorialExamples(markdown, examples).map(msg => path + ': ' + msg))
  const fences = extractCodeFences(markdown)
  if (!fences.some(f => f.language === 'scarp' && f.code === diagnosticSource) ||
      !fences.some(f => f.language === 'json' && f.code === diagnosticJson)) {
    problems.push(path + ': missing exact tagged source/JSON diagnostic')
  }
}
// The first-run guide must use the SAME published program and output as CI's
// exact upstream blob evidence. A translated example must not silently drift.
const quickstartSource = readFileSync(join(folder, 'text_construction.srp'), 'utf8').trim()
const quickstartOutput = readFileSync(join(folder, 'text_construction.stdout'), 'utf8').trim()
for (const locale of ['', 'hi/']) {
  const page = join(root, 'docs', locale, 'guide/quickstart-alpha3.md')
  const markdown = readFileSync(page, 'utf8')
  const fences = extractCodeFences(markdown)
  if (!markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.3 -->')) {
    problems.push(page + ': missing release-scoped CLI marker')
  }
  if (!fences.some(f => f.language === 'scarp' && f.code === quickstartSource)) {
    problems.push(page + ': introductory program differs from published alpha.3')
  }
  if (!fences.some(f => f.language === 'text' && f.code === quickstartOutput)) {
    problems.push(page + ': expected stdout differs from published alpha.3')
  }
  for (const command of [
    'scarp version',
    'scarp verify text_construction.srp',
    'scarp exec text_construction.srp'
  ]) {
    if (!fences.some(f => ['sh', 'bash', 'shell'].includes(f.language) &&
      f.code.split(String.fromCharCode(10)).includes(command))) {
      problems.push(page + ': missing published alpha.3 command ' + command)
    }
  }
}

const legacy = JSON.parse(readFileSync(join(root, 'data/compiler-baseline.json'), 'utf8')) as { release: string }
if (legacy.release !== 'v0.0.5-alpha.1') problems.push('older verified main documentation baseline was changed silently')
if (problems.length) {
  for (const problem of problems) console.error('FAIL alpha.3 evidence: ' + problem)
  process.exit(1)
}
console.log('PASS: published alpha.3 identity, four bilingual executable fixtures, JSON diagnostic, and ' + declared.length + ' exact tagged files')
