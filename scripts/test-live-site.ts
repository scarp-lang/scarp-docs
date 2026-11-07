import assert from 'node:assert/strict'
import { BASE, ORIGIN, pairedRoutes, urlForPage } from './scarp-site/routes.ts'
import { LIVE_PAGE_SOURCES, verifyLiveSite, type SiteFetcher } from './lib/live-site.ts'

const htmlRouteByUrl = new Map(LIVE_PAGE_SOURCES.map(source => [urlForPage(source), source]))

function fakeSite(options: { wrongCanonical?: boolean; missingHindi?: boolean; missingInstaller?: boolean; missingCss?: boolean; missingSitemapPage?: boolean; duplicateSitemapPage?: boolean } = {}): SiteFetcher {
  return async url => {
    if (url === ORIGIN + BASE + 'sitemap.xml') {
      const sourcePages = options.missingSitemapPage
        ? LIVE_PAGE_SOURCES.filter(source => source !== 'hi/community/social.md')
        : [...LIVE_PAGE_SOURCES]
      if (options.duplicateSitemapPage) sourcePages.push('hi/index.md')
      return new Response(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          sourcePages.map(source => '<url><loc>' + urlForPage(source) + '</loc></url>').join('') +
        '</urlset>',
        { status: 200, headers: { 'content-type': 'application/xml' } }
      )
    }
    if (url.startsWith(ORIGIN + BASE + 'assets/')) {
      return new Response('asset', { status: 200, headers: { 'content-type': 'application/octet-stream' } })
    }
    const source = htmlRouteByUrl.get(url)
    if (!source) return new Response('Not found', { status: 404 })
    if (options.missingHindi && source === 'hi/guide/learning-path.md') {
      return new Response('Not found', { status: 404 })
    }
    if (options.missingInstaller && source === 'hi/guide/installation-alpha6.md') {
      return new Response('Not found', { status: 404 })
    }
    const links = pairedRoutes(source)
    const lang = source.startsWith('hi/') ? 'hi-IN' : 'en-US'
    const canonical = options.wrongCanonical && source === 'guide/learning-path.md'
      ? links.hindi : links.canonical
    const assets = source === 'index.md'
      ? '<script src="/scarp-docs/assets/app.abc123.js"></script>' +
        (options.missingCss ? '' : '<link rel="stylesheet" href="/scarp-docs/assets/style.abc123.css">')
      : ''
    const html = '<!doctype html><html lang="' + lang + '"><head><title>Scarp Docs</title>' +
      '<link rel="canonical" href="' + canonical + '">' +
      '<link rel="alternate" hreflang="en" href="' + links.english + '">' +
      '<link rel="alternate" hreflang="hi" href="' + links.hindi + '">' +
      '<link rel="alternate" hreflang="x-default" href="' + links.english + '">' +
      assets + '</head><body>Scarp</body></html>'
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } })
  }
}

const healthy = await verifyLiveSite(fakeSite(), LIVE_PAGE_SOURCES)
assert.equal(healthy.pages, LIVE_PAGE_SOURCES.length)
assert.equal(healthy.assets, 2)
assert.equal(healthy.sitemap, ORIGIN + BASE + 'sitemap.xml')
assert.equal(healthy.sitemapPages, LIVE_PAGE_SOURCES.length)
await assert.rejects(() => verifyLiveSite(fakeSite({ wrongCanonical: true }), LIVE_PAGE_SOURCES), /canonical mismatch/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingHindi: true }), LIVE_PAGE_SOURCES), /HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingInstaller: true }), LIVE_PAGE_SOURCES), /HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingCss: true }), LIVE_PAGE_SOURCES), /missing its versioned CSS bundle/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingSitemapPage: true }), LIVE_PAGE_SOURCES),
  /Missing sitemap URL/)
await assert.rejects(() => verifyLiveSite(fakeSite({ duplicateSitemapPage: true }), LIVE_PAGE_SOURCES),
  /Duplicate URLs/)
await assert.rejects(() => verifyLiveSite(async () => { throw new Error('Network unavailable') }, LIVE_PAGE_SOURCES),
  /Network unavailable/)
console.log('PASS: bilingual live-site URL, SEO, assets, full sitemap and negative-path smoke checks')
