import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Docs, type Alpha6Manifest, type Alpha6Pages } from './lib/alpha6-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
const meta = JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const pages: Alpha6Pages = {
  releaseEn: read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHi: read('docs/hi/releases/v0.0.6-alpha.1.md'),
  cliEn: read('docs/tooling/cli-alpha6.md'),
  cliHi: read('docs/hi/tooling/cli-alpha6.md'),
  rmsEn: read('docs/language/rms-alpha6.md'),
  rmsHi: read('docs/hi/language/rms-alpha6.md'),
  statusEn: read('docs/reference/status.md'),
  statusHi: read('docs/hi/reference/status.md'),
  homeEn: read('docs/index.md'),
  homeHi: read('docs/hi/index.md'),
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md')
}
const fixtures = Object.fromEntries(Object.entries(meta.fixtures).map(
  ([name, record]) => [name,read(record.path)]
))
const problems = validateAlpha6Docs(pages,meta,fixtures)
const officialExamples = process.argv[2]
if (officialExamples) {
  for (const [name,record] of Object.entries(meta.fixtures)) {
    const taggedFile = readFileSync(join(resolve(officialExamples),name),'utf8')
    if (taggedFile !== fixtures[name]) problems.push('tagged compiler differs: '+record.compilerPath)
  }
}
if (problems.length) {
  for (const problem of problems) console.error('FAIL alpha.6: '+problem)
  process.exitCode = 1
} else {
  console.log('PASS: tagged alpha.6 fixtures, English/Hindi release, CLI, RMS, assets, status and navigation')
}
