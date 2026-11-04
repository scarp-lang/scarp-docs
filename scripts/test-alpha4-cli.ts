import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePublishedAlpha4Cli } from './lib/alpha4-cli-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const pages = [
  read('docs/tooling/cli-alpha4.md'), read('docs/hi/tooling/cli-alpha4.md'),
  read('conformance/alpha4/Scarp.project'), read('conformance/alpha4/starter.srp'),
  read('conformance/alpha4/starter.stdout'), read('docs/.vitepress/config.mts')
] as [string, string, string, string, string, string]
const check = (changes: Partial<Record<number, string>> = {}) =>
  validatePublishedAlpha4Cli(...(pages.map((page, i) => changes[i] ?? page) as
    [string, string, string, string, string, string]))
assert.deepEqual(check(), [])
const mutations: Array<[string, number, string, string]> = [
  ['release marker', 0, '<!-- scarp-cli-release: v0.0.5-alpha.4 -->', '<!-- old release -->'],
  ['compiler commit', 1, '<!-- scarp-alpha4-cli-reference: 79141329176f5dce51457e90a6652902f6432135 -->', '<!-- wrong commit -->'],
  ['release download', 0, 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4', 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3'],
  ['directory verify', 0, 'scarp verify hello-world', 'scarp check hello-world'],
  ['directory launch', 1, 'scarp launch hello-world', 'scarp run hello-world'],
  ['runtime budget', 0, 'scarp launch --max-steps 500000 hello-world', 'scarp verify --max-steps 500000 hello-world'],
  ['unreleased modules directory', 0, 'scarp inspect modules --json hello-world/src/main.srp', 'scarp inspect modules --json hello-world'],
  ['generated output', 1, 'Hello from Scarp!', 'Unexpected output'],
  ['manifest content', 2, 'entry: src/main.srp', 'entry: other.srp'],
  ['generated entry', 3, 'Hello from Scarp!', 'Fake output'],
  ['stdout fixture', 4, 'Hello from Scarp!', 'Wrong text'],
  ['primary navigation', 5, "{ text: 'CLI (alpha.4)', link: '/tooling/cli-alpha4' }", "{ text: 'CLI (alpha.3)', link: '/tooling/cli' }"],
  ['historical alpha.3', 1, '](/hi/tooling/cli)', '](/hi/tooling/cli-alpha2)']
]
for (const [name, i, from, to] of mutations) {
  const changed = pages[i].replace(from, to)
  assert.notEqual(changed, pages[i], name + ': mutation must modify real page')
  assert.ok(check({ [i]: changed }).length, name + ': drift must be rejected')
}
console.log('PASS: published alpha.4 CLI validation and ' + mutations.length + ' negative regression checks')
