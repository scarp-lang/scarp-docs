import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASE, ORIGIN, htmlPath, pairedRoutes, urlForPage } from './scarp-site/routes.ts'
import { pageSeoHead } from './scarp-site/seo.ts'
import { documentationPages } from './lib/docs-pages.ts'
import { currentDocumentationSources } from './lib/current-publication.ts'
import { LATEST_RELEASE } from './lib/command-finder.ts'
import { validateSitemap } from './lib/sitemap-policy.ts'
import { verifyLiveSite } from './lib/live-site.ts'
import { auditPublishedLinks, type PublishedHtmlPage } from './lib/site-link-audit.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const docs = join(root, 'docs')
const dist = join(docs, '.scarp', 'dist')

function headTags(html: string, tag: string): Array<Record<string, string>> {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? ''
  const matches = [...head.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\/?>`, 'gi'))]
  return matches.map(match => Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(item => [item[1], item[2]])))
}

assert.ok(existsSync(dist), `Missing site build at ${dist}: run npm run docs:build first`)
const pages = documentationPages(docs)
const activeSources = currentDocumentationSources(pages,LATEST_RELEASE)
let checked = 0
const failures: string[] = []
const renderedPages: PublishedHtmlPage[] = []
for (const path of pages) {
  const rendered = join(dist, path.replace(/\.md$/, '.html'))
  if (!existsSync(rendered)) { failures.push(`${path}: no generated HTML at ${relative(root, rendered)}`); continue }
  const html = readFileSync(rendered, 'utf8')
  renderedPages.push({source:path,html})
  const expected = pairedRoutes(path)
  const links = headTags(html, 'link')
  const canonical = links.filter(attrs => attrs.rel === 'canonical')
  if (canonical.length !== 1 || canonical[0].href !== expected.canonical) {
    failures.push(`${path}: missing/incorrect canonical tag`)
  }
  for (const [locale, url] of [['en', expected.english], ['hi', expected.hindi], ['x-default', expected.english]]) {
    if (!links.some(attrs => attrs.rel === 'alternate' && attrs.hreflang === locale && attrs.href === url)) {
      failures.push(`${path}: missing hreflang ${locale} -> ${url}`)
    }
  }
  const meta = headTags(html, 'meta')
  for (const [tag, attrs] of pageSeoHead(path)) {
    const actual = tag === 'link' ? links : meta
    if (actual.filter(found => Object.entries(attrs).every(([key,value]) => found[key] === value)).length !== 1) {
      failures.push(`${path}: missing/duplicate ${tag} SEO metadata ${JSON.stringify(attrs)}`)
    }
  }
  const lang = path.startsWith('hi/') ? 'hi-IN' : 'en-US'
  if (!new RegExp(`<html\\b[^>]*\\blang="${lang}"`, 'i').test(html)) failures.push(`${path}: expected <html lang="${lang}">`)
  checked++
}
// A page may have valid metadata yet still navigate to a missing local HTML
// route or Hindi heading. Check the actual generated links before deployment.
failures.push(...auditPublishedLinks(renderedPages))
const sitemapFile = join(dist, 'sitemap.xml')
if (!existsSync(sitemapFile)) {
  failures.push('Missing generated sitemap.xml')
} else {
  const sitemap = validateSitemap(readFileSync(sitemapFile, 'utf8'), activeSources)
  failures.push(...sitemap.errors.map(error => 'sitemap.xml: ' + error))
  if (!sitemap.errors.length) console.log('PASS: sitemap contains all ' + sitemap.expected + ' English/Hindi source routes exactly once')
}
// Exercise the exact same acceptance contract used by the post-deployment
// smoke check, against actual production output rather than mock HTML.
// The explicit URL-to-file inventory is intentionally not an open file server.
const outputs = new Map(pages.map(source => [
  urlForPage(source), {path:htmlPath(source),type:'text/html; charset=utf-8'}
]))
for (const [path,type] of [
  ['404.html','text/html; charset=utf-8'],
  ['sitemap.xml','application/xml'],
  ['assets/scarp-site.js','text/javascript'],
  ['assets/scarp-site.css','text/css'],
  ['assets/pages-api.js','text/javascript'],
  ['assets/search-index.js','text/javascript'],
  ['assets/search-index.json','application/json']
]) outputs.set(ORIGIN+BASE+path,{path,type})
try {
  const fetchBuilt = async (url:string):Promise<Response> => {
    const output=outputs.get(url)
    if(!output || !existsSync(join(dist,output.path))) return new Response(null,{status:404})
    return new Response(readFileSync(join(dist,output.path),'utf8'),{
      status:200,headers:{'content-type':output.type}
    })
  }
  const smoke=await verifyLiveSite(fetchBuilt,activeSources)
  // The two imported browser modules and index are not directly linked by
  // HTML, so also check that the production artifact includes them.
  for (const asset of ['pages-api.js','search-index.js','search-index.json']) {
    const response=await fetchBuilt(ORIGIN+BASE+'assets/'+asset)
    assert.equal(response.status,200,'Missing browser dependency '+asset)
    assert.ok((await response.text()).length>0,'Empty browser dependency '+asset)
  }
  console.log('PASS: production artifact satisfies public smoke contract for '+smoke.pages+
    ' pages, '+smoke.sitemapPages+' indexed routes and required browser dependencies')
} catch(error) {
  failures.push('Production smoke preflight: '+(error instanceof Error?error.message:String(error)))
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} static site errors:\n${failures.map(e => `  - ${e}`).join('\n')}`)
  process.exitCode = 1
} else console.log(`PASS: ${checked} built HTML pages, canonical/hreflang, Open Graph and document language`)
