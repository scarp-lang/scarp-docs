import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePublishedAlpha4Cli } from './lib/alpha4-cli-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const errors = validatePublishedAlpha4Cli(
  read('docs/tooling/cli-alpha4.md'), read('docs/hi/tooling/cli-alpha4.md'),
  read('conformance/alpha4/Scarp.project'), read('conformance/alpha4/starter.srp'),
  read('conformance/alpha4/starter.stdout'), read('docs/.vitepress/config.mts')
)
if (errors.length) {
  for (const issue of errors) console.error('FAIL alpha.4 published CLI: ' + issue)
  process.exitCode = 1
} else {
  console.log('PASS: bilingual alpha.4 CLI commands, tagged evidence, source/output, release boundaries and live navigation')
}
