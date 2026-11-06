import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { documentationPages } from '../lib/docs-pages.ts'
import { commandAdvice, FINDER_TEXT, RELEASES, TASKS } from '../../docs/.vitepress/theme/lib/command-finder.ts'
import { escapeHtml, localLink, htmlPath, pairedRoutes, BASE } from './routes.ts'
import { renderMarkdown, type RenderedPage, type HomeAction, type HomeFeature } from './markdown.ts'

const root=resolve(fileURLToPath(new URL('../..',import.meta.url)))
const docsRoot=join(root,'docs')
export const previewRoot=join(root,'artifacts','scarp-engine-preview')
const siteRoot=join(previewRoot,'scarp-docs')
const styles=join(root,'scripts/scarp-site/site.css')
const client=join(root,'scripts/scarp-site/client.ts')
const groupOrder=['guide','tutorials','language','tooling','reference','examples','releases','community','project']
const groupLabels:Record<string,[string,string]>={
  guide:['Getting started','शुरुआत'],
  tutorials:['Verified tutorials','सत्यापित ट्यूटोरियल'],
  language:['Language','भाषा'],
  tooling:['Developer tools','डेवलपर टूल्स'],
  reference:['Reference','संदर्भ'],
  examples:['Examples','उदाहरण'],
  releases:['Published releases','प्रकाशित रिलीज़'],
  community:['Community','समुदाय'],
  project:['Maintainers','अनुरक्षक']
}
const logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Scarp">'+
  '<rect width="128" height="128" rx="22" fill="#eff6ff"/>'+
  '<path d="M96 26H49L28 46L46 64H78L97 83L76 102H29" fill="none" stroke="#1d4ed8" stroke-width="16" stroke-linecap="square" stroke-linejoin="bevel"/></svg>'

interface IndexEntry {route:string;title:string;locale:'en'|'hi';section:string;excerpt:string}
interface PageView {source:string;page:RenderedPage;route:string;locale:'en'|'hi'}

function htmlAttr(text:string):string{return escapeHtml(text)}
function attrs(href:string, cls?:string):string {
  return 'href="'+htmlAttr(href)+'"'+(cls?' class="'+htmlAttr(cls)+'"':'')
}
function localized(en:string,hi:string,locale:'en'|'hi'):string{return locale==='hi'?hi:en}
function groupFor(source:string):string {
  const path=source.startsWith('hi/')?source.slice(3):source
  return path.split('/')[0]==='index.md'?'guide':path.split('/')[0]
}
function homeActions(items: HomeAction[]|undefined, source:string):string {
  return (items??[]).map(action=>'<a '+attrs(localLink(action.link,source),'hero-action '+(action.theme==='brand'?'primary':'secondary'))+'>'+
    escapeHtml(action.text)+'</a>').join('')
}
function homeFeatures(items:HomeFeature[]|undefined,source:string):string{
  return '<div class="features">'+(items??[]).map(item=>
    '<a '+attrs(localLink(item.link,source),'feature')+'><h2>'+escapeHtml(item.title)+'</h2>'+
    '<p>'+escapeHtml(item.details)+'</p></a>').join('')+'</div>'
}

function homeMarkup(page:RenderedPage,source:string):string {
  const hero=page.frontmatter.hero
  if (!hero || page.frontmatter.layout!=='home') return page.html
  return '<div class="hero"><img src="'+BASE+'assets/scarp-mark.svg" width="110" height="110" alt="Scarp"/>'+
    '<p class="hero-kicker">'+escapeHtml(hero.name??'Scarp')+'</p>'+
    '<h1>'+escapeHtml(hero.text??page.title)+'</h1>'+
    '<p>'+escapeHtml(hero.tagline??'')+'</p>'+
    '<div class="hero-actions">'+homeActions(hero.actions,source)+'</div></div>'+
    homeFeatures(page.frontmatter.features,source)+page.html
}
function navigation(locale:'en'|'hi',active:string,views:PageView[]):string {
  const inLocale=views.filter(v=>v.locale===locale && v.source!=='index.md' && v.source!=='hi/index.md')
  const byGroup=new Map<string,PageView[]>()
  for(const v of inLocale){
    const key=groupFor(v.source)
    if(!byGroup.has(key))byGroup.set(key,[])
    byGroup.get(key)!.push(v)
  }
  return '<nav id="side-nav" class="side-nav" aria-label="'+localized('Documentation','दस्तावेज़',locale)+'">'+
    '<a '+attrs(locale==='hi'?BASE+'hi/':BASE,'side-home')+'>'+
    localized('Documentation home','दस्तावेज़ होम',locale)+'</a>'+
    groupOrder.filter(group=>byGroup.has(group)).map(group=>
      '<section class="nav-group"><h2>'+escapeHtml(localized(...(groupLabels[group]??[group,group]),locale))+'</h2>'+
      '<ul>'+byGroup.get(group)!.map(v=>'<li><a '+attrs(v.route,active===v.route?'active':'')+
        (active===v.route?' aria-current="page"':'')+'>'+escapeHtml(v.page.title)+'</a></li>').join('')+'</ul></section>'
    ).join('')+'</nav>'
}
function finderData():string {
  const entries=RELEASES.flatMap(release=>
    TASKS.map(task=>commandAdvice(release.tag,task.id)))
  const json=JSON.stringify({releases:RELEASES,tasks:TASKS,entries,text:FINDER_TEXT})
    .replace(/</g,'\\u003c').replace(/&/g,'\\u0026')
  return '<script id="scarp-command-data" type="application/json">'+json+'</script>'
}

function htmlDocument(view:PageView, views:PageView[]):string{
  const {page,source,route,locale}=view
  const meta=pairedRoutes(source)
  const other=locale==='en'?meta.hindi:meta.english
  const home=page.frontmatter.layout==='home'
  const body=home?homeMarkup(page,source):page.html
  const heading=home||page.headings.some(item=>item.level===1)
    ?'':'<h1 class="page-heading">'+escapeHtml(page.title)+'</h1>'
  const seoDescription=(home?page.frontmatter.hero?.tagline:page.bodyText)??page.bodyText
  const description=seoDescription.slice(0,185)
  const lang=locale==='hi'?'hi-IN':'en-US'
  const target=other.slice('https://scarp-lang.github.io'.length)
  const localeText=localized('हिन्दी','English',locale)
  const title=page.title==='Scarp'?'Scarp Docs':page.title+' · Scarp Docs'
  const searchText=localized('Search documentation','दस्तावेज़ खोजें',locale)
  const contents=page.headings.filter(h=>h.level===2||h.level===3).slice(0,45)
  const toc=contents.length
    ?'<nav class="toc" aria-label="'+localized('On this page','इस पृष्ठ पर',locale)+'"><h2>'+
      localized('On this page','इस पृष्ठ पर',locale)+'</h2><ul>'+contents.map(h=>
        '<li class="toc-level-'+h.level+'"><a href="#'+escapeHtml(h.id)+'">'+
        escapeHtml(h.title)+'</a></li>').join('')+'</ul></nav>':''
  const finder=body.includes('data-command-finder')?finderData():''
  return '<!doctype html><html lang="'+lang+'"><head><meta charset="UTF-8"/>'+
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>'+
    '<meta name="description" content="'+htmlAttr(description)+'"/>'+
    '<title>'+escapeHtml(title)+'</title>'+
    '<link rel="canonical" href="'+meta.canonical+'"/>'+
    '<link rel="alternate" hreflang="en" href="'+meta.english+'"/>'+
    '<link rel="alternate" hreflang="hi" href="'+meta.hindi+'"/>'+
    '<link rel="alternate" hreflang="x-default" href="'+meta.english+'"/>'+
    '<meta property="og:url" content="'+meta.canonical+'"/>'+
    '<meta property="og:locale" content="'+(locale==='hi'?'hi_IN':'en_US')+'"/>'+
    '<link rel="icon" type="image/svg+xml" href="'+BASE+'assets/scarp-mark.svg"/>'+
    '<link rel="stylesheet" href="'+BASE+'assets/scarp-site.css"/>'+
    '<script defer src="'+BASE+'assets/scarp-site.js"></script></head><body>'+
    '<a class="skip-link" href="#main">'+localized('Skip to content','मुख्य सामग्री पर जाएँ',locale)+'</a>'+
    '<header class="site-header"><a class="brand" '+attrs(BASE)+'><img src="'+BASE+'assets/scarp-mark.svg" alt="" width="34" height="34"/><span>Scarp</span></a>'+
    '<nav class="top-nav" aria-label="'+localized('Primary','मुख्य नेविगेशन',locale)+'">'+
    '<a '+attrs(locale==='hi'?BASE+'hi/guide/learning-path':BASE+'guide/learning-path')+'>'+
      localized('Learn','सीखें',locale)+'</a>'+
    '<a '+attrs(locale==='hi'?BASE+'hi/guide/installation-alpha6':BASE+'guide/installation-alpha6')+'>'+
      localized('Install','इंस्टॉल',locale)+'</a>'+
    '<a '+attrs(locale==='hi'?BASE+'hi/releases/v0.0.6-alpha.1':BASE+'releases/v0.0.6-alpha.1')+'>'+
      localized('Releases','रिलीज़',locale)+'</a></nav>'+
    '<div class="header-actions"><a '+attrs(target,'language-link')+' lang="'+(locale==='en'?'hi':'en')+'">'+
      localeText+'</a><button type="button" id="search-open" aria-haspopup="dialog" aria-controls="search-panel">'+
      searchText+' <kbd>K</kbd></button><button type="button" id="theme-toggle" aria-pressed="false" aria-label="'+
      localized('Toggle dark mode','डार्क मोड बदलें',locale)+'">◐</button>'+
    '<button type="button" id="menu-toggle" aria-expanded="false" aria-controls="side-nav" aria-label="'+
      localized('Toggle menu','मेनू बदलें',locale)+'">☰</button></div></header>'+
    '<div class="site-layout">'+navigation(locale,route,views)+
    '<main id="main" tabindex="-1"><article class="doc-content">'+heading+body+'</article></main>'+toc+'</div>'+
    '<dialog id="search-panel" class="search-panel" aria-labelledby="search-title">'+
    '<div class="search-header"><h2 id="search-title">'+searchText+'</h2>'+
    '<button type="button" id="search-close" aria-label="'+localized('Close search','खोज बंद करें',locale)+'">×</button></div>'+
    '<label for="search-query">'+localized('Search all '+(locale==='hi'?'Hindi':'English')+' pages','दस्तावेज़ों में खोजें',locale)+'</label>'+
    '<input id="search-query" type="search" autocomplete="off" placeholder="'+
      localized('Type a keyword…','शब्द लिखें…',locale)+'"/>'+
    '<p id="search-status" role="status" aria-live="polite"></p><ul id="search-results"></ul></dialog>'+
    finder+
    '<footer class="site-footer">'+localized('Experimental Scarp language. Verify each guide against its published compiler release.',
      'Scarp भाषा प्रयोगात्मक है। हर गाइड का प्रकाशित compiler version जाँचें।',locale)+
    ' · <a href="https://github.com/scarp-lang/scarp-docs">MIT documentation source</a></footer>'+
    '</body></html>'
}

export async function buildSite():Promise<{pages:number;assets:number}>{
  // The engine preview NEVER overwrites VitePress production output.
  rmSync(previewRoot,{recursive:true,force:true})
  mkdirSync(join(siteRoot,'assets'),{recursive:true})
  const sources=documentationPages(docsRoot)
  const views=sources.map(source=>{
    const page=renderMarkdown(readFileSync(join(docsRoot,source),'utf8'),source)
    return {page,source,route:pairedRoutes(source).route,locale:pairedRoutes(source).locale}
  })
  assert.equal(views.length,138,'Migration must preserve all 138 paired source pages')
  assert.equal(views.filter(v=>v.locale==='hi').length,69,'Hindi page parity')
  const routes=new Set(views.map(v=>v.route))
  assert.equal(routes.size,views.length,'Generated public routes must be unique')
  const searchIndex:IndexEntry[]=views.map(view=>({
    route:view.route,title:view.page.title,locale:view.locale,
    section:groupFor(view.source),excerpt:view.page.bodyText.slice(0,2500)
  }))
  for(const view of views){
    const dest=join(siteRoot,htmlPath(view.source))
    mkdirSync(resolve(dest,'..'),{recursive:true})
    writeFileSync(dest,htmlDocument(view,views),'utf8')
  }
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    views.map(v=>'<url><loc>'+pairedRoutes(v.source).canonical+'</loc></url>').join('\n')+
    '\n</urlset>\n'
  writeFileSync(join(siteRoot,'sitemap.xml'),sitemap)
  writeFileSync(join(siteRoot,'assets','search-index.json'),JSON.stringify(searchIndex))
  writeFileSync(join(siteRoot,'assets','scarp-mark.svg'),logo)
  writeFileSync(join(siteRoot,'assets','scarp-site.css'),readFileSync(styles,'utf8'))
  // Browser controller is a single import-free TypeScript file. Compile it
  // directly: no VitePress, Vite, Vue, esbuild or client framework.
  const browserScript=ts.transpileModule(readFileSync(client,'utf8'),{
    fileName:'client.ts',
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
    reportDiagnostics:true
  })
  if(browserScript.diagnostics?.length) {
    const details=ts.formatDiagnosticsWithColorAndContext(browserScript.diagnostics,{
      getCanonicalFileName:name=>name,getCurrentDirectory:()=>root,
      getNewLine:()=> '\n'
    })
    throw new Error('Client TypeScript compilation failed: '+details)
  }
  writeFileSync(join(siteRoot,'assets','scarp-site.js'),browserScript.outputText)
  writeFileSync(join(siteRoot,'404.html'),'<!doctype html><html lang="en"><title>Not found · Scarp Docs</title>'+
    '<main><h1>Documentation page not found</h1><a href="'+BASE+'">Scarp Docs</a></main></html>')
  console.log('PASS: independent Scarp TypeScript engine generated '+views.length+
    ' English/Hindi Markdown routes, local CSS/JavaScript and sitemap under '+siteRoot)
  return {pages:views.length,assets:4}
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  await buildSite()
}
