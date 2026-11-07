import { LATEST_RELEASE } from './command-finder.ts'

/** Guard user-facing language consistency without importing the VitePress app. */
interface SearchTranslationBlock {
  [key: string]: string | Record<string, string> | undefined
}
export interface SearchLocalizationOptions {
  locales?: Record<string, {
    translations?: {
      button?: Record<string, string>
      modal?: SearchTranslationBlock
    }
  }>
}
export interface SearchLocalizationSources {
  config: string
  readme: string
  english: string
  hindi: string
  englishIntro: string
  hindiIntro: string
}
const buttonKeys = ['buttonText', 'buttonAriaLabel'] as const
const modalKeys = [
  'displayDetails', 'resetButtonTitle', 'backButtonTitle', 'noResultsText'
] as const
const footerKeys = [
  'selectText', 'selectKeyAriaLabel', 'navigateText',
  'navigateUpKeyAriaLabel', 'navigateDownKeyAriaLabel',
  'closeText', 'closeKeyAriaLabel'
] as const

export function validateHindiLocalSearch(
  options: SearchLocalizationOptions,
  pages: SearchLocalizationSources
): string[] {
  const failures: string[] = []
  const translations = options.locales?.hi?.translations
  const button = translations?.button ?? {}
  // On mobile the search placeholder is visually hidden, so the translated
  // aria-label must name the actual button. Desktop uses its visible DOM text
  // directly; the locally installed theme performs this responsive switch.
  if (button.buttonText && button.buttonAriaLabel !== button.buttonText) {
    failures.push('Hindi mobile search accessible name differs from its translated button')
  }
  const modal = translations?.modal ?? {}
  const footerCandidate = modal.footer
  const footer = footerCandidate && typeof footerCandidate === 'object'
    ? footerCandidate : {}
  const isTranslated = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length >= 2 && /[\u0900-\u097f]/u.test(value)

  for (const key of buttonKeys) {
    if (!isTranslated(button[key])) failures.push('Hindi search button missing translated ' + key)
  }
  for (const key of modalKeys) {
    if (!isTranslated(modal[key])) failures.push('Hindi search modal missing translated ' + key)
  }
  for (const key of footerKeys) {
    if (!isTranslated(footer[key])) failures.push('Hindi search keyboard hint missing translated ' + key)
  }

  const {config,readme,english,hindi,englishIntro,hindiIntro} = pages
  for (const snippet of [
    "import { localSearchOptions } from './local-search'",
    "search: { provider: 'local', options: localSearchOptions }",
    "link: '/guide/search-and-navigation'",
    "link: '/hi/guide/search-and-navigation'",
    "lang: 'hi-IN'",
    "link: '/hi/'"
  ]) {
    if (!config.includes(snippet)) failures.push('VitePress config missing ' + snippet)
  }
  if (config.includes("provider: 'algolia'")) {
    failures.push('An external search provider must not replace client-side search')
  }
  for (const key of [
    'sidebarMenuLabel','returnToTopLabel','langMenuLabel',
    'skipToContentLabel',
    'darkModeSwitchLabel','lightModeSwitchTitle','darkModeSwitchTitle'
  ]) {
    const pattern = new RegExp('\\b'+key+'\\s*:\\s*([\\x27\\x22])([^\\x27\\x22]+)\\1')
    const value = pattern.exec(config)?.[2]
    if (!isTranslated(value)) failures.push('Hindi accessible theme control not translated: ' + key)
  }
  for (const [label,text,localePrefix] of [
    ['English',english,''],
    ['Hindi',hindi,'/hi']
  ]) {
    if (!text.startsWith('# ')) failures.push(label + ' search help missing top heading')
    for (const marker of [
      'Ctrl+K','⌘+K','Enter','Esc',
      ']('+localePrefix+'/guide/learning-path)',
      ']('+localePrefix+'/releases/'+LATEST_RELEASE+')',
      ']('+localePrefix+'/reference/status)',
      ']('+localePrefix+'/tooling/cli-alpha6)'
    ]) {
      if (!text.includes(marker)) failures.push(label + ' search help missing ' + marker)
    }
  }
  if ((hindi.match(/[\u0900-\u097f]/gu) ?? []).length < 120) {
    failures.push('Hindi search help needs a substantial original translation')
  }
  if (isTranslated(button.buttonText) && !hindi.includes(button.buttonText)) {
    failures.push('Hindi help must identify the actual translated search button')
  }
  if (!english.includes('](/hi/guide/search-and-navigation)') ||
      !hindi.includes('](/guide/search-and-navigation)')) {
    failures.push('Search help must cross-link both language versions')
  }
  if (!englishIntro.includes('](/guide/search-and-navigation)') ||
      !hindiIntro.includes('](/hi/guide/search-and-navigation)')) {
    failures.push('Both introductions must offer localized search help')
  }
  if (!readme.includes('docs/guide/search-and-navigation.md') ||
      !readme.includes('docs/hi/guide/search-and-navigation.md')) {
    failures.push('README must link both search help pages')
  }
  return failures
}
