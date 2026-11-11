import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCommandFinder, type FinderSources } from './lib/command-finder-evidence.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const sources: FinderSources = {
  english: read('docs/tooling/command-finder.md'),
  hindi: read('docs/hi/tooling/command-finder.md'),
  component: read('docs/.vitepress/theme/components/ScarpCommandFinder.vue'),
  theme: read('docs/.vitepress/theme/index.ts'),
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md'),
  learnEn: read('docs/guide/learning-path.md'),
  learnHi: read('docs/hi/guide/learning-path.md'),
  compatEn: read('docs/reference/compatibility.md'),
  compatHi: read('docs/hi/reference/compatibility.md')
}
const failures = validateCommandFinder(sources)
if (failures.length) {
  for (const failure of failures) console.error('FAIL version-aware command finder: ' + failure)
  process.exitCode = 1
} else {
  console.log('PASS: published compiler releases, seven command tasks, bilingual Vue widget and safe links')
}
