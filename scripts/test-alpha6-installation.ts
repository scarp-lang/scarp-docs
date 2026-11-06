import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Installation, type Alpha6InstallPages } from './lib/alpha6-installation.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const baseline: Alpha6InstallPages = {
  english: read('docs/guide/installation-alpha6.md'),
  hindi: read('docs/hi/guide/installation-alpha6.md'),
  config: read('docs/.vitepress/config.mts'),
  homeEnglish: read('docs/index.md'),
  homeHindi: read('docs/hi/index.md'),
  releaseEnglish: read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHindi: read('docs/hi/releases/v0.0.6-alpha.1.md')
}
assert.deepEqual(validateAlpha6Installation(baseline), [])

const mutations: Array<[string, keyof Alpha6InstallPages, string, string]> = [
  ['wrong pinned source', 'english', 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8', 'not-a-release-commit'],
  ['lost archive', 'hindi', 'scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip', 'invalid-package.zip'],
  ['wrong Windows checksum guard', 'english', "if ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }", '# skip checksum guard'],
  ['wrong Linux digest checker', 'hindi', 'sha256sum --check', 'sha256sum --ignore'],
  ['wrong macOS digest checker', 'english', 'shasum -a 256 -c', 'shasum -c'],
  ['wrong Windows package folder', 'hindi', 'scarp-alpha6\\scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc', 'wrong-folder'],
  ['moving source tag', 'english', 'git checkout v0.0.6-alpha.1', 'git checkout main'],
  ['not-offline source build', 'hindi', 'cargo build --locked --offline', 'cargo build --locked'],
  ['unreleased CLI command', 'english', '.\\scarp.exe launch hello-world', '.\\scarp.exe build hello-world'],
  ['missing English nav', 'config', "link: '/guide/installation-alpha6'", "link: '/guide/installation'"],
  ['missing Hindi nav', 'config', "link: '/hi/guide/installation-alpha6'", "link: '/hi/guide/installation'"],
  ['missing homepage card', 'homeEnglish', 'link: /guide/installation-alpha6', 'link: /guide/installation'],
  ['missing Hindi homepage card', 'homeHindi', 'link: /hi/guide/installation-alpha6', 'link: /hi/guide/installation'],
  ['missing English release crosslink', 'releaseEnglish', '](/guide/installation-alpha6)', '](/guide/installation-alpha5)'],
  ['missing Hindi release crosslink', 'releaseHindi', '](/hi/guide/installation-alpha6)', '](/hi/guide/installation-alpha5)']
]
for (const [name, field, before, after] of mutations) {
  const next = baseline[field].replaceAll(before, after)
  assert.notEqual(next, baseline[field], name + ': test did not mutate the file')
  const changed = { ...baseline, [field]: next }
  assert.ok(validateAlpha6Installation(changed).length, name + ': validator accepted installation drift')
}
assert.ok(validateAlpha6Installation({
  ...baseline,
  hindi: baseline.hindi.replace(/[\u0900-\u097f]/gu, '')
}).length, 'must reject lost Hindi translation')
console.log('PASS: alpha.6 installation source/command/locale policy and ' + (mutations.length + 1) + ' negative mutations')
