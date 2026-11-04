import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4Installation } from './lib/alpha4-installation.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const pages = [
  read('docs/guide/installation.md'),
  read('docs/hi/guide/installation.md'),
  read('docs/guide/introduction.md'),
  read('docs/hi/guide/introduction.md'),
  read('docs/guide/first-program.md'),
  read('docs/hi/guide/first-program.md')
] as [string, string, string, string, string, string]

const check = (changes: Partial<Record<number, string>> = {}) =>
  validateAlpha4Installation(...pages.map((page, i) => changes[i] ?? page) as [
    string, string, string, string, string, string
  ])
assert.deepEqual(check(), [])

const mutations: Array<[string, number, string | RegExp, string]> = [
  ['release marker', 0, '<!-- scarp-install-release: v0.0.5-alpha.4 -->', '<!-- no release -->'],
  ['wrong compiler commit', 0, '79141329176f5dce51457e90a6652902f6432135', 'incorrect-commit'],
  ['lost Windows archive', 0, 'scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip', 'scarp-windows.zip'],
  ['lost Linux checksum', 1, 'scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz.sha256', 'missing-checksum'],
  ['lost macOS checksum check', 0, 'shasum -a 256 -c', 'shasum -c'],
  ['disabled Windows guard', 1, "if ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }", '# skip checksum'],
  ['wrong extraction folder', 0, 'scarp-alpha4/scarp-0.0.5-alpha.4-aarch64-apple-darwin', 'other-folder'],
  ['changed source verification', 1, 'git checkout v0.0.5-alpha.4', 'git checkout main'],
  ['unsupported Windows startup', 0, '.\\scarp.exe launch hello-world', 'scarp build hello-world'],
  ['removed Hindi translation', 1, /[\u0900-\u097f]/gu, ''],
  ['stale English introduction', 2, 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4', 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3'],
  ['stale Hindi introduction', 3, 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4', 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3'],
  ['outdated first-program entry', 4, '/guide/quickstart-alpha4', '/guide/quickstart-alpha3'],
  ['outdated Hindi first-program entry', 5, '/hi/guide/quickstart-alpha4', '/hi/guide/quickstart-alpha3']
]
for (const [name, index, before, after] of mutations) {
  const next = pages[index].replace(before, after)
  assert.notEqual(next, pages[index], name + ': test mutation must actually change the page')
  assert.ok(check({ [index]: next }).length > 0, name + ': validation must reject version or command drift')
}
console.log('PASS: alpha.4 installer evidence and ' + mutations.length + ' negative drift tests')
