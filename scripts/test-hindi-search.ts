import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localSearchOptions } from '../docs/.vitepress/local-search.ts'
import { LATEST_RELEASE } from './lib/command-finder.ts'
import {
  validateHindiLocalSearch,
  type SearchLocalizationOptions,
  type SearchLocalizationSources
} from './lib/hindi-search-policy.ts'

const root = resolve(fileURLToPath(new URL('..',import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
const pages: SearchLocalizationSources = {
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md'),
  english: read('docs/guide/search-and-navigation.md'),
  hindi: read('docs/hi/guide/search-and-navigation.md'),
  englishIntro: read('docs/guide/introduction.md'),
  hindiIntro: read('docs/hi/guide/introduction.md')
}
assert.deepEqual(validateHindiLocalSearch(localSearchOptions, pages), [])
const searchTrigger = read('docs/.vitepress/theme/search-trigger-accessibility.ts')
const themeIndex = read('docs/.vitepress/theme/index.ts')
assert.ok(themeIndex.includes('installAccessibleSearchTrigger()'),
  'Theme must install responsive search trigger semantics')
assert.ok(searchTrigger.includes("button.removeAttribute('aria-label')") &&
  searchTrigger.includes("button.setAttribute('aria-label', text)"),
  'Search button must derive its desktop accessible name from visible content and keep mobile name')


function mutateOptions(name: string, change: (config: SearchLocalizationOptions) => void): void {
  const copy = JSON.parse(JSON.stringify(localSearchOptions)) as SearchLocalizationOptions
  change(copy)
  assert.ok(validateHindiLocalSearch(copy,pages).length > 0,
    name+' must fail the localized-search policy')
}
mutateOptions('lost Hindi locale',x=>{delete x.locales?.hi})
mutateOptions('English-only search button',x=>{
  if(x.locales?.hi?.translations?.button) x.locales.hi.translations.button.buttonText='Search'
})
mutateOptions('missing accessible label',x=>{
  if(x.locales?.hi?.translations?.button) x.locales.hi.translations.button.buttonAriaLabel=''
})
mutateOptions('Hindi mobile label diverges from visible translation',x=>{
  if(x.locales?.hi?.translations?.button) {
    x.locales.hi.translations.button.buttonAriaLabel='असंबंधित नाम'
  }
})
mutateOptions('English-only empty-result text',x=>{
  if(x.locales?.hi?.translations?.modal) x.locales.hi.translations.modal.noResultsText='No results'
})
mutateOptions('missing keyboard hint',x=>{
  const footer=x.locales?.hi?.translations?.modal?.footer
  if(footer && typeof footer==='object') delete footer.navigateUpKeyAriaLabel
})
function mutatePage(name: string,key: keyof SearchLocalizationSources,from:string,to:string): void {
  const changed=pages[key].replace(from,to)
  assert.notEqual(changed,pages[key],name+' target must exist')
  assert.ok(validateHindiLocalSearch(localSearchOptions,{...pages,[key]:changed}).length > 0,
    name+' must fail the localized-search policy')
}
mutatePage('no local provider','config',"provider: 'local'","provider: 'algolia'")
mutatePage('no search options','config',"options: localSearchOptions","options: {}")
mutatePage('missing Hindi sidebar','config',"link: '/hi/guide/search-and-navigation'","link: '/hi/guide/missing'")
mutatePage('missing theme access label','config',"langMenuLabel: 'भाषा बदलें'","langMenuLabel: 'Language'")
mutatePage('missing current compiler release link','english',
  '](/releases/'+LATEST_RELEASE+')','](/releases/v0.0.5-alpha.1)')
mutatePage('missing Hindi shortcut','hindi','Ctrl+K','Alt+K')
mutatePage('missing English shortcut','english','⌘+K','Ctrl+J')
mutatePage('missing Hindi crosslink','hindi','](/guide/search-and-navigation)','](/hi/guide/search-and-navigation)')
mutatePage('missing English intro link','englishIntro','](/guide/search-and-navigation)','](/guide/not-found)')
mutatePage('missing Hindi intro link','hindiIntro','](/hi/guide/search-and-navigation)','](/hi/guide/not-found)')
mutatePage('missing README Hindi path','readme','docs/hi/guide/search-and-navigation.md','docs/hi/guide/not-found.md')
assert.ok(validateHindiLocalSearch(localSearchOptions,{...pages,hindi:pages.hindi.replace(/[\u0900-\u097f]/gu,'')}).length,
  'Hindi locale cannot silently become untranslated')
console.log('PASS: 18 negative regressions for Hindi search UI, locale navigation, current release, language parity and keyboard access')
