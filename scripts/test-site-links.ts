import assert from 'node:assert/strict'
import { auditPublishedLinks, type PublishedHtmlPage } from './lib/site-link-audit.ts'

const baseline: PublishedHtmlPage[] = [
  {
    source: 'index.md',
    html: '<!doctype html><html><body><main id="main">' +
      '<a href="/scarp-docs/guide/lesson?mode=source&amp;lang=hi#first-step">Lesson</a>' +
      '<a href="/scarp-docs/hi/guide/lesson#%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87">हिन्दी</a>' +
      '<a href="/scarp-docs/guide/lesson.html#first-step">Direct HTML</a>' +
      '<a href="https://github.com/scarp-lang/scarp">Compiler</a>' +
      '<a href="mailto:maintainer@example.com">Email</a></main></body></html>'
  },
  {
    source: 'guide/lesson.md',
    html: '<!doctype html><html><body><h1 id="first-step">First step</h1>' +
      '<a href="#first-step">Current heading</a>' +
      '<a href="/scarp-docs/">Home</a>' +
      '<a href="/scarp-docs/hi/guide/lesson">हिन्दी</a></body></html>'
  },
  {
    source: 'hi/guide/lesson.md',
    html: '<!doctype html><html><body><h1 id="नमस्ते">नमस्ते</h1>' +
      '<a href="/scarp-docs/guide/lesson#first-step">English</a></body></html>'
  }
]

const check = (pages: PublishedHtmlPage[]) => auditPublishedLinks(pages)
assert.deepEqual(check(baseline), [], 'Valid bilingual cross-links and Unicode anchors must pass')

const wrongRoute: PublishedHtmlPage[] = [
  {...baseline[0], html: baseline[0].html.replace('/scarp-docs/guide/lesson.html#first-step',
    '/scarp-docs/guide/missing#first-step')},
  ...baseline.slice(1)
]
assert.match(check(wrongRoute).join('\n'), /no generated page.*guide\/missing/)

const wrongFragment: PublishedHtmlPage[] = [
  {...baseline[0], html: baseline[0].html.replace('#first-step', '#missing-heading')},
  ...baseline.slice(1)
]
assert.match(check(wrongFragment).join('\n'), /no target heading\/id.*missing-heading/)

const wrongHindi: PublishedHtmlPage[] = [
  {...baseline[0], html: baseline[0].html.replace(
    '#%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87', '#wrong-hindi')},
  ...baseline.slice(1)
]
assert.match(check(wrongHindi).join('\n'), /no target heading\/id.*wrong-hindi/)

const duplicateIds: PublishedHtmlPage[] = [
  ...baseline.slice(0, 1),
  {...baseline[1], html: baseline[1].html + '<section id="first-step">Duplicated</section>'},
  ...baseline.slice(2)
]
assert.match(check(duplicateIds).join('\n'), /duplicate HTML id #first-step/)

const missingSelf: PublishedHtmlPage[] = [
  {...baseline[0], html: baseline[0].html + '<a href="#unknown">Broken own anchor</a>'},
  ...baseline.slice(1)
]
assert.match(check(missingSelf).join('\n'), /no target heading\/id.*#unknown/)

const encodedInvalid: PublishedHtmlPage[] = [
  {...baseline[0], html: baseline[0].html + '<a href="#%E0%A4">Bad UTF8</a>'},
  ...baseline.slice(1)
]
assert.match(check(encodedInvalid).join('\n'), /malformed anchor encoding/)

assert.deepEqual(check([...baseline, {
  source: 'examples/index.md',
  html: '<html><body><a href="/scarp-docs/examples/">index</a></body></html>'
}]), [], 'Directory-index canonical links must remain accepted')

console.log('PASS: generated HTML link audit, 7 regressions, Unicode fragments, queries, aliases and duplicate IDs')
