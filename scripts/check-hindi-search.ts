import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localSearchOptions } from '../docs/.vitepress/local-search.ts'
import { validateHindiLocalSearch, type SearchLocalizationSources } from './lib/hindi-search-policy.ts'

const root = resolve(fileURLToPath(new URL('..',import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
export const sources: SearchLocalizationSources = {
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md'),
  english: read('docs/guide/search-and-navigation.md'),
  hindi: read('docs/hi/guide/search-and-navigation.md'),
  englishIntro: read('docs/guide/introduction.md'),
  hindiIntro: read('docs/hi/guide/introduction.md')
}
const errors = validateHindiLocalSearch(localSearchOptions, sources)
if (errors.length) {
  for (const error of errors) console.error('FAIL Hindi local search: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: Hindi VitePress search button, modal, keyboard hints, theme controls, bilingual guides and navigation')
}
