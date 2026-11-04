import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4Installation } from './lib/alpha4-installation.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const paths = [
  'docs/guide/installation.md',
  'docs/hi/guide/installation.md',
  'docs/guide/introduction.md',
  'docs/hi/guide/introduction.md',
  'docs/guide/first-program.md',
  'docs/hi/guide/first-program.md'
] as const

const errors = validateAlpha4Installation(...(paths.map(read) as [
  string, string, string, string, string, string
]))
if (errors.length) {
  for (const error of errors) console.error('FAIL published alpha.4 installation: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: bilingual current-release installation, official checksum assets, source identity and exact OS commands')
}
