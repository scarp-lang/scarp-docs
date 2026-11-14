import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.10'
const source = '44fcd0f77ccb92648cdb1fc7632495c506c87cb3'
const published = '2026-11-14T07:03:24Z'
const manifest = JSON.parse(read('conformance/alpha10-manifest.json')) as {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  status: string
  cases: Array<{ source: string; localSource: string; gitBlobSha: string }>
}
const current = JSON.parse(read('data/compiler-latest-release.json')) as {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  status: string
  assets: string[]
}

for (const release of [manifest, current]) {
  assert.equal(release.compilerRepository, 'scarp-lang/scarp')
  assert.equal(release.compilerRef, tag)
  assert.equal(release.compilerCommit, source)
  assert.equal(release.releasedAt, published)
  assert.equal(release.status, 'published-prerelease')
}
assert.equal(LATEST_RELEASE, tag)
assert.equal(RELEASES.at(-1)?.source, source)
assert.equal(manifest.cases.length, 8)
assert.deepEqual(manifest.cases.map(record => record.source), [
  'examples/interactive/greeting.srp',
  'examples/interactive/greeting.stdin',
  'examples/interactive/greeting.stdout',
  'examples/interactive/typed_calculator.srp',
  'examples/interactive/typed_calculator.stdin',
  'examples/interactive/typed_calculator.stdout',
  'examples/fixed_arrays.srp',
  'examples/fixed_arrays.stdout'
])
for (const record of manifest.cases) {
  assert.equal(record.localSource,
    'conformance/alpha10/' + record.source.slice('examples/'.length).replaceAll('/', '_'))
  assert.match(record.gitBlobSha, /^[a-f0-9]{40}$/)
  const bytes = readFileSync(resolve(root, record.localSource))
  const gitSha = createHash('sha1')
    .update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(gitSha, record.gitBlobSha, 'Immutable compiler fixture drift: ' + record.source)
}
for (const guide of ['releases/' + tag, 'tooling/interactive-input-alpha10', 'language/fixed-arrays-alpha10']) {
  const en = read('docs/' + guide + '.md')
  const hi = read('docs/hi/' + guide + '.md')
  for (const text of [en, hi]) {
    assert.ok(text.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
    assert.ok(text.includes('<!-- scarp-current-source: ' + source + ' -->'))
    assert.ok(text.includes(tag))
  }
  assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
    guide + ': English/Hindi executable code and stdout must match')
  assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 90,
    guide + ': incomplete Hindi explanation')
}
for (const locale of ['', 'hi/']) {
  const release = read('docs/' + locale + 'releases/' + tag + '.md')
  const interactive = read('docs/' + locale + 'tooling/interactive-input-alpha10.md')
  const arrays = read('docs/' + locale + 'language/fixed-arrays-alpha10.md')
  assert.ok(release.includes('<!-- scarp-current-release: ' + tag + ' -->'))
  for (const name of ['interactive_greeting', 'fixed_arrays']) {
    const src = read('conformance/alpha10/' + name + '.srp').trimEnd()
    const output = read('conformance/alpha10/' + name + '.stdout').trimEnd()
    assert.ok(release.includes(src) && release.includes(output), 'Tagged release example drift ' + name)
  }
  for (const name of ['interactive_greeting', 'interactive_typed_calculator']) {
    assert.ok(interactive.includes(read('conformance/alpha10/' + name + '.srp').trimEnd()))
    assert.ok(interactive.includes(read('conformance/alpha10/' + name + '.stdout').trimEnd()))
  }
  assert.ok(arrays.includes(read('conformance/alpha10/fixed_arrays.srp').trimEnd()))
  assert.ok(arrays.includes(read('conformance/alpha10/fixed_arrays.stdout').trimEnd()))
  assert.ok(interactive.includes('scarp exec --interactive'))
  assert.ok(arrays.includes('E0062') && arrays.includes('E0063') && arrays.includes('E0064'))
  for (const platform of [
    'x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ]) {
    const asset = 'scarp-0.0.6-alpha.10-' + platform
    const uri = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + uri + ')'))
    assert.ok(release.includes('](' + uri + '.sha256)'))
    assert.ok(current.assets.includes(asset))
  }
  assert.ok(release.includes('SHA256SUMS'))
  for (const route of ['index.md', 'reference/status.md', 'reference/compatibility.md']) {
    const page = read('docs/' + locale + route)
    const destination = '/' + locale + 'releases/' + tag
    const expected = route === 'index.md' ? 'link: ' + destination : '](' + destination + ')'
    assert.ok(page.includes(expected), locale + route + ': current release link missing')
  }
}
assert.equal(current.assets.length, 4)
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'test-json-v2').supported, true)
assert.equal(commandAdvice('v0.0.6-alpha.8', 'test-json-v2').supported, false)
console.log('PASS: alpha.10 tagged provenance, eight Git blobs, bilingual guides, release assets and CLI availability')
