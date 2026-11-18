import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.14'
const source = '43627b74af5fccccc5e233e98207413983ebafc1'
const published = '2026-11-18T12:43:31Z'
interface Case { source: string; localSource: string; gitBlobSha: string }
interface Release { compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string; assets?: string[]; cases?: Case[] }
const manifest = JSON.parse(read('conformance/alpha14-manifest.json')) as Release
const latest = JSON.parse(read('data/compiler-latest-release.json')) as Release
for (const record of [manifest,latest]) {
  assert.equal(record.compilerRepository, 'scarp-lang/scarp')
  assert.equal(record.compilerRef, tag)
  assert.equal(record.compilerCommit, source)
  assert.equal(record.releasedAt, published)
  assert.equal(record.status, 'published-prerelease')
}
assert.equal(LATEST_RELEASE, tag)
assert.equal(RELEASES.at(-1)?.source, source)
const names = ['structured_pattern_coverage', 'map_string_projection_snapshots'] as const
assert.deepEqual(manifest.cases?.map(c => c.source).sort(),
  names.flatMap(n => ['examples/' + n + '.srp','examples/' + n + '.stdout']).sort())
for (const item of manifest.cases ?? []) {
  assert.equal(item.localSource, 'conformance/alpha14/' + item.source.slice('examples/'.length))
  assert.match(item.gitBlobSha, /^[a-f0-9]{40}$/)
  const bytes = readFileSync(resolve(root,item.localSource))
  const hash = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(hash, item.gitBlobSha, 'Compiler tag source changed: ' + item.source)
}
for (const [prefix,language] of [['','English'], ['hi/','Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const host = read('docs/' + prefix + 'tooling/rust-host-alpha14.md')
  for (const page of [release,host]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'), language + ' release marker')
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'), language + ' exact source')
    for (const term of ['EditorCompilationCache::set_limits', 'emit_elf64_checked_integer_kernel'])
      assert.ok(page.includes(term), language + ' missing ' + term)
  }
  for (const name of names) for (const ext of ['srp','stdout']) {
    assert.ok(release.includes(read('conformance/alpha14/' + name + '.' + ext).trimEnd()),
      language + ' missing tagged ' + name + '.' + ext)
  }
  for (const file of ['index.md','reference/status.md','reference/compatibility.md',
    'guide/introduction.md','tooling/command-finder.md']) {
    assert.ok(read('docs/' + prefix + file).includes('/' + prefix + 'releases/' + tag),
      language + ' current release navigation missing: ' + file)
  }
  for (const suffix of ['x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz', 'aarch64-apple-darwin.tar.gz']) {
    const asset = 'scarp-0.0.6-alpha.14-' + suffix
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + url + ')'), language + ' missing archive')
    assert.ok(release.includes('](' + url + '.sha256)'), language + ' missing checksum')
    assert.ok(latest.assets?.includes(asset))
  }
  assert.ok(release.includes('SHA256SUMS'))
}
assert.equal(latest.assets?.length,4)
const en=read('docs/releases/' + tag + '.md')
const hi=read('docs/hi/releases/' + tag + '.md')
assert.equal(firstMissingCodeBlock(extractCodeFences(en),extractCodeFences(hi)),-1,
  'Bilingual executable fixture or command differs')
assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 120)
assert.ok((read('docs/hi/tooling/rust-host-alpha14.md').match(/[\u0900-\u097f]/gu) ?? []).length >= 120)
assert.equal(commandAdvice(tag,'run-file').commands[0],'scarp exec FILE.srp')
assert.equal(commandAdvice(tag,'test-json-v2').supported,true)
console.log('PASS: published alpha.14 provenance, four Git blobs, bilingual release, hosts and archives')
