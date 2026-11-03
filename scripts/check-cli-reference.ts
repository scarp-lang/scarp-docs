import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePublishedCliReference } from './lib/cli-reference.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const problems = validatePublishedCliReference(
  read('docs/tooling/cli.md'),
  read('docs/hi/tooling/cli.md'),
  read('conformance/alpha3/text_construction.stdout')
)
if (problems.length) {
  for (const problem of problems) console.error('FAIL alpha.3 CLI reference: ' + problem)
  process.exitCode = 1
} else {
  console.log('PASS: bilingual published alpha.3 CLI command matrix, release identity and exact stdout')
}
