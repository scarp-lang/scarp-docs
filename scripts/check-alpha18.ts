import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.18'
const source = '84d8de05968a488773e7c5b6eda1376d8957553c'
const publishedAt = '2026-11-22T14:19:01Z'
type Case = { source: string; localSource: string; gitBlobSha: string }
type Manifest = {
  compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string; cases?: Case[];
  historicalReferenceBaseline?: string; assets?: string[]
}
const manifest = JSON.parse(read('conformance/alpha18-manifest.json')) as Manifest
const latest = JSON.parse(read('data/compiler-latest-release.json')) as Manifest
for (const record of [manifest, latest]) {
  assert.equal(record.compilerRepository, 'scarp-lang/scarp')
  assert.equal(record.compilerRef, tag)
  assert.equal(record.compilerCommit, source)
  assert.equal(record.releasedAt, publishedAt)
  assert.equal(record.status, 'published-prerelease')
}
assert.equal(RELEASES.find(item => item.tag === tag)?.source, source)
assert.equal(LATEST_RELEASE, tag)
assert.equal(RELEASES.at(-1)?.tag, tag)
assert.equal(latest.historicalReferenceBaseline, 'v0.0.5-alpha.1')
const names = ["array_updates.srp","array_updates.stdout","lifetime_windows.srp","lifetime_windows.stdout"] as const
assert.deepEqual(manifest.cases?.map(c => c.localSource), names.map(n => 'conformance/alpha18/' + n))
for (const entry of manifest.cases ?? []) {
  assert.equal(entry.source, 'examples/' + entry.localSource.slice('conformance/alpha18/'.length))
  const bytes = readFileSync(resolve(root,entry.localSource))
  const digest = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(digest, entry.gitBlobSha, 'Tampered tagged compiler source/output: ' + entry.source)
}
const suffixes = ['x86_64-pc-windows-msvc.zip',
  'x86_64-unknown-linux-gnu.tar.gz', 'aarch64-apple-darwin.tar.gz']
assert.deepEqual(latest.assets, suffixes.map(s => 'scarp-0.0.6-alpha.18-' + s).concat('SHA256SUMS'))
for (const [prefix, label] of [['','English'],['hi/','Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const guide = read('docs/' + prefix + 'guide/exec-and-lifetime-alpha18.md')
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
  assert.ok((read('docs/hi/guide/exec-and-lifetime-alpha18.md').match(/[\u0900-\u097f]/gu) ?? []).length >= 120,
    'Hindi translation is missing')
}
for (const path of ['releases/' + tag + '.md','guide/exec-and-lifetime-alpha18.md']) {
  assert.equal(firstMissingCodeBlock(extractCodeFences(read('docs/' + path)),
    extractCodeFences(read('docs/hi/' + path))),-1,'Bilingual executable/source examples differ: ' + path)
}
assert.deepEqual(commandAdvice(tag,'exec-default').commands,['scarp exec'])
console.log('PASS: alpha18 published compiler source, pinned fixtures, bilingual docs, downloads and links')
