import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.13'
const source = 'e755fda37cdaeed29434e848cb5dd41f2f2e7eb2'
const published = '2026-11-17T12:28:07Z'
interface Case { source: string; localSource: string; gitBlobSha: string }
interface Release { compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string; assets?: string[]; cases?: Case[] }
const manifest = JSON.parse(read('conformance/alpha13-manifest.json')) as Release
const latest = JSON.parse(read('data/compiler-latest-release.json')) as Release
for (const record of [manifest, latest]) {
  assert.equal(record.compilerRepository, 'scarp-lang/scarp')
  assert.equal(record.compilerRef, tag)
  assert.equal(record.compilerCommit, source)
  assert.equal(record.releasedAt, published)
  assert.equal(record.status, 'published-prerelease')
}
assert.equal(LATEST_RELEASE, tag)
assert.equal(RELEASES.at(-1)?.source, source)
const programs = ["revision_range_snapshot","revision_ceiling_snapshot","map_projection_snapshots","aggregate_resource_boundaries"] as const
const expected = programs.flatMap(name => ['examples/' + name + '.srp', 'examples/' + name + '.stdout'])
assert.deepEqual(manifest.cases?.map(item => item.source), expected)
assert.equal(manifest.cases?.length, 8)
for (const item of manifest.cases ?? []) {
  assert.equal(item.localSource, 'conformance/alpha13/' + item.source.slice('examples/'.length))
  assert.match(item.gitBlobSha, /^[a-f0-9]{40}$/)
  const bytes = readFileSync(resolve(root, item.localSource))
  const hash = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(hash, item.gitBlobSha, 'Published compiler blob changed: ' + item.source)
}
for (const [prefix, label] of [['','English'],['hi/','Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const host = read('docs/' + prefix + 'tooling/editor-caches-alpha13.md')
  for (const page of [release, host]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'), label + ' release marker')
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'), label + ' compiler source marker')
    for (const feature of [
      'CompilationCache::set_limits', 'evict_identity_revisions_in_range',
      'EditorCompilationCache::analyze_loaded', 'EditorAnalysis::into_current'
    ]) assert.ok(page.includes(feature), label + ' omitted ' + feature)
  }
  for (const name of programs) for (const extension of ['srp','stdout']) {
    assert.ok(release.includes(read('conformance/alpha13/' + name + '.' + extension).trimEnd()),
      label + ' tagged ' + name + '.' + extension + ' omitted')
  }
  for (const path of ['index.md','reference/status.md','reference/compatibility.md']) {
    assert.ok(read('docs/' + prefix + path).includes('/' + prefix + 'releases/' + tag),
      label + ' current-release navigation omitted from ' + path)
  }
  for (const system of ["x86_64-pc-windows-msvc.zip","x86_64-unknown-linux-gnu.tar.gz","aarch64-apple-darwin.tar.gz"]) {
    const asset = 'scarp-0.0.6-alpha.13-' + system
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + url + ')'), label + ' missing archive: ' + asset)
    assert.ok(release.includes('](' + url + '.sha256)'), label + ' missing checksum: ' + asset)
    assert.ok(latest.assets?.includes(asset))
  }
  assert.ok(release.includes('SHA256SUMS'))
}
const en = read('docs/releases/' + tag + '.md')
const hi = read('docs/hi/releases/' + tag + '.md')
assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
  'Bilingual Scarp source, output and shell commands must match')
assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 120,
  'Hindi translation is incomplete')
assert.equal(latest.assets?.length, 4)
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'test-project').supported, true)
console.log('PASS: alpha.13 release identity, 8 tagged source blobs, bilingual guides, archives and CLI')
