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
  if (href.startsWith(BASE)) return href
  if (href.startsWith('/')) return BASE + href.slice(1)
  const [pathname, fragment = ''] = href.split('#', 2)
  const isMarkdown = pathname.endsWith('.md')
  if (isMarkdown) {
    const normalized = posix.normalize(posix.join(posix.dirname(pageSource), pathname))
    if (normalized.startsWith('../') || normalized.startsWith('/')) return '#'
    return sourceRoute(normalized) + (fragment ? '#' + fragment : '')
  }
  return href
}
