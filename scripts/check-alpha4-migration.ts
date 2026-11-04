import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4MigrationDocs } from './lib/alpha4-migration.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const english = readFileSync(resolve(root, 'docs/guide/migrate-alpha3-to-alpha4.md'), 'utf8')
const hindi = readFileSync(resolve(root, 'docs/hi/guide/migrate-alpha3-to-alpha4.md'), 'utf8')
const errors = validateAlpha4MigrationDocs(english, hindi)

if (errors.length) {
  for (const error of errors) console.error('FAIL alpha.3 → alpha.4 migration: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: bilingual alpha.3 → alpha.4 upgrade guide, release identities, safety warnings and exact tagged examples')
}
