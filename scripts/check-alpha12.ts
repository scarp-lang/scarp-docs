import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { LATEST_RELEASE, RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const tag = 'v0.0.6-alpha.12'
const source = 'a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d'
const published = '2026-11-16T14:36:58Z'
interface Fixture { source: string; localSource: string; gitBlobSha: string }
interface Release { compilerRepository: string; compilerRef: string; compilerCommit: string;
  releasedAt: string; status: string; assets?: string[]; cases?: Fixture[] }
const manifest = JSON.parse(read('conformance/alpha12-manifest.json')) as Release
const latest = JSON.parse(read('data/compiler-latest-release.json')) as Release
for (const value of [manifest]) {
  assert.equal(value.compilerRepository, 'scarp-lang/scarp')
  assert.equal(value.compilerRef, tag)
  assert.equal(value.compilerCommit, source)
  assert.equal(value.releasedAt, published)
  assert.equal(value.status, 'published-prerelease')
}
assert.equal(RELEASES.find(item => item.tag === tag)?.source, source)
assert.equal(latest.compilerRef, LATEST_RELEASE)
assert.ok(RELEASES.findIndex(item => item.tag === tag) < RELEASES.length - 1,
  'Historical alpha.12 must not claim to be the newest release')
const standalone = [
  'data_destructure','variant_validation','typed_propagation','typed_dynamic_lists',
  'persistent_list_updates','typed_maps','persistent_maps','ui_event_patterns'
]
const projectFiles = [
  'scarp.project','src/board.srp','src/main.srp','stdout.txt',
  'tests/capacity.srp','tests/lifecycle.srp','tests/validation.srp'
]
const expected = [
  ...standalone.flatMap(name => ['examples/' + name + '.srp','examples/' + name + '.stdout']),
  ...projectFiles.map(name => 'examples/projects/task-board/' + name)
]
assert.deepEqual(manifest.cases?.map(x => x.source), expected)
assert.equal(manifest.cases?.length, 23)
for (const file of manifest.cases ?? []) {
  assert.equal(file.localSource, 'conformance/alpha12/' + file.source.slice('examples/'.length))
  assert.match(file.gitBlobSha, /^[a-f0-9]{40}$/)
  const bytes = readFileSync(resolve(root, file.localSource))
  const hash = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0))
    .update(bytes).digest('hex')
  assert.equal(hash, file.gitBlobSha, 'Published Git blob changed: ' + file.source)
}
const routeSnippets: Record<string, string[]> = {
  ['releases/' + tag]: ['variant_validation'],
  'language/records-variants-alpha12': ['variant_validation','data_destructure','ui_event_patterns'],
  'language/option-result-alpha12': ['typed_propagation'],
  'language/lists-maps-alpha12': [
    'typed_dynamic_lists','persistent_list_updates','typed_maps','persistent_maps'
  ],
  'tutorials/task-board-alpha12': []
}
for (const [route, names] of Object.entries(routeSnippets)) {
  const en = read('docs/' + route + '.md')
  const hi = read('docs/hi/' + route + '.md')
  for (const page of [en,hi]) {
    assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'), route + ' release marker')
    assert.ok(page.includes('<!-- scarp-current-source: ' + source + ' -->'), route + ' commit marker')
    assert.ok(page.includes(tag), route + ' version')
    for (const name of names) {
      assert.ok(page.includes(read('conformance/alpha12/' + name + '.srp').trimEnd()),
        route + ' source mismatch ' + name)
      assert.ok(page.includes(read('conformance/alpha12/' + name + '.stdout').trimEnd()),
        route + ' stdout mismatch ' + name)
    }
  }
  assert.equal(firstMissingCodeBlock(extractCodeFences(en), extractCodeFences(hi)), -1,
    route + ': localized code fences must match exactly')
  assert.ok((hi.match(/[\u0900-\u097f]/gu) ?? []).length >= 90,
    route + ': Hindi guide must have substantial translation')
}
for (const locale of ['', 'hi/']) {
  const release = read('docs/' + locale + 'releases/' + tag + '.md')
  const tutorial = read('docs/' + locale + 'tutorials/task-board-alpha12.md')
  for (const name of ['scarp.project','src/board.srp','src/main.srp','stdout.txt']) {
    assert.ok(tutorial.includes(read('conformance/alpha12/projects/task-board/' + name).trimEnd()),
      'Project tutorial omitted tagged file: ' + name)
  }
  for (const name of ['capacity','lifecycle','validation']) {
    assert.ok(tutorial.includes('tests/' + name + '.srp'), 'Missing project test: ' + name)
  }
  for (const command of [
    'scarp verify examples/projects/task-board',
    'scarp launch examples/projects/task-board',
    'scarp test --require-tests examples/projects/task-board'
  ]) {
    assert.ok(release.includes(command) && tutorial.includes(command), 'Missing project command: ' + command)
  }
  assert.ok(release.includes(read('conformance/alpha12/projects/task-board/stdout.txt').trimEnd()))
  for (const platform of [
    'x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ]) {
    const asset = 'scarp-0.0.6-alpha.12-' + platform
    const uri = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/' + asset
    assert.ok(release.includes('](' + uri + ')'), 'Missing archive: ' + asset)
    assert.ok(release.includes('](' + uri + '.sha256)'), 'Missing checksum: ' + asset)
  }
  assert.ok(release.includes('SHA256SUMS'))
  for (const path of ['index.md','reference/status.md','reference/compatibility.md']) {
    const page = read('docs/' + locale + path)
    const archiveLink = '/' + locale + 'releases/' + tag
    assert.ok(page.includes('](' + archiveLink + ')') || page.includes('link: ' + archiveLink),
      'Historical alpha.12 release must remain discoverable: ' + path)
  }
}
assert.equal(commandAdvice(tag, 'run-file').commands[0], 'scarp exec FILE.srp')
assert.equal(commandAdvice(tag, 'test-json-v2').supported, true)
console.log('PASS: alpha.12 immutable tag, 23 compiler blobs, five bilingual guides, exact project and archives')
