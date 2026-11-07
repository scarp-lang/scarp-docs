import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { urlForPage } from './scarp-site/routes.ts'
import { documentationPages } from './lib/docs-pages.ts'
import { validateSitemap } from './lib/sitemap-policy.ts'

const docs = resolve(fileURLToPath(new URL('../docs/', import.meta.url)))
const sources = documentationPages(docs)
const en = sources.filter(source => !source.startsWith('hi/'))
const hi = sources.filter(source => source.startsWith('hi/'))
assert.equal(en.length, hi.length, 'English and Hindi must have the same page count')
assert.ok(en.length >= 60, 'This test requires the actual multi-page documentation tree')
const urls = sources.map(urlForPage)
const sitemap = (locations: readonly string[]): string =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  locations.map(url => '  <url><loc>' + url + '</loc></url>').join('\n') +
  '\n</urlset>'

const valid = sitemap(urls)
assert.deepEqual(validateSitemap(valid, sources), {
  expected: sources.length, actual: sources.length, errors: []
})
assert.deepEqual(validateSitemap(sitemap([...urls].reverse()), sources).errors, [],
  'sitemap order should not affect coverage')

function mustReject(name: string, xml: string, expected: RegExp): void {
  const errors = validateSitemap(xml, sources).errors
  assert.ok(errors.some(error => expected.test(error)),
    name + ' must fail with expected error; got ' + JSON.stringify(errors))
}
const indexEn = sources.indexOf('index.md')
const indexHi = sources.indexOf('hi/index.md')
assert.ok(indexEn >= 0 && indexHi >= 0)
mustReject('lost English homepage',
  sitemap(urls.filter((_, index) => index !== indexEn)), /Missing sitemap URL/)
mustReject('lost Hindi homepage',
  sitemap(urls.filter((_, index) => index !== indexHi)), /Missing sitemap URL/)
mustReject('duplicate URL', sitemap([...urls, urls[indexHi]]), /Duplicate URLs/)
mustReject('foreign host',
  sitemap(urls.map((url, index) => index === indexEn
    ? url.replace('scarp-lang.github.io', 'example.invalid') : url)), /Unexpected sitemap URL/)
mustReject('wrong GitHub Pages base',
  sitemap(urls.map((url, index) => index === indexHi
    ? url.replace('/scarp-docs/', '/other-docs/') : url)), /Unexpected sitemap URL/)
mustReject('HTML extension',
  sitemap(urls.map((url, index) => index === indexHi ? url + '.html' : url)),
  /Unexpected sitemap URL/)
mustReject('missing loc element',
  valid.replace('<loc>' + urls[indexHi] + '</loc>', '<loc></loc>'),
  /nonempty <loc>/)
mustReject('missing URL closing tag',
  valid.replace('</url>', ''), /Malformed or unclosed/)
mustReject('missing urlset root',
  valid.replace(/<urlset[^>]*>/, '<urls>'), /Missing complete sitemap urlset/)
mustReject('replaced URL by substring superstring',
  valid.replace('<loc>' + urls[indexEn] + '</loc>', '<loc>' + urls[indexEn] + 'fake</loc>'),
  /Unexpected sitemap URL/)
assert.ok(validateSitemap(valid, [...sources, sources[0]]).errors.some(e =>
  e.includes('Duplicate source pages')), 'two source aliases must not silently map to one URL')
console.log('PASS: ' + sources.length +
  ' bilingual route URLs and 11 negative sitemap coverage, parsing and origin regressions')
