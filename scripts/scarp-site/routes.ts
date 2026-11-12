/**
 * Scarp-owned URL contract. This module deliberately imports no site framework.
 * Keep this mapping compatible with public Pages URLs when switching engines.
 */
import { posix } from 'node:path'

export const ORIGIN = 'https://scarp-lang.github.io'
export const BASE = '/scarp-docs/'
export type Locale = 'en' | 'hi'

export function sourceRoute(source: string): string {
  if (!source.endsWith('.md') || source.startsWith('/') || source.includes('\\') ||
      source.includes('?') || source.includes('#') || source.includes(':') ||
      source.split('/').some(s => s === '.' || s === '..' || !s)) {
    throw new TypeError('Invalid Scarp documentation path: ' + source)
  }
  const withoutExtension = source.slice(0, -3)
  if (withoutExtension === 'index') return BASE
  if (withoutExtension.endsWith('/index')) {
    return BASE + withoutExtension.slice(0, -5).split('/').map(encodeURIComponent).join('/') 
  }
  return BASE + withoutExtension.split('/').map(encodeURIComponent).join('/')
}

export function htmlPath(source: string): string {
  if (!source.endsWith('.md') || source.includes('..') || source.startsWith('/') ||
      source.includes('\\')) throw new TypeError('Invalid output route: ' + source)
  return source.slice(0, -3) + '.html'
}

/** The independent renderer, sitemap and live-site checks share a single URL contract. */
export function urlForPage(source: string): string {
  return ORIGIN + sourceRoute(source)
}

export function pairedRoutes(source: string): {
  locale: Locale; route: string; canonical: string; english: string; hindi: string
} {
  const locale: Locale = source.startsWith('hi/') ? 'hi' : 'en'
  const name = locale === 'hi' ? source.slice(3) : source
  const english = ORIGIN + sourceRoute(name)
  const hindi = ORIGIN + sourceRoute('hi/' + name)
  return { locale, route: sourceRoute(source),
    canonical: ORIGIN + sourceRoute(source), english, hindi }
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function localLink(href: string, pageSource: string): string {
  if (!href || href.startsWith('#')) return href
  if (/^(?:https?:|mailto:|tel:)/i.test(href)) return href
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return '#'

  // A query string or fragment is not part of the Markdown filename. Split
  // before detecting .md so links checked against source files by CI also
  // resolve to published extensionless routes in the browser.
  const suffixStart = href.search(/[?#]/)
  const pathname = suffixStart === -1 ? href : href.slice(0, suffixStart)
  const suffix = suffixStart === -1 ? '' : href.slice(suffixStart)

  if (pathname.endsWith('.md')) {
    const source = pathname.startsWith(BASE)
      ? pathname.slice(BASE.length)
      : pathname.startsWith('/')
        ? pathname.slice(1)
        : posix.normalize(posix.join(posix.dirname(pageSource), pathname))
    // Keep traversal and malformed paths inert. sourceRoute validates the
    // fully resolved source path, including attempts to escape docs/.
    try {
      return sourceRoute(source) + suffix
    } catch {
      return '#'
    }
  }
  if (href.startsWith(BASE)) return href
  if (href.startsWith('/')) return BASE + href.slice(1)
  return href
}
