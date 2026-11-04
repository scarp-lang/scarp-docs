import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4MigrationDocs } from './lib/alpha4-migration.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const en = readFileSync(resolve(root, 'docs/guide/migrate-alpha3-to-alpha4.md'), 'utf8')
const hi = readFileSync(resolve(root, 'docs/hi/guide/migrate-alpha3-to-alpha4.md'), 'utf8')
const verify = (english: string, hindi: string): string[] => validateAlpha4MigrationDocs(english, hindi)
assert.deepEqual(verify(en, hi), [], 'published English/Hindi migration guide must pass')

const mutations: Array<[string, string, string]> = [
  ['alpha.3 compiler pin', en.replace('7715c28df09c7703b39e14fddb963275b25df476', 'incorrect'), hi],
  ['alpha.4 source pin', en.replace('79141329176f5dce51457e90a6652902f6432135', 'incorrect'), hi],
  ['release marker', en.replace('<!-- scarp-migration:', '<!-- wrong-migration:'), hi],
  ['version matrix', en.replace('| `scarp launch DIRECTORY` |', '| different command |'), hi],
  ['starter program', en.replace('print("Hello from Scarp!");', 'print("Wrong!");'), hi],
  ['manifest entry', en.replace('entry: src/main.srp', 'entry: src/other.srp'), hi],
  ['shell command', en.replace('scarp exec app.srp', 'scarp launch app.srp'), hi],
  ['Hindi source equivalence', en, hi.replace('scarp launch hello-world', 'scarp exec hello-world')],
  ['Hindi translation', en, hi.replace(/[ऀ-ॿ]/gu, '')],
  ['local quickstart link', en.replace('](/guide/quickstart-alpha4)', '](https://example.org)'), hi],
  ['protect existing files', en.replace('overwrite', 'replace'), hi],
  ['backup notice', en.replace('back up', 'archive'), hi]
]
for (const [name, english, hindi] of mutations) {
  assert.ok(verify(english, hindi).length > 0, name + ' drift must fail')
}
console.log('PASS: alpha.4 migration documentation and 12 regression mutations')
