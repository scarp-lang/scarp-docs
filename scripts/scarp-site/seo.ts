import { escapeHtml, pairedRoutes } from './routes.ts'

/** Framework-independent metadata. Do not infer the locale from rendered text. */
export function pageSeoHead(source: string): Array<[string, Record<string, string>]> {
  if (source === '404.md') return []
  const { canonical, english, hindi, locale } = pairedRoutes(source)
  return [
    ['link', { rel: 'canonical', href: canonical }],
    ['link', { rel: 'alternate', hreflang: 'en', href: english }],
    ['link', { rel: 'alternate', hreflang: 'hi', href: hindi }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: english }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:locale', content: locale === 'hi' ? 'hi_IN' : 'en_US' }]
  ]
}

/** Escapes all attributes instead of joining untrusted URLs into HTML. */
export function renderSeoHead(source: string): string {
  return pageSeoHead(source).map(([tag, attrs]) =>
    '<' + tag + ' ' + Object.entries(attrs)
      .map(([key, value]) => key + '="' + escapeHtml(value) + '"')
      .join(' ') + '/>'
  ).join('')
}
