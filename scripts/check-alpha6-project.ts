import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Project, type Alpha6ProjectPages,
  type Alpha6ProjectSources } from './lib/alpha6-project-evidence.ts'
import type { Alpha6Manifest } from './lib/alpha6-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
const manifest = JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const sources: Alpha6ProjectSources = {
  manifest: read('conformance/alpha6-project/Scarp.project'),
  main: read('conformance/alpha6-project/src/main.srp'),
  module: read('conformance/alpha6-project/src/modules/navigation_values.srp'),
  stdout: read('conformance/alpha6-project/expected.stdout'),
  taggedMain: read('conformance/alpha6/symbol_navigation.srp'),
  taggedModule: read('conformance/alpha6/modules/navigation_values.srp'),
  taggedStdout: read('conformance/alpha6/symbol_navigation.stdout')
}
const pages: Alpha6ProjectPages = {
  english: read('docs/tutorials/project-symbol-navigation-alpha6.md'),
  hindi: read('docs/hi/tutorials/project-symbol-navigation-alpha6.md'),
  config: read('docs/.vitepress/config.mts'),
  examplesEn: read('docs/examples/index.md'),
  examplesHi: read('docs/hi/examples/index.md'),
  homeEn: read('docs/index.md'),
  homeHi: read('docs/hi/index.md'),
  readme: read('README.md')
}
const errors = validateAlpha6Project(pages,sources,manifest)
if (errors.length) {
  for (const error of errors) console.error('FAIL alpha.6 project: '+error)
  process.exitCode=1
} else {
  console.log('PASS: bilingual alpha.6 project uses exact tagged module/source/stdout, v1 manifest and CLI instructions')
}
