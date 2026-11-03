import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha4Docs, type ProjectAlpha4Fixture } from './lib/alpha4-project-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const identity = JSON.parse(read('conformance/alpha4-manifest.json')) as ProjectAlpha4Fixture
const failures = validateAlpha4Docs(
  read('docs/releases/v0.0.5-alpha.4.md'), read('docs/hi/releases/v0.0.5-alpha.4.md'),
  read('docs/guide/quickstart-alpha4.md'), read('docs/hi/guide/quickstart-alpha4.md'),
  identity,
  {
    manifest: read('conformance/alpha4/Scarp.project'),
    entry: read('conformance/alpha4/starter.srp'),
    output: read('conformance/alpha4/starter.stdout')
  }
)
if (failures.length) {
  for (const issue of failures) console.error('FAIL alpha.4 project documentation: ' + issue)
  process.exitCode = 1
} else console.log('PASS: published alpha.4 compiler identity, bilingual quickstart/release examples and exact created project')
