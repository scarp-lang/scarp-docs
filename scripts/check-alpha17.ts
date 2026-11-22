import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.17'
const source = '7831a37939965f557ce746e1d86bf82d3d629f74'
const publishedAt = '2026-11-21T03:44:23Z'
type Case = { source: string; localSource: string; gitBlobSha: string }
type Manifest = {
  compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string; cases?: Case[];
  historicalReferenceBaseline?: string; assets?: string[]
}
const manifest = JSON.parse(read('conformance/alpha17-manifest.json')) as Manifest
for (const record of [manifest]) {
  assert.equal(record.compilerRepository, 'scarp-lang/scarp')
  assert.equal(record.compilerRef, tag)
  assert.equal(record.compilerCommit, source)
  assert.equal(record.releasedAt, publishedAt)
  assert.equal(record.status, 'published-prerelease')
}
assert.equal(RELEASES.find(item => item.tag === tag)?.source, source)
assert.notEqual(LATEST_RELEASE, tag)
const names = ["array_traversal.srp","array_traversal.stdout","interactive/boolean_prompt.srp","interactive/boolean_prompt.stdin","interactive/boolean_prompt.stdout"] as const
assert.deepEqual(manifest.cases?.map(c => c.localSource), names.map(n => 'conformance/alpha17/' + n))
for (const entry of manifest.cases ?? []) {
  assert.equal(entry.source, 'examples/' + entry.localSource.slice('conformance/alpha17/'.length))
  const bytes = readFileSync(resolve(root,entry.localSource))
  const digest = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(digest, entry.gitBlobSha, 'Tampered tagged compiler source/output: ' + entry.source)
}
const suffixes = ['x86_64-pc-windows-msvc.zip',
  'x86_64-unknown-linux-gnu.tar.gz', 'aarch64-apple-darwin.tar.gz']

for (const [prefix, label] of [['','English'],['hi/','Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const guide = read('docs/' + prefix + 'language/array-traversal-alpha17.md')
  for (const page of [release, guide]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'), label + ' release marker')
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'), label + ' compiler source marker')
  }
  for (const entry of manifest.cases ?? []) {
    assert.ok(release.includes(read(entry.localSource).trimEnd()), label + ' release fixture ' + entry.source)
    assert.ok(guide.includes(read(entry.localSource).trimEnd()), label + ' guide fixture ' + entry.source)
  }
  for (const suffix of suffixes) {
    const archive = 'scarp-' + tag.slice(1) + '-' + suffix
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + archive
    assert.ok(release.includes('](' + url + ')'), label + ' package missing: ' + archive)
    assert.ok(release.includes('](' + url + '.sha256)'), label + ' SHA-256 missing: ' + archive)
  }
  assert.ok(release.includes('SHA256SUMS'))
  for (const path of ['index.md','guide/introduction.md','guide/learning-path.md',
    'reference/status.md','reference/compatibility.md','tooling/command-finder.md']) {
    assert.ok(read('docs/' + prefix + path).includes('/' + prefix + 'releases/' + tag),
      label + ' missing release route: ' + path)
  }
  assert.ok(read('docs/' + prefix + 'reference/status.md').includes(source),
    label + ' status omits exact tagged source')
  assert.ok((read('docs/hi/' + 'language/array-traversal-alpha17.md').match(/[\\u0900-\\u097f]/gu) ?? []).length >= 120,
    'Hindi translation is missing')
}
for (const path of ['releases/' + tag + '.md','language/array-traversal-alpha17.md']) {
  assert.equal(firstMissingCodeBlock(extractCodeFences(read('docs/' + path)),
    extractCodeFences(read('docs/hi/' + path))),-1,'Bilingual executable/source examples differ: ' + path)
}
assert.equal(commandAdvice(tag,'exec-default').supported,false)
console.log('PASS: alpha17 published compiler source, pinned fixtures, bilingual docs, downloads and links')
