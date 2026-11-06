import assert from 'node:assert/strict'
import { comparePublishedCompiler, latestPublishedCompiler } from './lib/compiler-release-drift.ts'

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
