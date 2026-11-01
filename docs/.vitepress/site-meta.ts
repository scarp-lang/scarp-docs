/**
 * Pure, side-effect-free URL helpers for Scarp Docs' paired English/Hindi pages.
 * The same helpers power generated page metadata and post-build assertions.
 */
export const SITE_ORIGIN = 'https://scarp-lang.github.io' as const
export const DOCS_BASE = '/scarp-docs/' as const

export type DocsLocale = 'en' | 'hi'
export interface PairedUrls {
  canonical: string
  english: string
  hindi: string
  locale: DocsLocale
}

const isPage = (path: string): boolean =>
  path.endsWith('.md') && !path.startsWith('/') &&
  !/[\\?#:]/.test(path) && !path.split('/').some(segment => segment === '..' || segment === '.')

/** Map a source Markdown path to the public clean URL, without .md/.html. */
export function urlForPage(relativePath: string): string {
  if (!isPage(relativePath)) throw new TypeError(`Invalid documentation source path: ${relativePath}`)
  const route = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
  const encoded = route.split('/').filter(Boolean).map(encodeURIComponent).join('/')
  return `${SITE_ORIGIN}${DOCS_BASE}${encoded}${route.endsWith('/') && encoded ? '/' : ''}`
}

/** Both locales have matching paths, enforced by npm run check:i18n. */
export function pairedUrls(relativePath: string): PairedUrls {
  const isHindi = relativePath.startsWith('hi/')
  const englishPath = isHindi ? relativePath.slice(3) : relativePath
  const hindiPath = `hi/${englishPath}`
  return {
    canonical: urlForPage(relativePath),
    english: urlForPage(englishPath),
    hindi: urlForPage(hindiPath),
    locale: isHindi ? 'hi' : 'en'
  }
}

/** VitePress HeadConfig tuple; explicit attributes preserve SEO language semantics. */
export function pageSeoHead(relativePath: string): Array<[string, Record<string, string>]> {
  if (relativePath === '404.md') return []
  const { canonical, english, hindi, locale } = pairedUrls(relativePath)
  return [
    ['link', { rel: 'canonical', href: canonical }],
    ['link', { rel: 'alternate', hreflang: 'en', href: english }],
    ['link', { rel: 'alternate', hreflang: 'hi', href: hindi }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: english }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:locale', content: locale === 'hi' ? 'hi_IN' : 'en_US' }]
  ]
}
