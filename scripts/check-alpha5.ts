import { readFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha5Docs, type Alpha5Fixture, type Alpha5Pages } from './lib/alpha5-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')
const pages: Alpha5Pages = {
  releaseEn: read('docs/releases/v0.0.5-alpha.5.md'),
  releaseHi: read('docs/hi/releases/v0.0.5-alpha.5.md'),
  cliEn: read('docs/tooling/cli-alpha5.md'),
  cliHi: read('docs/hi/tooling/cli-alpha5.md'),
  installEn: read('docs/guide/installation-alpha5.md'),
  installHi: read('docs/hi/guide/installation-alpha5.md'),
  c11En: read('docs/reference/c11-backend-alpha5.md'),
  c11Hi: read('docs/hi/reference/c11-backend-alpha5.md'),
  statusEn: read('docs/reference/status.md'),
  statusHi: read('docs/hi/reference/status.md'),
  config: read('docs/.vitepress/config.mts')
}
const manifest = JSON.parse(read('conformance/alpha5-manifest.json')) as Alpha5Fixture
const source = read('conformance/alpha5/native_scalar_repeat.srp')
const stdout = read('conformance/alpha5/native_scalar_repeat.stdout')
const problems = validateAlpha5Docs(pages, manifest, source, stdout)
const taggedRoot = process.argv[2]
if (taggedRoot) {
  for (const [file, expected] of [
    ['native_scalar_repeat.srp', source], ['native_scalar_repeat.stdout', stdout]
  ]) {
    if (readFileSync(join(resolve(taggedRoot), file), 'utf8') !== expected) {
      problems.push('published tagged compiler fixture differs from ' + file)
    }
  }
}
if (problems.length) {
  for (const problem of problems) console.error('FAIL published alpha.5: ' + problem)
  process.exitCode = 1
} else {
  console.log('PASS: alpha.5 bilingual release/CLI/install/C11/status, exact source/stdout and three official checksum asset pairs')
}
