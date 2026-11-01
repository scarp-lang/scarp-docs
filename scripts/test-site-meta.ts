import assert from 'node:assert/strict'
import { pairedUrls, pageSeoHead, urlForPage } from '../docs/.vitepress/site-meta.ts'

const en = pairedUrls('guide/first-program.md')
const hi = pairedUrls('hi/guide/first-program.md')
assert.equal(en.english, 'https://scarp-lang.github.io/scarp-docs/guide/first-program')
assert.equal(en.hindi, 'https://scarp-lang.github.io/scarp-docs/hi/guide/first-program')
assert.equal(en.canonical, en.english)
assert.equal(hi.canonical, en.hindi)
assert.equal(hi.english, en.english)
assert.equal(en.locale, 'en')
assert.equal(hi.locale, 'hi')
assert.equal(urlForPage('index.md'), 'https://scarp-lang.github.io/scarp-docs/')
assert.equal(urlForPage('hi/index.md'), 'https://scarp-lang.github.io/scarp-docs/hi/')
assert.equal(urlForPage('examples/index.md'), 'https://scarp-lang.github.io/scarp-docs/examples/')
assert.equal(urlForPage('hi/examples/index.md'), 'https://scarp-lang.github.io/scarp-docs/hi/examples/')
for (const invalid of ['/index.md', '../index.md', 'hi/../index.md', 'https://x.md', 'guide/file.html', 'hi\\index.md']) {
  assert.throws(() => urlForPage(invalid), TypeError, invalid)
}
const enHead = pageSeoHead('index.md')
const hiHead = pageSeoHead('hi/index.md')
assert.deepEqual(enHead.filter(([tag, props]) => tag === 'link' && props.rel === 'alternate').map(([, props]) => props.hreflang), ['en', 'hi', 'x-default'])
assert.deepEqual(hiHead.filter(([tag, props]) => tag === 'link' && props.rel === 'alternate').map(([, props]) => props.hreflang), ['en', 'hi', 'x-default'])
assert.equal(hiHead.find(([tag, props]) => tag === 'meta' && props.property === 'og:locale')?.[1].content, 'hi_IN')
assert.equal(pageSeoHead('404.md').length, 0)
console.log('PASS: canonical URL, paired hreflang, homepage, locale and invalid path checks')
