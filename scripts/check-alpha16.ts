import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.16'
const source = '244f713b4fa48f02a98b8e3e3c11025363f35260'
const published = '2026-11-20T13:17:18Z'
interface Case { source: string; localSource: string; gitBlobSha: string }
interface Manifest {
  compilerRepository: string; compilerRef: string; compilerCommit: string
  releasedAt: string; status: string; historicalReferenceBaseline?: string
  cases?: Case[]; assets?: string[]
}
const evidence = JSON.parse(read('conformance/alpha16-manifest.json')) as Manifest
for (const record of [evidence]) {
  assert.equal(record.compilerRepository, 'scarp-lang/scarp')
  assert.equal(record.compilerRef, tag)
  assert.equal(record.compilerCommit, source)
  assert.equal(record.releasedAt, published)
  assert.equal(record.status, 'published-prerelease')
}
assert.equal(RELEASES.find(item => item.tag === tag)?.source, source)
assert.notEqual(RELEASES.at(-1)?.tag, tag, 'Historical alpha.16 must not remain latest')
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'test-json-v2').supported, true)
const expected = [
  'examples/order_statistics.srp', 'examples/order_statistics.stdout',
  'examples/core_collections.srp', 'examples/core_collections.stdout',
  'examples/modules/collection_tools.srp'
]
assert.deepEqual(evidence.cases?.map(item => item.source), expected)
for (const item of evidence.cases ?? []) {
  assert.equal(item.localSource, 'conformance/alpha16/' + item.source.slice('examples/'.length))
  const bytes = readFileSync(resolve(root, item.localSource))
  assert.equal(
    createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
      .update(bytes).digest('hex'),
    item.gitBlobSha, 'Compiler tag blob drift: ' + item.source
  )
}
const suffixes = ['x86_64-pc-windows-msvc.zip',
  'x86_64-unknown-linux-gnu.tar.gz', 'aarch64-apple-darwin.tar.gz']

for (const [prefix, label] of [['','English'], ['hi/','Hindi']] as const) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  const guide = read('docs/' + prefix + 'tooling/alpha16-statistics-utilities.md')
  for (const page of [release, guide]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'),
      label + ' missing CLI release marker')
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'),
      label + ' missing immutable compiler source')
    for (const term of ['median', 'quantile', 'text_upper', 'integer_gcd', 'ConstantCache']) {
      assert.ok(page.includes(term), label + ' omitted published function ' + term)
    }
  }
  for (const item of (evidence.cases ?? []).slice(0,4)) {
    assert.ok(release.includes(read(item.localSource).trimEnd()),
      label + ' release omits pinned source/output ' + item.source)
  }
  for (const item of (evidence.cases ?? []).slice(0,2)) {
    assert.ok(guide.includes(read(item.localSource).trimEnd()),
      label + ' guide omits pinned statistics source/output ' + item.source)
  }
  for (const suffix of suffixes) {
    const archive = 'scarp-0.0.6-alpha.16-' + suffix
    const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + archive
    assert.ok(release.includes('](' + url + ')'), label + ' archive absent: ' + archive)
    assert.ok(release.includes('](' + url + '.sha256)'),
      label + ' checksum absent: ' + archive)
  }
  assert.ok(release.includes('SHA256SUMS'), label + ' combined checksum absent')
  for (const path of ['index.md', 'guide/introduction.md', 'guide/learning-path.md',
    'reference/status.md', 'reference/compatibility.md', 'tooling/command-finder.md']) {
    assert.ok(read('docs/' + prefix + path).includes('/' + prefix + 'releases/' + tag),
      label + ' missing alpha.16 navigation from ' + path)
  }
  assert.ok(read('docs/' + prefix + 'reference/status.md').includes(source),
    label + ' status omits exact tagged source')
}
for (const path of ['releases/' + tag + '.md','tooling/alpha16-statistics-utilities.md']) {
  const english = extractCodeFences(read('docs/' + path))
  const hindi = extractCodeFences(read('docs/hi/' + path))
  assert.equal(firstMissingCodeBlock(english, hindi), -1,
    'English/Hindi runnable code differs in ' + path)
}
for (const path of ['docs/hi/releases/' + tag + '.md',
  'docs/hi/tooling/alpha16-statistics-utilities.md']) {
  assert.ok((read(path).match(/[\u0900-\u097f]/gu) ?? []).length >= 100,
    'Hindi prose is missing: ' + path)
}
console.log('PASS: alpha.16 immutable compiler fixtures, bilingual release guides, archives and navigation')
