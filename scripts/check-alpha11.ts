import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.11'
const source = '79b57395957f47e1270ee542a856c844b82386de'
const published = '2026-11-15T15:14:47Z'
const manifest = JSON.parse(read('conformance/alpha11-manifest.json')) as {
  compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string;
  cases: Array<{ source: string; localSource: string; gitBlobSha: string }>
}
for (const entry of [manifest]) {
  assert.equal(entry.compilerRepository, 'scarp-lang/scarp')
  assert.equal(entry.compilerRef, tag)
  assert.equal(entry.compilerCommit, source)
  assert.equal(entry.releasedAt, published)
  assert.equal(entry.status, 'published-prerelease')
}
assert.deepEqual(manifest.cases.map(c => c.source), [
  'examples/decimal_exact.srp',
  'examples/decimal_exact.stdout',
  'examples/interactive/exact_decimal.srp',
  'examples/interactive/exact_decimal.stdin',
  'examples/interactive/exact_decimal.stdout'
])
for (const file of manifest.cases) {
  assert.equal(file.localSource, 'conformance/alpha11/' + file.source.slice('examples/'.length).replaceAll('/', '_'))
  assert.match(file.gitBlobSha, /^[a-f0-9]{40}$/)
  const bytes = readFileSync(resolve(root, file.localSource))
  const gitBlob = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0)).update(bytes).digest('hex')
  assert.equal(gitBlob, file.gitBlobSha, 'Tagged upstream source drift: ' + file.source)
}
const decimal = read('conformance/alpha11/decimal_exact.srp').trimEnd()
const decimalOut = read('conformance/alpha11/decimal_exact.stdout').trimEnd()
const input = read('conformance/alpha11/interactive_exact_decimal.srp').trimEnd()
const inputOut = read('conformance/alpha11/interactive_exact_decimal.stdout').trimEnd()
for (const guide of ['releases/' + tag, 'language/decimal-alpha11', 'tooling/decimal-input-alpha11']) {
  const en = read('docs/' + guide + '.md')
  const hi = read('docs/hi/' + guide + '.md')
  for (const page of [en, hi]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'))
    assert.ok(page.includes(tag))
  }
  assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
    guide + ': English/Hindi source and stdout must match')
  assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 90,
    guide + ': substantial Hindi translation missing')
}
for (const locale of ['', 'hi/']) {
  const release = read('docs/' + locale + 'releases/' + tag + '.md')
  const language = read('docs/' + locale + 'language/decimal-alpha11.md')
  const interactive = read('docs/' + locale + 'tooling/decimal-input-alpha11.md')
  for (const page of [release, language]) assert.ok(page.includes(decimal) && page.includes(decimalOut))
  for (const page of [release, interactive]) assert.ok(page.includes(input) && page.includes(inputOut))
  assert.ok(interactive.includes('scarp exec --interactive'))
  for (const platform of [
    'x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ]) {
    const asset = 'scarp-0.0.6-alpha.11-' + platform
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + url + ')'))
    assert.ok(release.includes('](' + url + '.sha256)'))
  }
  assert.ok(release.includes('SHA256SUMS'))
}
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'test-json-v2').supported, true)
console.log('PASS: alpha.11 immutable source and release metadata, five Git blobs, bilingual Decimal docs and archives')
