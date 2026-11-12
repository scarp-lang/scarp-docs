import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSite, previewRoot } from './build.ts'
import { renderMarkdown, splitFrontMatter } from './markdown.ts'
import { escapeHtml, localLink, htmlPath, pairedRoutes, sourceRoute } from './routes.ts'
import { documentationPages } from '../lib/docs-pages.ts'
import { urlForPage } from './routes.ts'
import { validateSitemap } from '../lib/sitemap-policy.ts'
import { auditPublishedLinks, type PublishedHtmlPage } from '../lib/site-link-audit.ts'
import { LATEST_RELEASE } from '../lib/command-finder.ts'
import { currentPublishedCompilerTag, currentCompilerReleaseRoute } from './current-release.ts'

const root=resolve(fileURLToPath(new URL('../..',import.meta.url)))
const docs=join(root,'docs')
const site=join(previewRoot,'scarp-docs')
let assertions=0
function check(condition:boolean,message:string):void{assert.ok(condition,message);assertions++}

assert.equal(sourceRoute('index.md'),'/scarp-docs/')
assert.equal(sourceRoute('hi/index.md'),'/scarp-docs/hi/')
assert.equal(sourceRoute('examples/index.md'),'/scarp-docs/examples/')
assert.equal(sourceRoute('hi/examples/index.md'),'/scarp-docs/hi/examples/')
assert.equal(sourceRoute('guide/first-program.md'),'/scarp-docs/guide/first-program')
assert.equal(pairedRoutes('hi/guide/first-program.md').english,
  'https://scarp-lang.github.io/scarp-docs/guide/first-program')
assert.equal(htmlPath('hi/guide/first-program.md'),'hi/guide/first-program.html')
assert.equal(localLink('/guide/learning-path','index.md'),'/scarp-docs/guide/learning-path')
assert.equal(localLink('/hi/','index.md'),'/scarp-docs/hi/')
assert.equal(localLink('https://github.com/scarp-lang','index.md'),
  'https://github.com/scarp-lang')
assert.equal(localLink('javascript:alert(1)','index.md'),'#')
assert.equal(localLink('../guide/first-program.md','tutorials/test.md'),
  '/scarp-docs/guide/first-program')
assert.equal(escapeHtml('<script>&"\''),
  '&lt;script&gt;&amp;&quot;&#39;')
for(const invalid of ['/index.md','hi/../index.md','hi\\index.md','bad?x.md','https://x.md']){
  assert.throws(()=>sourceRoute(invalid),TypeError,invalid)
}
assert.throws(()=>splitFrontMatter('---\nkey: value\n'),/Unclosed/)
const home=splitFrontMatter(readFileSync(join(docs,'index.md'),'utf8'))
check(home.matter.layout==='home','English front matter must include home layout')
check((home.matter.features?.length??0)>10,'Home YAML feature cards must be parsed')
const fixture=renderMarkdown([
  '# परीक्षण Heading',
  '## Duplicate test',
  '## Duplicate test',
  '[internal](/guide/first-program)',
  '[external](https://github.com/scarp-lang)',
  '<script>alert("xss")</script>',
  '~~~scarp',
  'funcra sample() -> integer {',
  '  // <script>alert(1)</script>',
  '  return 42;',
  '}',
  '~~~',
  '| One | Two |',
  '| --- | --- |',
  '| first | second |',
  '::: warning ध्यान दें',
  'User content must be parsed safely.',
  ':::',
  '<ScarpCommandFinder />'
].join('\n'),'guide/test.md')
check(fixture.headings[0].id==='परीक्षण-heading','Devanagari heading must retain Unicode marks')
check(fixture.headings[1].id==='duplicate-test','Heading slug must be stable')
check(fixture.headings[2].id==='duplicate-test-1','Duplicate headings must get distinct IDs')
check(fixture.html.includes('href="/scarp-docs/guide/first-program"'),'Internal links must use GitHub Pages base')
check(fixture.html.includes('rel="noopener noreferrer"'),'External links should be hardened')
check(!fixture.html.includes('<script>alert('),'Raw HTML must not execute')
check(fixture.html.includes('&lt;script&gt;'),'Raw HTML must be escaped')
check(fixture.html.includes('syntax-keyword'),'Scarp code highlighting must be independent')
check(fixture.html.includes('data-command-finder'),'Interactive widget must be preserved')
check(fixture.html.includes('scarp-callout'),'Admonitions must render as accessible callouts')
check(fixture.html.includes('class="table-scroll" tabindex="0"'),
  'Wide Markdown tables must be keyboard scrollable')
check(fixture.html.includes('tabindex="0"'),'Scrollable code must be keyboard focusable')


const inertExamples=renderMarkdown(["~~~text","::: danger Fenced tilde marker","<ScarpCommandFinder />","~~~","```text","::: warning Fenced backtick marker","<PagesDeployments />","```","Inline: `<ScarpCommandFinder />`","::: note Active callout","Visible callout.",":::","<ScarpCommandFinder />","<PagesDeployments />"].join('\n'),'guide/test.md')
check(inertExamples.html.includes('::: danger Fenced tilde marker'),
  'Tilde fenced callout syntax must remain literal example text')
check(inertExamples.html.includes('::: warning Fenced backtick marker'),
  'Backtick fenced callout syntax must remain literal example text')
check(inertExamples.html.includes('&lt;ScarpCommandFinder /&gt;'),
  'Fenced or inline command widget source must remain escaped text')
check(inertExamples.html.includes('&lt;PagesDeployments /&gt;'),
  'Fenced deployment widget source must remain escaped text')
check((inertExamples.html.match(/data-command-finder/g)??[]).length===1,
  'Only a standalone command widget outside code may render')
check((inertExamples.html.match(/data-deployments/g)??[]).length===1,
  'Only a standalone deployment widget outside code may render')
check((inertExamples.html.match(/class="scarp-callout/g)??[]).length===1,
  'Only the real callout outside code may render')
check(inertExamples.html.includes('Visible callout.'),
  'A valid callout should remain rendered after fenced examples')

const latest = JSON.parse(readFileSync(join(root,'data/compiler-latest-release.json'),'utf8')) as Record<string,unknown>
check(currentPublishedCompilerTag(latest)===LATEST_RELEASE,'Current manifest and CLI release table must agree')
assert.equal(currentCompilerReleaseRoute(LATEST_RELEASE,'en'),
  '/scarp-docs/releases/'+LATEST_RELEASE)
assert.equal(currentCompilerReleaseRoute(LATEST_RELEASE,'hi'),
  '/scarp-docs/hi/releases/'+LATEST_RELEASE)
for(const [key,invalid] of [
  ['compilerRef','v0.0.6-alpha.1'],
  ['compilerRef','../../release'],
  ['compilerCommit','0'.repeat(40)],
  ['compilerRepository','unknown/compiler'],
  ['status','planned'],
  ['releasedAt','not-a-timestamp'],
  ['assets',[]]
] as const) {
  assert.throws(()=>currentPublishedCompilerTag({...latest,[key]:invalid}),{name:'AssertionError'},
    'Invalid current compiler metadata escaped guard: '+key)
}
assert.throws(()=>currentCompilerReleaseRoute('v0.0.6-alpha.1','en'))

const sources=documentationPages(docs)
check(sources.length>=142,'Published docs dropped below the verified 142-page baseline')
for(const source of sources){
  assert.equal(pairedRoutes(source).canonical,urlForPage(source),
    'Own engine must preserve canonical route for '+source)
}
assert.deepEqual(await buildSite(),{pages:sources.length,assets:4})
const htmlPaths=new Set<string>()
const renderedPages: PublishedHtmlPage[] = []
for(const source of sources) {
  const dest=join(site,htmlPath(source))
  check(existsSync(dest),'Missing generated page: '+source)
  const html=readFileSync(dest,'utf8')
  renderedPages.push({source,html})
  const meta=pairedRoutes(source)
  check(html.startsWith('<!doctype html><html lang="'+(meta.locale==='hi'?'hi-IN':'en-US')+'">'),
    'Incorrect page locale: '+source)
  check(html.includes('rel="canonical" href="'+meta.canonical+'"'),
    'Missing canonical: '+source)
  check(html.includes('hreflang="hi" href="'+meta.hindi+'"')&&
        html.includes('hreflang="en" href="'+meta.english+'"'),
    'Missing reciprocal translated links: '+source)
  check(html.includes('id="main"')&&html.includes('class="skip-link"'),
    'Accessible main landmark missing: '+source)
  check(html.includes('assets/scarp-site.js')&&html.includes('assets/scarp-site.css'),
    'No framework-free browser assets: '+source)
  check(!html.includes('<ScarpCommandFinder />')&&!html.includes('<PagesDeployments />'),
    'Unrendered historical widget in '+source)
  htmlPaths.add(htmlPath(source))
}
assert.equal(htmlPaths.size,sources.length)
assert.deepEqual(auditPublishedLinks(renderedPages), [],
  'Scarp engine must not emit broken cross-language links or heading fragments')
const homeHtml=readFileSync(join(site,'index.html'),'utf8')
const hindiHome=readFileSync(join(site,'hi/index.html'),'utf8')
check(homeHtml.includes('Build Beyond Boundaries.'),'English homepage hero missing')
check(hindiHome.includes('सीमाओं से आगे'),'Hindi homepage hero missing')
check(homeHtml.includes('class="features"'),'Feature cards missing')
check(homeHtml.includes('href="'+currentCompilerReleaseRoute(LATEST_RELEASE,'en')+'">Install</a>'),
  'English Install menu must open the current published archive/checksum guide')
check(hindiHome.includes('href="'+currentCompilerReleaseRoute(LATEST_RELEASE,'hi')+'">इंस्टॉल</a>'),
  'Hindi Install menu must open the same published compiler release')
check(homeHtml.includes('href="/scarp-docs/reference/status">Releases</a>'),
  'English releases menu must display the historical version matrix')
check(hindiHome.includes('href="/scarp-docs/hi/reference/status">रिलीज़</a>'),
  'Hindi releases menu must display the historical version matrix')
const finder=readFileSync(join(site,'tooling/command-finder.html'),'utf8')
check(finder.includes('id="scarp-command-data"'),'Release-scoped CLI model missing')
check(finder.includes(LATEST_RELEASE),'Latest published release missing')
const dev=readFileSync(join(site,'project/deployments.html'),'utf8')
check(dev.includes('data-load-deployments'),'Deployment widget missing')
const search=JSON.parse(readFileSync(join(site,'assets/search-index.json'),'utf8')) as Array<{
  locale:string;title:string;route:string;excerpt:string
}>
check(search.length===sources.length,'All docs must be in local search index')
check(search.filter(x=>x.locale==='hi').length===sources.filter(path=>path.startsWith('hi/')).length,'Hindi search parity')
check(search.some(x=>x.excerpt.includes('funcra')),'Scarp syntax must be searchable')
check(search.every(x=>x.route.startsWith('/scarp-docs/')),'Search routes must use correct base')
check(existsSync(join(site,'assets/scarp-site.js')),'Browser TypeScript did not compile')
check(existsSync(join(site,'assets/scarp-site.css')),'Own CSS missing')
const sitemap=readFileSync(join(site,'sitemap.xml'),'utf8')
assert.deepEqual(validateSitemap(sitemap,sources).errors,[],'Sitemap must precisely cover published sources')
console.log('PASS: '+assertions+' Scarp-owned engine assertions, '+sources.length+' paired routes, bilingual SEO, safe Markdown, offline search, home layout, release-aware CLI and sitemap')
