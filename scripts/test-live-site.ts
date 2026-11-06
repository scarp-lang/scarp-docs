import assert from 'node:assert/strict'
import { DOCS_BASE, SITE_ORIGIN, pairedUrls, urlForPage } from '../docs/.vitepress/site-meta.ts'
import { LIVE_PAGE_SOURCES, verifyLiveSite, type SiteFetcher } from './lib/live-site.ts'

const htmlRouteByUrl = new Map(LIVE_PAGE_SOURCES.map(source => [urlForPage(source), source]))

function fakeSite(options: { wrongCanonical?: boolean; missingHindi?: boolean; missingCss?: boolean } = {}): SiteFetcher {
  return async url => {
    if (url === SITE_ORIGIN + DOCS_BASE + 'sitemap.xml') {
      return new Response(
        ['index.md', 'hi/index.md', 'guide/learning-path.md', 'hi/guide/learning-path.md']
          .map(source => '<loc>' + urlForPage(source) + '</loc>').join(''),
        { status: 200, headers: { 'content-type': 'application/xml' } }
      )
    }
    if (url.startsWith(SITE_ORIGIN + DOCS_BASE + 'assets/')) {
      return new Response('asset', { status: 200, headers: { 'content-type': 'application/octet-stream' } })
    }
    const source = htmlRouteByUrl.get(url)
    if (!source) return new Response('Not found', { status: 404 })
    if (options.missingHindi && source === 'hi/guide/learning-path.md') {
      return new Response('Not found', { status: 404 })
    }
    const links = pairedUrls(source)
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

const healthy = await verifyLiveSite(fakeSite())
assert.equal(healthy.pages, LIVE_PAGE_SOURCES.length)
assert.equal(healthy.assets, 2)
assert.equal(healthy.sitemap, SITE_ORIGIN + DOCS_BASE + 'sitemap.xml')
await assert.rejects(() => verifyLiveSite(fakeSite({ wrongCanonical: true })), /canonical mismatch/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingHindi: true })), /HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingCss: true })), /missing its versioned CSS bundle/)
await assert.rejects(() => verifyLiveSite(async () => { throw new Error('Network unavailable') }), /Network unavailable/)
console.log('PASS: bilingual live-site URL, SEO, assets, sitemap and negative-path smoke checks')
