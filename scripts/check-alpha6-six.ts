import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { RELEASES } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.6'
const source = 'cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e'
assert.equal(RELEASES.find(item => item.tag === tag)?.source, source,
  'Historical alpha.6 source must remain pinned after later releases')

const featurePages = ['releases/' + tag,
  'language/program-input-alpha6', 'language/text-foundations-alpha6',
  'language/tuples-alpha6']
for (const page of featurePages) {
  const en = read('docs/' + page + '.md')
  const hi = read('docs/hi/' + page + '.md')
  for (const content of [en, hi]) {
    assert.ok(content.startsWith('# '), page + ': missing heading')
    assert.ok(content.includes('<!-- scarp-current-release: ' + tag + ' -->'), page + ': wrong release')
    assert.ok(content.includes('<!-- scarp-current-source: ' + source + ' -->'), page + ': wrong pinned SHA')
    assert.ok(content.includes('https://github.com/scarp-lang/scarp/'), page + ': missing compiler provenance')
    assert.ok(!content.includes('https://github.com/scarp-lang/scarp-lang'), page + ': old repo')
  }
  assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 50, page + ': Hindi translation too short')
  assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
    page + ': localized code fence drift')
}

for (const p of ['docs/releases/' + tag + '.md', 'docs/hi/releases/' + tag + '.md']) {
  const content = read(p)
  for (const archive of [
    'scarp-0.0.6-alpha.6-x86_64-pc-windows-msvc.zip',
    'scarp-0.0.6-alpha.6-x86_64-unknown-linux-gnu.tar.gz',
    'scarp-0.0.6-alpha.6-aarch64-apple-darwin.tar.gz'
  ]) {
    assert.ok(content.includes('releases/download/' + tag + '/' + archive + ')'),
      p + ': missing official archive ' + archive)
    assert.ok(content.includes('releases/download/' + tag + '/' + archive + '.sha256)'),
      p + ': missing official checksum ' + archive)
  }
  for (const expected of [
    'core_input_tuple.srp', 'core_input_tuple.stdin', 'core_input_tuple.stdout',
    'program-input-alpha6', 'text-foundations-alpha6', 'tuples-alpha6',
    '--max-input-line-bytes', '--max-tuple-bytes'
  ]) assert.ok(content.includes(expected), p + ': missing release evidence ' + expected)
}
for (const index of ['docs/index.md','docs/hi/index.md']) {
  assert.ok(read(index).includes('releases/' + tag), index + ': stale homepage version')
}
for (const p of [
  'README.md', 'docs/guide/learning-path.md', 'docs/hi/guide/learning-path.md',
  'docs/reference/compatibility.md', 'docs/hi/reference/compatibility.md',
  'docs/guide/search-and-navigation.md', 'docs/hi/guide/search-and-navigation.md'
]) assert.ok(read(p).includes('releases/' + tag), p + ': missing current compiler release')

assert.ok(!read('docs/hi/guide/learning-path.md')
  .includes('[v0.0.6-alpha.6](/hi/releases/v0.0.6-alpha.5)'),
  'Hindi learning path points at an older binary')

console.log('PASS: published alpha.6 bilingual release, official archive/checksum links, four paired guides, and code parity')
