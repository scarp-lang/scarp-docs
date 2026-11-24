import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { comparePublishedCompiler, latestPublishedCompiler, compareCompilerEvidence, requiredCompilerAssets, validateCompilerEvidence, resolveCompilerTag } from './lib/compiler-release-drift.ts'

const alpha5 = {
  tag_name: 'v0.0.5-alpha.5', prerelease: true, draft: false,
  published_at: '2026-11-04T11:59:57Z'
}
const alpha4 = {
  tag_name: 'v0.0.5-alpha.4', prerelease: true, draft: false,
  published_at: '2026-11-03T13:16:44Z'
}
const source = '398b8ff705154a02423fe458ce3a427401e81e31'
const alpha6 = {
  tag_name: 'v0.0.6-alpha.1', prerelease: true, draft: false,
  published_at: '2026-11-05T11:39:49Z'
}
const alpha62 = {tag_name:'v0.0.6-alpha.2',prerelease:true,draft:false,published_at:'2026-11-06T11:03:46Z'}
assert.equal(latestPublishedCompiler([alpha4, alpha5, alpha6, alpha62])?.tag_name, alpha62.tag_name)
assert.deepEqual(comparePublishedCompiler([alpha4, alpha5, alpha6, alpha62], alpha62.tag_name, source, source), [])
assert.ok(comparePublishedCompiler([
  { ...alpha62, tag_name: 'v0.0.6-alpha.3', published_at: '2026-11-07T08:00:00Z' }, alpha62
], alpha62.tag_name, source, source).some(x => x.includes('Update and re-test')))
assert.ok(comparePublishedCompiler([alpha5, alpha6], alpha62.tag_name, source, '0'.repeat(40))
  .some(x => x.includes('differs')))
assert.ok(comparePublishedCompiler([alpha5, alpha6], alpha5.tag_name, 'invalid')
  .some(x => x.includes('Invalid pinned')))
assert.equal(latestPublishedCompiler([
  { ...alpha5, draft: true },
  { ...alpha4, tag_name: 'unknown-version' },
  alpha4
])?.tag_name, alpha4.tag_name)
assert.deepEqual(comparePublishedCompiler([], alpha62.tag_name, source),
  ['No parseable published Scarp compiler release found'])
console.log('PASS: remote compiler release gate handles prereleases, stable tags, drafts, tags drift and source SHA')

const tag = 'v0.0.6-alpha.20'
const commit = 'b1a9347f93540fdf95b0ddecba4adc55a3b4bb98'
const assets = requiredCompilerAssets(tag)
const evidence = {
  compilerRepository: 'scarp-lang/scarp',
  compilerRef: tag,
  compilerCommit: commit,
  releasedAt: '2026-11-24T02:58:58Z',
  status: 'published-prerelease',
  assets,
  assetDigests: Object.fromEntries(assets.map((name, index) => [
    name, 'sha256:' + (index + 1).toString(16).repeat(64)
  ]))
}
const published = {
  tag_name: tag, prerelease: true, draft: false,
  published_at: evidence.releasedAt,
  assets: assets.map(name => ({ name, state: 'uploaded', size: 100, digest: evidence.assetDigests[name] }))
}
assert.equal(assets.length, 7)
assert.equal(new Set(assets).size, 7)
assert.deepEqual(validateCompilerEvidence(evidence), [])
assert.deepEqual(compareCompilerEvidence([published], evidence, commit), [])
assert.deepEqual(validateCompilerEvidence(JSON.parse(readFileSync(new URL('../data/compiler-latest-release.json', import.meta.url), 'utf8'))), [])
assert.ok(compareCompilerEvidence([published], evidence).some(x => x.includes('did not resolve')))
assert.ok(compareCompilerEvidence([published], evidence, 'f'.repeat(40)).some(x => x.includes('source SHA differs')))
assert.ok(compareCompilerEvidence([{ ...published, published_at: '2026-11-24T03:00:00Z' }], evidence, commit).some(x => x.includes('timestamp')))
assert.ok(compareCompilerEvidence([{ ...published, prerelease: false }], evidence, commit).some(x => x.includes('prerelease status')))
assert.ok(compareCompilerEvidence([{ ...published, assets: undefined }], evidence, commit).some(x => x.includes('inventory unavailable')))
for (const name of assets) {
  const filtered = published.assets.filter(a => a.name !== name)
  assert.ok(compareCompilerEvidence([{ ...published, assets: filtered }], evidence, commit).some(x => x.includes(name)), 'missing: ' + name)
  const duplicates = [...published.assets, published.assets.find(a => a.name === name)]
  assert.ok(compareCompilerEvidence([{ ...published, assets: duplicates }], evidence, commit).some(x => x.includes(name)), 'duplicate: ' + name)
  for (const replacement of [{ digest: null }, { digest: 'sha256:' + '0'.repeat(64) }, { size: 0 }, { state: 'new' }]) {
    const mutated = published.assets.map(a => a.name === name ? { ...a, ...replacement } : a)
    assert.ok(compareCompilerEvidence([{ ...published, assets: mutated }], evidence, commit).some(x => x.includes(name)), 'mutated: ' + name)
  }
  const missingDigest = { ...evidence.assetDigests }
  delete missingDigest[name]
  assert.ok(validateCompilerEvidence({ ...evidence, assetDigests: missingDigest }).some(x => x.includes(name)))
}
assert.ok(validateCompilerEvidence({ ...evidence, assets: [...assets, assets[0]] }).some(x => x.includes('inventory')))
assert.ok(validateCompilerEvidence({ ...evidence, status: 'published-stable' }).some(x => x.includes('status')))
assert.ok(validateCompilerEvidence({ ...evidence, compilerRepository: 'other/scarp' }).some(x => x.includes('repository')))
assert.ok(validateCompilerEvidence({ ...evidence, assetDigests: { ...evidence.assetDigests, 'unrelated.zip': 'sha256:' + '1'.repeat(64) } }).some(x => x.includes('unexpected entries')))
assert.throws(() => requiredCompilerAssets('../malicious'))
const next = { ...published, tag_name: 'v0.0.7-alpha.1', published_at: '2026-11-25T00:00:00Z', assets: [] }
const drift = compareCompilerEvidence([published, next], evidence, commit)
assert.equal(drift.length, 1)
assert.match(drift[0], /v0\.0\.7-alpha\.1/)

const first = 'a'.repeat(40)
const second = 'b'.repeat(40)
const fetchTag = async (sha: string) => ({ object: sha === first
  ? { type: 'tag', sha: second } : { type: 'commit', sha: commit } })
assert.equal(await resolveCompilerTag({ type: 'commit', sha: commit }, fetchTag), commit)
assert.equal(await resolveCompilerTag({ type: 'tag', sha: first }, fetchTag), commit)
await assert.rejects(() => resolveCompilerTag({ type: 'tag', sha: first }, async () =>
  ({ object: { type: 'tag', sha: first } })), /Cyclic/)
await assert.rejects(() => resolveCompilerTag({ type: 'blob', sha: first }, fetchTag), /not a commit/)
await assert.rejects(() => resolveCompilerTag({ type: 'tag', sha: 'bad' }, fetchTag), /Invalid/)
await assert.rejects(() => resolveCompilerTag({ type: 'tag', sha: first }, async () => null), /Invalid annotated/)
let counter = 0
await assert.rejects(() => resolveCompilerTag({ type: 'tag', sha: first }, async () =>
  ({ object: { type: 'tag', sha: (++counter).toString(16).padStart(40, '0') } })), /maximum resolution depth/)
console.log('PASS: all seven archive/checksum assets, manifest mutations, release metadata, missing source and recursive tag resolution')
