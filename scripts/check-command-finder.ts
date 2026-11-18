import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { documentationPages } from './lib/docs-pages.ts'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCommandFinder, type FinderSources } from './lib/command-finder-evidence.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const sources: FinderSources = {
  english: read('docs/tooling/command-finder.md'),
  hindi: read('docs/hi/tooling/command-finder.md'),
  client: read('scripts/scarp-site/client.ts'),
  builder: read('scripts/scarp-site/build.ts'),
  markdown: read('scripts/scarp-site/markdown.ts'),
  styles: read('scripts/scarp-site/site.css'),
  pages: documentationPages(join(root,'docs')),
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
  console.log('PASS: published compiler releases, eleven command tasks, bilingual owned TypeScript widget, routes and safe links')
}
