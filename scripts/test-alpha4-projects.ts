import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4Docs, type ProjectAlpha4Fixture } from './lib/alpha4-project-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const [en, hi, quick, quickHi] = [
  read('docs/releases/v0.0.5-alpha.4.md'), read('docs/hi/releases/v0.0.5-alpha.4.md'),
  read('docs/guide/quickstart-alpha4.md'), read('docs/hi/guide/quickstart-alpha4.md')
]
const manifest = JSON.parse(read('conformance/alpha4-manifest.json')) as ProjectAlpha4Fixture
const files = {
  manifest: read('conformance/alpha4/Scarp.project'),
  entry: read('conformance/alpha4/starter.srp'),
  output: read('conformance/alpha4/starter.stdout')
}
const check = (a = en, b = hi, c = quick, d = quickHi,
  m = manifest, f = files) => validateAlpha4Docs(a, b, c, d, m, f)
assert.deepEqual(check(), [])
assert.ok(check(en.replace('<!-- scarp-project-release: v0.0.5-alpha.4 -->', ''))
  .some(x => x.includes('release markers')))
assert.ok(check(en, hi.replace('scarp launch hello-world', 'scarp run hello-world'))
  .some(x => x.includes('command sequence')))
assert.ok(check(en, hi, quick, quickHi.replace('Hello from Scarp!', 'Hello from Mock!'))
  .some(x => x.includes('starter manifest, source or stdout')))
assert.ok(check(en, hi, quick.replace('print("Hello from Scarp!");', 'print("test");'))
  .some(x => x.includes('starter manifest, source or stdout')))
assert.ok(check(en, hi, quick, quickHi, { ...manifest, compilerCommit: 'unreleased' })
  .some(x => x.includes('identity changed')))
assert.ok(check(en, hi, quick, quickHi, manifest, { ...files, entry: 'print("changed");\n' })
  .some(x => x.includes('generator template')))
assert.ok(check(en, hi, quick, quickHi.replace('](/hi/reference/status)', '](elsewhere)'))
  .some(x => x.includes('related link')))
console.log('PASS: alpha.4 source, release, generated source/output, CLI and translation drift regression tests')
