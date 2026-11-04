import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha5Docs, type Alpha5Fixture, type Alpha5Pages } from './lib/alpha5-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file: string): string => readFileSync(resolve(root, file), 'utf8')
const pages: Alpha5Pages = {
  releaseEn: read('docs/releases/v0.0.5-alpha.5.md'),
  releaseHi: read('docs/hi/releases/v0.0.5-alpha.5.md'),
  cliEn: read('docs/tooling/cli-alpha5.md'),
  cliHi: read('docs/hi/tooling/cli-alpha5.md'),
  installEn: read('docs/guide/installation-alpha5.md'),
  installHi: read('docs/hi/guide/installation-alpha5.md'),
  c11En: read('docs/reference/c11-backend-alpha5.md'),
  c11Hi: read('docs/hi/reference/c11-backend-alpha5.md'),
  statusEn: read('docs/reference/status.md'),
  statusHi: read('docs/hi/reference/status.md'),
  config: read('docs/.vitepress/config.mts')
}
const meta = JSON.parse(read('conformance/alpha5-manifest.json')) as Alpha5Fixture
const source = read('conformance/alpha5/native_scalar_repeat.srp')
const stdout = read('conformance/alpha5/native_scalar_repeat.stdout')
const check = (p = pages, m = meta, s = source, o = stdout) => validateAlpha5Docs(p, m, s, o)
assert.deepEqual(check(), [])

const mutations: Array<[keyof Alpha5Pages, string, string]> = [
  ['releaseEn', '<!-- scarp-alpha5-release: 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 -->', '<!-- unverified -->'],
  ['releaseHi', 'repeat 5 as index', 'repeat 8 as index'],
  ['cliEn', 'scarp inspect modules --json hello-scarp', 'scarp inspect modules --json example-old'],
  ['cliHi', 'scarp modules --json hello-scarp', 'scarp modules --json other-folder'],
  ['installEn', 'scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip.sha256', 'not-verified.sha256'],
  ['installHi', 'shasum -a 256 -c', 'shasum -c'],
  ['c11En', 'E0049', 'wrong-error-code'],
  ['c11Hi', '<!-- scarp-c-backend-release: v0.0.5-alpha.5 -->', '<!-- unverified -->'],
  ['statusEn', '<!-- scarp-release-status: v0.0.5-alpha.5 -->', '<!-- old-release -->'],
  ['statusHi', '2eeed0aa52ccb59523307841ad8ffbd83f8911a8', 'unverified-source'],
  ['config', "{ text: 'CLI (alpha.5)', link: '/tooling/cli-alpha5' }", "{ text: 'CLI (alpha.4)', link: '/tooling/cli-alpha4' }"]
]
for (const [name, from, to] of mutations) {
  const changed = pages[name].replace(from, to)
  assert.notEqual(changed, pages[name], name + ': negative test must actually mutate page')
  assert.ok(check({ ...pages, [name]: changed }).length > 0,
    name + ': release drift must be rejected')
}
assert.ok(check(pages, { ...meta, compilerRef: 'v0.0.5-alpha.4' }).length)
assert.ok(check(pages, { ...meta, cBackend: { ...meta.cBackend, cli: true } }).length)
assert.ok(check(pages, meta, source.replace('repeat 5 as index', 'repeat 6 as index')).length)
assert.ok(check(pages, meta, source, stdout.replace('triangle cells', 'other')).length)
console.log('PASS: alpha.5 evidence contract and ' + (mutations.length + 4) + ' source, release, locale and capability drift checks')
