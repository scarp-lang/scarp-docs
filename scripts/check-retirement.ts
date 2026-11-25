import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { documentationPages } from './lib/docs-pages.ts'
import { currentDocumentationSources } from './lib/current-publication.ts'
import { sourceRoute } from './scarp-site/routes.ts'
import { validateSitemap } from './lib/sitemap-policy.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const docs=join(root,'docs')
const dist=join(docs,'.scarp/dist')
assert.ok(existsSync(join(dist,'index.html')),'Build Scarp Docs before checking retirement')
const manifest=JSON.parse(readFileSync(join(root,'data/compiler-latest-release.json'),'utf8')) as {compilerRef:string}
const all=documentationPages(docs)
const active=currentDocumentationSources(all,manifest.compilerRef)
const activeRoutes=new Set(active.map(sourceRoute))
// Published tuple and decimal features must replace the obsolete development preview.
for(const locale of ['', 'hi/']) {
  const lesson=locale+'guide/alpha20-language.md'
  if(manifest.compilerRef==='v0.0.6-alpha.20') {
    assert.ok(active.includes(lesson), 'Current language lesson missing: '+lesson)
    assert.ok(!active.includes(locale+'language/tuple-ordering-development.md'),
      'Published tuple ordering must not retain its development-only page')
  }
}
if(manifest.compilerRef==='v0.0.7-alpha.1') {
  for(const locale of ['', 'hi/']) {
    for(const lesson of ['guide/alpha7-first.md','guide/current-types.md','releases/v0.0.7-alpha.1.md']) {
      assert.ok(active.includes(locale+lesson),'Missing current bilingual guide: '+locale+lesson)
    }
    assert.ok(!active.includes(locale+'releases/v0.0.6-alpha.20.md'),'Previous release remains active')
  }
}
assert.ok(all.length>=200,'Missing historical source fixtures')
assert.ok(all.length-active.length>=100,'Retirement must cover historical pages')
for(const prefix of ['', 'hi/']){
  for(const guide of ['guide/current.md','reference/current.md']){
    const source=readFileSync(join(docs,prefix+guide),'utf8')
    assert.ok(source.includes(manifest.compilerRef),'Current bilingual guide has an obsolete release: '+prefix+guide)
  }
}
const index=JSON.parse(readFileSync(join(dist,'assets/search-index.json'),'utf8')) as Array<{route:string;locale:string}>
assert.equal(index.length,active.length,'Search must contain only current documentation')
assert.deepEqual(new Set(index.map(item=>item.route)),activeRoutes,'Indexed routes are not exactly the current routes')
assert.deepEqual(validateSitemap(readFileSync(join(dist,'sitemap.xml'),'utf8'),active).errors,[],
  'Sitemap must contain only current documentation')
let retired=0
for(const source of all){
  const html=readFileSync(join(dist,source.replace(/\.md$/,'.html')),'utf8')
  const route=sourceRoute(source)
  if(!activeRoutes.has(route)){
    retired++
    assert.match(html,/<meta name="robots" content="noindex, follow"\s*\/>/,
      'Retired document is indexable: '+source)
    assert.ok(html.includes('Retired compiler documentation')||html.includes('पुराने compiler का दस्तावेज़'),
      'Retired route lacks clear migration notice: '+source)
    continue
  }
  assert.ok(!/<meta name="robots" content="noindex, follow"\s*\/>/.test(html),
    'Current guide incorrectly noindexed: '+source)
  for(const link of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/gi)){
    const href=link[1].replaceAll('&amp;','&')
    const parsed=new URL(href,'https://scarp-lang.github.io'+route)
    if(parsed.origin!=='https://scarp-lang.github.io'||!parsed.pathname.startsWith('/scarp-docs/')) continue
    if(parsed.pathname.startsWith('/scarp-docs/assets/')) continue
    assert.ok(activeRoutes.has(parsed.pathname),
      'Current document links to retired compiler content: '+source+' -> '+href)
  }
}
for(const locale of ['', 'hi/']){
  const html=readFileSync(join(dist,locale+'index.html'),'utf8')
  assert.ok(html.includes('/scarp-docs/'+locale+'guide/current'),
    'Current homepage must promote current onboarding')
  assert.ok(!/href="\/scarp-docs\/(?:hi\/)?releases\/v0\.0\.5-/.test(html),
    'Homepage must not promote retired compiler downloads')
}
console.log('PASS: '+active.length+' current pages indexed, '+retired+
  ' retired noindex source routes and zero active-to-retired links')
