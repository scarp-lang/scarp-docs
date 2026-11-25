import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { currentDocumentationSources } from './lib/current-publication.ts'
import { documentationPages } from './lib/docs-pages.ts'
import { validateCompilerEvidence, type CompilerReleaseEvidence } from './lib/compiler-release-drift.ts'
import { announcementContracts, announcementIssues, archiveDigestIssues, releaseAnnouncementIssues } from './lib/current-release-announcements.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const manifest = JSON.parse(read('data/compiler-latest-release.json')) as CompilerReleaseEvidence
const hub = 'https://scarp-lang.github.io/downloads/'
assert.equal(manifest.status, 'published-prerelease')
assert.deepEqual(validateCompilerEvidence(manifest), [], 'Invalid published download evidence')
const announcements = releaseAnnouncementIssues(read, manifest.compilerRef)
assert.deepEqual(announcements, [], announcements.join('\n'))

for (const locale of ['', 'hi/']) {
  const guide = read('docs/' + locale + 'guide/install-latest.md')
  const release = read('docs/' + locale + 'releases/' + manifest.compilerRef + '.md')
  for (const page of [guide, release]) {
    assert.deepEqual(archiveDigestIssues(page,manifest), [], locale + 'archive checksums drifted')
  }
  const home = read('docs/' + locale + 'index.md')
  const intro = read('docs/' + locale + 'guide/introduction.md')
  const status = read('docs/' + locale + 'reference/status.md')
  assert.ok(guide.includes(manifest.compilerRef), locale + 'current guide has stale compiler version')
  for (const platform of ['windows','linux','macos']) {
    assert.ok(guide.includes(hub + platform + '/latest'),
      locale + 'current guide missing permanent ' + platform + ' download')
  }
  for (const page of [guide, home, intro, status]) {
    assert.ok(page.includes(hub), locale + 'entrypoint is missing the official download hub')
  }
  assert.ok(home.includes('guide/install-latest'), locale + 'home is missing current installer')
  assert.ok(!home.includes('v0.0.5-alpha.1'), locale + 'home still advertises retired compiler baseline')
}
const active = currentDocumentationSources(documentationPages(resolve(root, 'docs')), manifest.compilerRef)
for (const locale of ['', 'hi/']) {
  assert.ok(active.includes(locale + 'guide/install-latest.md'), 'Current installer is not discoverable: ' + locale)
  assert.ok(active.includes(locale + 'releases/' + manifest.compilerRef + '.md'), 'Current release is not discoverable: ' + locale)
}
assert.ok(active.every(source => !source.includes('v0.0.5-alpha.1')), 'Retired baseline is discoverable')
const renderer = read('scripts/scarp-site/build.ts')
assert.ok(renderer.includes(hub), 'Scarp-owned HTML renderer missing downloads link')
assert.ok(renderer.includes("BASE+'guide/install-latest'"), 'Scarp-owned HTML renderer missing current English install route')
assert.ok(renderer.includes("BASE+'hi/guide/install-latest'"), 'Scarp-owned HTML renderer missing current Hindi install route')
const readme = read('README.md')
assert.ok(readme.includes('**Latest published compiler:** [' + manifest.compilerRef + ']'))
assert.ok(readme.includes(hub))
assert.ok(readme.includes('docs/guide/install-latest.md'))
assert.ok(readme.includes('docs/hi/guide/install-latest.md'))
// Regression mutations are checked against the real current source rather than
// requiring maintainers to hand-edit another release-specific test fixture.
const contract = announcementContracts(manifest.compilerRef)[0]
const original = read(contract.path)
const stale = 'v0.0.0-alpha.1'
assert.ok(announcementIssues(original.replace(contract.expected,contract.expected.replace(manifest.compilerRef,stale)),contract.marker,contract.expected).length)
assert.ok(announcementIssues(original.replace(contract.expected,contract.expected.replace('/tag/'+manifest.compilerRef,'/tag/'+stale)),contract.marker,contract.expected).length)
const line = original.split(/\r?\n/).find(value=>contract.marker.test(value))!
assert.ok(announcementIssues(original+'\n'+line,contract.marker,contract.expected).length)
assert.ok(announcementIssues(original.replace(line,''),contract.marker,contract.expected).length)
assert.deepEqual(announcementIssues(original+'\nHistorical: '+stale,contract.marker,contract.expected),[])
const installer = read('docs/guide/install-latest.md')
const archive = manifest.assets.find(name=>name.endsWith('.zip'))!
const digest = manifest.assetDigests[archive].slice(7)
const archiveRow = installer.split(/\r?\n/).find(value=>value.startsWith('|') && value.includes(archive))!
assert.ok(archiveDigestIssues(installer.replace(digest,'0'.repeat(64)),manifest).length)
assert.ok(archiveDigestIssues(installer.replace(archiveRow,''),manifest).length)
assert.ok(archiveDigestIssues(installer+'\n'+archiveRow,manifest).length)
console.log('PASS: '+announcementContracts(manifest.compilerRef).length+' current release announcements, bilingual archive digests, official download entrypoints and 8 regression mutations')
