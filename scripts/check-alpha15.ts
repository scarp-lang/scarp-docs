import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.15'
const source = 'a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281'
const manifest = JSON.parse(read('data/compiler-latest-release.json')) as {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  status: string
  historicalReferenceBaseline: string
  assets: string[]
}
assert.equal(manifest.compilerRepository, 'scarp-lang/scarp')
assert.equal(manifest.compilerRef, tag)
assert.equal(manifest.compilerCommit, source)
assert.equal(manifest.releasedAt, '2026-11-19T14:14:09Z')
assert.equal(manifest.status, 'published-prerelease')
assert.equal(manifest.historicalReferenceBaseline, 'v0.0.5-alpha.1')
assert.equal(LATEST_RELEASE, tag)
assert.equal(RELEASES.at(-1)?.source, source)
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'inspect-ast').supported, true)
assert.equal(commandAdvice(tag, 'test-json-v2').supported, true)
const archives = [
  'x86_64-pc-windows-msvc.zip',
  'x86_64-unknown-linux-gnu.tar.gz',
  'aarch64-apple-darwin.tar.gz'
]
assert.deepEqual(manifest.assets, archives.map(s => 'scarp-0.0.6-alpha.15-' + s).concat('SHA256SUMS'))
for (const [prefix, language] of [['', 'English'], ['hi/', 'Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const host = read('docs/' + prefix + 'tooling/rust-host-alpha15.md')
  for (const document of [release, host]) {
    assert.ok(document.includes('<!-- scarp-cli-release: ' + tag + ' -->'), language + ' version marker')
    assert.ok(document.includes('<!-- scarp-current-source: ' + source + ' -->'), language + ' source marker')
    for (const keyword of ['RevisionMismatch', 'CHECKED_KERNEL_INVALID_SHIFT', '<<', '>>', '>>>', '64', 'MiB']) {
      assert.ok(document.includes(keyword), language + ' missing release boundary ' + keyword)
    }
  }
  for (const platform of archives) {
    const asset = 'scarp-0.0.6-alpha.15-' + platform
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + url + ')'), language + ' missing archive ' + platform)
    assert.ok(release.includes('](' + url + '.sha256)'), language + ' missing archive checksum ' + platform)
  }
  assert.ok(release.includes('SHA256SUMS'))
  for (const path of ['index.md', 'guide/introduction.md', 'reference/status.md',
    'reference/compatibility.md', 'tooling/command-finder.md']) {
    assert.ok(read('docs/' + prefix + path).includes('/' + prefix + 'releases/' + tag),
      language + ' missing new release link in ' + path)
  }
  assert.ok(read('docs/' + prefix + 'reference/status.md').includes(source))
}
const en = read('docs/releases/' + tag + '.md')
const hi = read('docs/hi/releases/' + tag + '.md')
assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
  'English and Hindi release code blocks differ')
assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 100)
assert.ok((read('docs/hi/tooling/rust-host-alpha15.md').match(/[\u0900-\u097f]/gu) ?? []).length >= 100)
console.log('PASS: alpha.15 pinned compiler provenance, bilingual release, APIs, archives and site links')
