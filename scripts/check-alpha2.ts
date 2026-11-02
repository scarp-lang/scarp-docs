import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTutorialExamples } from './lib/tutorial-evidence.ts'

type Fixture = { name: string; source: string; expected: string }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Fixture[]; upstreamGitBlobs: Record<string, string> }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const folder = join(root, 'conformance/alpha2')
const manifest = JSON.parse(readFileSync(join(root, 'conformance/alpha2-manifest.json'), 'utf8')) as Manifest
const failures: string[] = []
if (manifest.compilerRepository !== 'scarp-lang/scarp' || manifest.compilerRef !== 'v0.0.5-alpha.2' ||
    manifest.compilerCommit !== 'e4db8e191cd7ea623123cae7348450ca6c95b170') {
  failures.push('release identity differs from the published alpha.2 tag')
}
if (manifest.cases.length < 5 || new Set(manifest.cases.map(c => c.name)).size !== manifest.cases.length) {
  failures.push('expected at least five unique published alpha.2 cases')
}
const recordedFiles = readdirSync(folder).sort()
const declaredFiles = Object.keys(manifest.upstreamGitBlobs).sort()
if (JSON.stringify(recordedFiles) !== JSON.stringify(declaredFiles)) failures.push('fixture directory files differ from pinned blob inventory')
for (const name of declaredFiles) {
  if (!/^[a-z0-9_]+\.(?:srp|stdout)$/.test(name)) { failures.push(`unsafe fixture name: ${name}`); continue }
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
  return [{ name: item.name, source: readFileSync(join(folder, item.source), 'utf8'), expected: readFileSync(join(folder, item.expected), 'utf8') }]
})
for (const path of ['docs/releases/v0.0.5-alpha.2.md','docs/hi/releases/v0.0.5-alpha.2.md']) {
  failures.push(...verifyTutorialExamples(readFileSync(join(root, path), 'utf8'), evidence).map(problem => `${path}: ${problem}`))
}
const legacy = JSON.parse(readFileSync(join(root, 'data/compiler-baseline.json'), 'utf8')) as { release: string }
if (legacy.release !== 'v0.0.5-alpha.1') failures.push('legacy compiler baseline changed without full migration')
if (failures.length) {
  console.error(failures.map(problem => `FAIL alpha.2 evidence: ${problem}`).join('\n'))
  process.exitCode = 1
} else console.log(`PASS: ${manifest.cases.length} published alpha.2 programs and ${declaredFiles.length} pinned Git blobs have full bilingual source/output evidence`)
