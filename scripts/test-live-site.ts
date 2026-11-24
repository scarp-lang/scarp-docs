import assert from 'node:assert/strict'
import { BASE, ORIGIN, pairedRoutes, urlForPage } from './scarp-site/routes.ts'
import { livePageSources, verifyLiveSite, type SiteFetcher } from './lib/live-site.ts'
import { currentDocumentationSources } from './lib/current-publication.ts'
import { documentationPages } from './lib/docs-pages.ts'
import { LATEST_RELEASE } from './lib/command-finder.ts'
import { fileURLToPath } from 'node:url'

const active = currentDocumentationSources(documentationPages(fileURLToPath(new URL('../docs/', import.meta.url))), LATEST_RELEASE)
const LIVE_PAGE_SOURCES = livePageSources(active)
const activeSet = new Set(active)

const htmlRouteByUrl = new Map(LIVE_PAGE_SOURCES.map(source => [urlForPage(source), source]))

function fakeSite(options: { wrongCanonical?: boolean; missingHindi?: boolean; missingInstaller?: boolean; missingCss?: boolean; missingSitemapPage?: boolean; duplicateSitemapPage?: boolean; missingFallback?: boolean; missingFallbackHindi?: boolean; indexableFallback?: boolean; indexableRetired?: boolean; missingRetirementNotice?: boolean; noindexActive?: boolean; staleNavigation?: boolean; missingRecovery?: boolean; extraRetiredSitemap?: boolean } = {}): SiteFetcher {
  return async url => {
    if (url === ORIGIN + BASE + '404.html') {
      if (options.missingFallback) return new Response('Not found',{status:404})
      const html = '<!doctype html><html lang="en"><head>'+
        '<meta name="robots" content="'+(options.indexableFallback?'index':'noindex, follow')+'"/>'+
        '<title>Page not found · Scarp Docs</title></head><body>'+
        '<main id="main"><h1>Page not found</h1>'+
        '<a href="'+BASE+'">English documentation</a>'+
        (options.missingFallbackHindi?'':'<a href="'+BASE+'hi/">हिन्दी दस्तावेज़</a>')+
        '</main></body></html>'
      return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8'}})
    }
    if (url === ORIGIN + BASE + 'sitemap.xml') {
      const sourcePages = options.missingSitemapPage
        ? active.filter(source => source !== 'hi/community/social.md')
        : [...active]
      if (options.duplicateSitemapPage) sourcePages.push('hi/index.md')
      if (options.extraRetiredSitemap) sourcePages.push('language/tuple-ordering-development.md')
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
    const retired = !activeSet.has(source)
    const prefix = lang === 'hi-IN' ? BASE + 'hi/' : BASE
    const retirementNotice = lang === 'hi-IN' ? 'पुराने compiler का दस्तावेज़' : 'Retired compiler documentation'
    const robots = (retired && !options.indexableRetired) || (!retired && options.noindexActive)
      ? '<meta name="robots" content="noindex, follow"/>' : ''
    const html = '<!doctype html><html lang="' + lang + '"><head><title>Scarp Docs</title>' +
      '<link rel="canonical" href="' + canonical + '">' +
      '<link rel="alternate" hreflang="en" href="' + links.english + '">' +
      '<link rel="alternate" hreflang="hi" href="' + links.hindi + '">' +
      '<link rel="alternate" hreflang="x-default" href="' + links.english + '">' +
      assets + robots + '</head><body>' +
      '<a href="' + prefix + 'releases/' + (options.staleNavigation ? 'v0.0.6-alpha.1' : LATEST_RELEASE) + '">Release</a>' +
      (retired
        ? (options.missingRetirementNotice ? '' : retirementNotice) +
          (options.missingRecovery ? '' : '<a href="' + prefix + 'guide/current">Current</a>') +
          '<a href="https://scarp-lang.github.io/downloads/">Downloads</a>'
        : 'Scarp') + '</body></html>'
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } })
  }
}

const healthy = await verifyLiveSite(fakeSite(), active)
assert.equal(healthy.pages, LIVE_PAGE_SOURCES.length)
assert.equal(healthy.assets, 2)
assert.equal(healthy.sitemap, ORIGIN + BASE + 'sitemap.xml')
assert.equal(healthy.sitemapPages, active.length)
await assert.rejects(() => verifyLiveSite(fakeSite({ indexableRetired: true }), active), /retired documentation is indexable/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingRetirementNotice: true }), active), /missing retirement notice/)
await assert.rejects(() => verifyLiveSite(fakeSite({ noindexActive: true }), active), /active documentation is incorrectly noindexed/)
await assert.rejects(() => verifyLiveSite(fakeSite({ staleNavigation: true }), active), /navigation does not target the current published release/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingRecovery: true }), active), /missing current-guide recovery link/)
await assert.rejects(() => verifyLiveSite(fakeSite({ extraRetiredSitemap: true }), active), /Unexpected sitemap URL/)
await assert.rejects(() => verifyLiveSite(fakeSite({ wrongCanonical: true }), active), /canonical mismatch/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingHindi: true }), active), /HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingInstaller: true }), active), /HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingCss: true }), active), /missing its versioned CSS bundle/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingFallback: true }), active),
  /404.html: expected HTTP 200, got 404/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingFallbackHindi: true }), active),
  /missing English\/Hindi recovery links/)
await assert.rejects(() => verifyLiveSite(fakeSite({ indexableFallback: true }), active),
  /not excluded from search indexing/)
await assert.rejects(() => verifyLiveSite(fakeSite({ missingSitemapPage: true }), active),
  /Missing sitemap URL/)
await assert.rejects(() => verifyLiveSite(fakeSite({ duplicateSitemapPage: true }), active),
  /Duplicate URLs/)
await assert.rejects(() => verifyLiveSite(async () => { throw new Error('Network unavailable') }, active),
  /Network unavailable/)
console.log('PASS: bilingual live-site URL, SEO, assets, full sitemap and negative-path smoke checks')
