import { BASE, ORIGIN, sourceRoute } from '../scarp-site/routes.ts'

/**
 * Inspect the actual generated HTML, not merely Markdown source links.
 * This catches broken home-card links, sidebar entries, table-of-contents
 * fragments and translated navigation that Markdown-only scans miss.
 */
export interface PublishedHtmlPage {
  source: string
  html: string
}

function decodedAttribute(value: string): string {
  // All attribute values are escaped by the Scarp renderer; decode the
  // entities used by escapeHtml before interpreting a browser URL.
  return value.replace(/&(?:amp|quot|lt|gt|#39);/g, entity => {
    switch (entity) {
      case '&amp;': return '&'
      case '&quot;': return '"'
      case '&lt;': return '<'
      case '&gt;': return '>'
      default: return "'"
    }
  })
}

function publishedAliases(source: string): string[] {
  const route = sourceRoute(source)
  return route.endsWith('/')
    ? [route, route.slice(0, -1), route + 'index.html']
    : [route, route + '.html']
}

function attributes(html: string, element: string, attribute: string): string[] {
  const tags = new RegExp('<' + element + '\\b[^>]*>', 'gi')
  const attr = new RegExp('(?:\\s)' + attribute + '="([^"]*)"', 'i')
  const result: string[] = []
  for (const tag of html.matchAll(tags)) {
    const value = attr.exec(tag[0])?.[1]
    if (value !== undefined) result.push(decodedAttribute(value))
  }
  return result
}

function pageIds(html: string): string[] {
  // All IDs are quoted by the trusted, generated templates and markdown-it.
  // Do not scan escaped code examples or infer IDs from Markdown headings.
  const tags = html.matchAll(/<[a-z][^>]*>/gi)
  const ids: string[] = []
  for (const tag of tags) {
    const match = /(?:\s)id="([^"]*)"/i.exec(tag[0])
    if (match) ids.push(decodedAttribute(match[1]))
  }
  return ids
}

/**
 * Validate local navigable anchors against the complete generated route and
 * element-ID inventory. External hosts, mailto/tel and static assets are not
 * documentation-page targets; they have separate source and asset checks.
 */
export function auditPublishedLinks(pages: readonly PublishedHtmlPage[]): string[] {
  const errors: string[] = []
  const byRoute = new Map<string, PublishedHtmlPage>()
  const idSets = new Map<PublishedHtmlPage, Set<string>>()
  for (const page of pages) {
    const ids = pageIds(page.html)
    const seen = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) errors.push(page.source + ': duplicate HTML id #' + id)
      seen.add(id)
    }
    idSets.set(page, seen)
    for (const alias of publishedAliases(page.source)) {
      const other = byRoute.get(alias)
      if (other && other !== page) {
        errors.push(page.source + ': generated route collision at ' + alias)
      }
      byRoute.set(alias, page)
    }
  }

  for (const page of pages) {
    const sourceRouteUrl = ORIGIN + sourceRoute(page.source)
    for (const href of attributes(page.html, 'a', 'href')) {
      if (href === '' || href === '#') continue
      let url: URL
      try { url = new URL(href, sourceRouteUrl) }
      catch { errors.push(page.source + ': malformed rendered link ' + href); continue }
      if (url.origin !== ORIGIN || !url.pathname.startsWith(BASE)) continue
      if (url.pathname.startsWith(BASE + 'assets/')) continue
      const target = byRoute.get(url.pathname)
      if (!target) {
        errors.push(page.source + ': rendered link has no generated page ' + href)
        continue
      }
      if (url.hash) {
        let fragment: string
        try { fragment = decodeURIComponent(url.hash.slice(1)) }
        catch { errors.push(page.source + ': malformed anchor encoding ' + href); continue }
        if (fragment && !idSets.get(target)?.has(fragment)) {
          errors.push(page.source + ': rendered link has no target heading/id ' + href)
        }
      }
    }
  }
  return errors
}
