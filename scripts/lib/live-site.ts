import assert from 'node:assert/strict'
import { BASE, ORIGIN, pairedRoutes, urlForPage } from '../scarp-site/routes.ts'
import { validateSitemap } from './sitemap-policy.ts'
import { LATEST_RELEASE } from './command-finder.ts'

/**
 * Exercises real public GitHub Pages URLs after deployment, not just the
 * generated files in dist/. Always check both locales and a nested clean URL.
 * Browser-only behavior (mobile navigation, search, theme) still needs manual QA.
 */
/** Old bookmarks must remain reachable without re-exposing retired content. */
export const RETIRED_SMOKE_SOURCES = [
  'language/tuple-ordering-development.md',
  'hi/language/tuple-ordering-development.md',
  'guide/learning-path.md',
  'hi/guide/learning-path.md',
  'guide/installation-alpha6.md',
  'hi/guide/installation-alpha6.md',
  'releases/v0.0.6-alpha.1.md',
  'hi/releases/v0.0.6-alpha.1.md',
  'tutorials/project-symbol-navigation-alpha6.md',
  'hi/tutorials/project-symbol-navigation-alpha6.md'
] as const

/** Active pages come from the exact same inventory as the deployed sitemap. */
export function livePageSources(active: readonly string[]): string[] {
  return [...new Set([...active, ...RETIRED_SMOKE_SOURCES])]
}

export type SiteFetcher = (url: string) => Promise<Response>

export interface LiveSiteResult {
  pages: number
  assets: number
  sitemap: string
  sitemapPages: number
}

function tags(html: string, tag: string): Array<Record<string, string>> {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? ''
  return [...head.matchAll(new RegExp('<' + tag + '\\b([^>]*?)\\/?>', 'gi'))]
    .map(match => Object.fromEntries(
      [...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(attr => [attr[1], attr[2]])
    ))
}

async function request(fetcher: SiteFetcher, url: string): Promise<Response> {
  const response = await fetcher(url)
  assert.equal(response.status, 200, url + ': expected HTTP 200, got ' + response.status)
  // Do not accept a successful redirect to an unrelated host.
  if (response.url) assert.equal(new URL(response.url).origin, ORIGIN, url + ': unexpected redirect origin')
  return response
}

export async function verifyLiveSite(fetcher: SiteFetcher, sitemapSources: readonly string[]): Promise<LiveSiteResult> {
  let home = ''
  const active = new Set(sitemapSources)
  const pages = livePageSources(sitemapSources)
  for (const source of pages) {
    const url = urlForPage(source)
    const response = await request(fetcher, url)
    assert.match(response.headers.get('content-type') ?? '', /text\/html/i, url + ': expected HTML')
    const html = await response.text()
    const expected = pairedRoutes(source)
    const lang = source.startsWith('hi/') ? 'hi-IN' : 'en-US'
    assert.match(html, new RegExp('<html\\b[^>]*\\blang="' + lang + '"', 'i'), url + ': wrong HTML locale')
    const links = tags(html, 'link')
    assert.equal(links.filter(attrs => attrs.rel === 'canonical' && attrs.href === expected.canonical).length, 1, url + ': canonical mismatch')
    for (const [locale, target] of [['en', expected.english], ['hi', expected.hindi], ['x-default', expected.english]]) {
      assert.ok(links.some(attrs => attrs.rel === 'alternate' && attrs.hreflang === locale && attrs.href === target),
        url + ': missing hreflang ' + locale)
    }
    assert.match(html, /<title\b[^>]*>[^<]+<\/title>/i, url + ': missing document title')
    const robots = tags(html, 'meta').filter(attrs => attrs.name === 'robots')
    const noindex = robots.some(attrs => (attrs.content ?? '').toLowerCase().split(/[,\s]+/).includes('noindex'))
    const retiredNotice = lang === 'hi-IN' ? 'पुराने compiler का दस्तावेज़' : 'Retired compiler documentation'
    const prefix = lang === 'hi-IN' ? BASE + 'hi/' : BASE
    if (active.has(source)) {
      assert.ok(!noindex, url + ': active documentation is incorrectly noindexed')
      assert.ok(!html.includes(retiredNotice), url + ': active documentation was replaced by retirement notice')
    } else {
      assert.ok(noindex, url + ': retired documentation is indexable')
      assert.ok(html.includes(retiredNotice), url + ': missing retirement notice')
      assert.ok(html.includes('href="' + prefix + 'guide/current"'), url + ': missing current-guide recovery link')
      assert.ok(html.includes('href="https://scarp-lang.github.io/downloads/"'), url + ': missing official download recovery link')
    }
    assert.ok(html.includes('href="' + prefix + 'releases/' + LATEST_RELEASE + '"'),
      url + ': navigation does not target the current published release')
    if (source === 'index.md') home = html
  }

  // The deployed Pages project must expose the bilingual 404 fallback
  // directly; a successful local build alone does not prove deployment.
  const fallbackUrl = ORIGIN + BASE + '404.html'
  const fallbackResponse = await request(fetcher, fallbackUrl)
  assert.match(fallbackResponse.headers.get('content-type') ?? '', /text\/html/i,
    fallbackUrl + ': expected HTML fallback')
  const fallback = await fallbackResponse.text()
  assert.match(fallback, /<html\b[^>]*\blang="en"/i,
    fallbackUrl + ': missing fallback HTML language')
  assert.match(fallback, /<meta\b[^>]*name="robots"[^>]*content="noindex, follow"/i,
    fallbackUrl + ': not excluded from search indexing')
  assert.match(fallback, /<main\b[^>]*id="main"/i,
    fallbackUrl + ': missing main accessibility landmark')
  assert.ok(fallback.includes('href="' + BASE + '"') &&
      fallback.includes('href="' + BASE + 'hi/"'),
    fallbackUrl + ': missing English/Hindi recovery links')

  // Ensure published HTML points to actual JS and CSS rather than broken bundles.
  const assets = [...new Set([...home.matchAll(/(?:src|href)="(\/scarp-docs\/assets\/[^"?#]+\.(?:js|css))(?:\?[^"]*)?"/g)]
    .map(match => match[1]))]
  const scripts = assets.filter(path => path.endsWith('.js'))
  const styles = assets.filter(path => path.endsWith('.css'))
  assert.ok(scripts.length, 'English homepage is missing its versioned JavaScript bundle')
  assert.ok(styles.length, 'English homepage is missing its versioned CSS bundle')
  for (const asset of [scripts[0], styles[0]]) await request(fetcher, ORIGIN + asset)

  const sitemap = ORIGIN + BASE + 'sitemap.xml'
  const sitemapResponse = await request(fetcher, sitemap)
  const xml = await sitemapResponse.text()
  const checked = validateSitemap(xml, sitemapSources)
  assert.deepEqual(checked.errors, [], sitemap + ': incomplete or invalid sitemap: ' + checked.errors.join('; '))
  return { pages: pages.length, assets: 2, sitemap, sitemapPages: checked.expected }
}
