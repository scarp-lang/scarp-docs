import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAstGuide, type AstGuidePages } from './lib/alpha6-ast-policy.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
export const pages: AstGuidePages = {
  en: read('docs/tooling/inspect-ast-alpha6.md'),
  hi: read('docs/hi/tooling/inspect-ast-alpha6.md'),
  config: read('docs/.vitepress/config.mts'),
  cliEn: read('docs/tooling/cli-alpha6.md'),
  cliHi: read('docs/hi/tooling/cli-alpha6.md'),
  troubleshootEn: read('docs/tooling/troubleshooting.md'),
  troubleshootHi: read('docs/hi/tooling/troubleshooting.md'),
  releaseEn: read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHi: read('docs/hi/releases/v0.0.6-alpha.1.md'),
  readme: read('README.md')
}
const errors = validateAstGuide(pages)
if(errors.length) {
  for (const error of errors) console.error('FAIL alpha.6 AST: ' + error)
  process.exitCode=1
} else {
  console.log('PASS: bilingual published alpha.6 AST inspection, source, commands, limits and release navigation')
}
