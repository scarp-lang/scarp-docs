import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep, join } from 'node:path'
import { chromium, type BrowserContext, type Page } from 'playwright'
import { auditOfflineAccessibility } from '../lib/offline-a11y.ts'
import { previewRoot } from './build.ts'
import { LATEST_RELEASE } from '../lib/command-finder.ts'
import { SUCCESSFUL_RUNS_ENDPOINT } from './pages-api.ts'

const root=process.argv[2]?resolve(process.argv[2]):resolve(previewRoot,'scarp-docs')
const base='/scarp-docs/'
let assertions=0
const mime:Record<string,string>={
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json',
  '.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml'
}
const server=createServer((req,res)=>{
  const pathname=new URL(req.url??'/', 'http://127.0.0.1').pathname
  if(!pathname.startsWith(base)||pathname.includes('\\')||
    pathname.split('/').some(x=>x==='..')){
    res.writeHead(404).end('Not found')
    return
  }
  const tail=decodeURIComponent(pathname.slice(base.length))
  // Keep test-server routing aligned with both shipped preview servers.
  // Versioned docs slug endings like ".8" are not asset extensions.
  const extension=extname(tail).toLowerCase()
  const suffix=tail.endsWith('/')||!tail?'index.html':
    extension && Object.hasOwn(mime,extension)?'':'.html'
  const path=resolve(root,tail+suffix)
  if(path!==root&&!path.startsWith(root+sep)){
    res.writeHead(404).end('Not found')
    return
  }
  void (async()=>{
    try{
      if(!(await stat(path)).isFile())throw new Error('Not a file')
      const data=await readFile(path)
      res.writeHead(200,{
        'Content-Type':mime[extname(path)]??'application/octet-stream',
        'Content-Length':data.length,'Cache-Control':'no-store'
      })
      res.end(data)
    }catch{res.writeHead(404).end('Not found')}
  })()
})
const listen=():Promise<number>=>new Promise((yes,no)=>{
  server.once('error',no)
  server.listen(0,'127.0.0.1',()=>{
    const address=server.address()
    if(!address||typeof address==='string'){no(new Error('No local server port'));return}
    yes(address.port)
  })
})

async function context(browser:Awaited<ReturnType<typeof chromium.launch>>,baseUrl:string,
  width:number):Promise<{ctx:BrowserContext;outside:string[]}>{
  const ctx=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1})
  const outside:string[]=[]
  await ctx.route('**/*',route=>{
    const requested=route.request().url()
    if(requested.startsWith(baseUrl+'/'))return route.continue()
    outside.push(requested)
    return route.abort('blockedbyclient')
  })
  return {ctx,outside}
}

async function testLocale(
  browser:Awaited<ReturnType<typeof chromium.launch>>,
  origin:string,lang:'en'|'hi'
):Promise<void>{
  const {ctx,outside}=await context(browser,origin,1280)
  let page:Page|undefined
  try{
    page=await ctx.newPage()
    const prefix=lang==='hi'?base+'hi/':base
    const homepage=await page.goto(origin+prefix,{waitUntil:'networkidle'})
    assert.equal(homepage?.status(),200)
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='hi'?'hi-IN':'en-US')
    assert.equal(await page.locator('main').count(),1)
    assert.equal(await page.locator('.features .feature').count()>8,true)
    assert.equal(await page.locator('.hero h1').count(),1)
    const install=page.locator('.top-nav a').filter({hasText:lang==='hi'?'इंस्टॉल':'Install'})
    assert.equal(await install.getAttribute('href'),prefix+'guide/install-latest')
    assert.equal(await page.locator('.top-nav a').filter({hasText:lang==='hi'?'डाउनलोड':'Download'}).getAttribute('href'),
      'https://scarp-lang.github.io/downloads/')
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),
      'https://scarp-lang.github.io'+prefix)
    assertions++

    // Release guides have a dotted tag in their clean URLs. Check that the
    // actual HTTP server resolves these to generated HTML rather than
    // mistaking ".8" or ".7" for a static file extension.
    for (const tag of [LATEST_RELEASE,'v0.0.6-alpha.7']) {
      const url=origin+prefix+'releases/'+tag
      const releaseResponse=await page.goto(url,{waitUntil:'networkidle'})
      assert.equal(releaseResponse?.status(),200,lang+': dotted release URL '+tag)
      assert.ok((await page.locator('article h1').innerText()).includes(tag),
        lang+': wrong release HTML served for '+tag)
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),
        'https://scarp-lang.github.io'+prefix+'releases/'+tag)
    }
    assertions++

    await page.goto(origin+prefix+'tooling/command-finder',{waitUntil:'networkidle'})
    const widget=page.locator('[data-command-finder]')
    await widget.locator('#scarp-release').waitFor({state:'visible'})
    assert.equal(await widget.locator('#scarp-release').inputValue(),LATEST_RELEASE)
    await widget.locator('#scarp-task').selectOption('inspect-symbols')
    await widget.locator('.finder-result pre').waitFor({state:'visible'})
    assert.match(await widget.locator('pre').innerText(),
      /scarp inspect symbols --json FILE\.srp/)
    assert.equal(await widget.locator('pre').getAttribute('tabindex'),'0')
    // Use the real keyboard to change release choices, not only selectOption.
    const releaseChoice=widget.locator('#scarp-release')
    await releaseChoice.focus()
    await releaseChoice.press('Home')
    assert.equal(await releaseChoice.inputValue(),'v0.0.5-alpha.1')
    await widget.locator('pre').waitFor({state:'detached'})
    assert.match(await widget.locator('.finder-result').innerText(),/v0\.0\.6-alpha\.1/)
    await releaseChoice.press('End')
    assert.equal(await releaseChoice.inputValue(),LATEST_RELEASE)
    await widget.locator('pre').waitFor({state:'visible'})
    assert.equal(await widget.locator('.finder-result').getAttribute('aria-live'),'polite')
    assertions++

    // The new native object task is available only in published alpha.2.
    await widget.locator('#scarp-task').selectOption('native-object')
    await widget.locator('pre').waitFor({state:'visible'})
    assert.match(await widget.locator('pre').innerText(),/scarp native-object --json x86_64-none bounded-entry/)
    assert.ok(await widget.locator('.finder-result a[href="'+prefix+'guide/native-object"]').count()>0)
    await releaseChoice.selectOption('v0.0.7-alpha.1')
    await widget.locator('pre').waitFor({state:'detached'})
    assert.match(await widget.locator('.finder-result').innerText(),/v0\.0\.7-alpha\.2/)
    await releaseChoice.selectOption(LATEST_RELEASE)
    await widget.locator('#scarp-task').selectOption('inspect-symbols')
    await widget.locator('pre').waitFor({state:'visible'})
    assertions++

    // Deterministic in-page clipboard stubs: no OS permissions or external APIs.
    // Literal browser-side JS avoids injecting tsx/esbuild __name helpers
    // that do not exist inside Playwright's isolated page runtime.
    await page.evaluate(`Object.defineProperty(navigator,'clipboard',{
      configurable:true,
      value:{writeText(value){window.__scarpCopied=value;return Promise.resolve()}}
    })`)
    const copy=widget.locator('.finder-result button')
    await copy.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction("window.__scarpCopied?.includes('scarp inspect symbols')")
    assert.match(await page.evaluate("window.__scarpCopied || ''"),
      /scarp inspect symbols --json FILE\.srp/)
    await page.getByRole('button',{name:lang==='hi'?'कॉपी हो गया':'Copied'}).waitFor()
    await page.evaluate(`Object.defineProperty(navigator,'clipboard',{
      configurable:true,
      value:{writeText(){return Promise.reject(new DOMException('Denied','NotAllowedError'))}}
    })`)
    await copy.click()
    await page.getByRole('button',{
      name:lang==='hi'
        ?'कॉपी नहीं हो पाया। Command text चुनकर स्वयं कॉपी करें।'
        :'Copy failed. Select the command text manually.'
    }).waitFor()
    assert.equal(await widget.locator('pre').getAttribute('tabindex'),'0',
      lang+': command text must remain selectable after clipboard denial')
    assertions++

    const theme=page.locator('#theme-toggle')
    const before=await page.locator('html').evaluate(node=>node.classList.contains('dark'))
    await theme.click()
    assert.equal(await page.locator('html').evaluate(node=>node.classList.contains('dark')),!before)
    await page.reload({waitUntil:'networkidle'})
    assert.equal(await page.locator('html').evaluate(node=>node.classList.contains('dark')),!before)
    assertions++

    const searchTrigger=page.locator('#search-open')
    assert.equal(await searchTrigger.getAttribute('aria-keyshortcuts'),
      'Control+K Meta+K /',lang+': keyboard shortcuts must be accessible in both locales')
    await searchTrigger.focus()
    await searchTrigger.press('Enter')
    const dialog=page.locator('#search-panel')
    await dialog.waitFor({state:'visible'})
    assert.equal(await dialog.getAttribute('aria-labelledby'),'search-title')
    const searchInput=page.locator('#search-query')
    assert.equal(await searchInput.evaluate(node=>document.activeElement===node),true)
    // A corrupt index must fail closed and retry successfully on the next query.
    await page.route('**/assets/search-index.json', route=>route.fulfill({
      status:200, contentType:'application/json',
      body:JSON.stringify([{route:'https://example.com/',title:'funcra',
        locale:lang,section:'guide',excerpt:'funcra'}])
    }),{times:1})
    await searchInput.fill('funcra')
    await page.locator('#search-status').getByText(lang==='hi'
      ?'स्थानीय खोज उपलब्ध नहीं है। पृष्ठों के लिंक का उपयोग करें।'
      :'Could not load the local search index. Use page navigation instead.',{exact:true}).waitFor()
    assert.equal(await page.locator('#search-results li a').count(),0)
    await searchInput.fill('')
    await searchInput.fill('funcra')
    const results=page.locator('#search-results li a')
    await results.first().waitFor({state:'visible',timeout:15000})
    assert.ok((await results.first().getAttribute('href'))?.startsWith(prefix))
    await searchInput.press('ArrowDown')
    assert.equal(await results.first().evaluate(node=>document.activeElement===node),true,
      lang+': ArrowDown must focus the first search result')
    await page.keyboard.press('ArrowUp')
    assert.equal(await results.last().evaluate(node=>document.activeElement===node),true,
      lang+': ArrowUp must cycle through search results')
    await page.keyboard.press('ArrowDown')
    assert.equal(await results.first().evaluate(node=>document.activeElement===node),true)

    // E0063 is a current verified fixed-array index diagnostic. Match-context
    // previews must show the actual diagnostic in both document languages.
    await searchInput.focus()
    await searchInput.fill('E0063')
    await page.waitForFunction(() => {
      const snippets=[...document.querySelectorAll('#search-results li a small')]
      return snippets.length>0 && snippets.every(node=>node.textContent?.includes('E0063'))
    })
    const previews=await page.locator('#search-results li a small').allTextContents()
    assert.ok(previews.length>0 && previews.every(text=>text.includes('E0063')),
      lang+': previews must include the searched compiler diagnostic')
    assert.ok(previews.every(text=>[...text].length<=162),
      lang+': previews must be code-point bounded')
    assertions++

    await searchInput.fill('zzqvkpwmntrxhfbjkldsrp9776')
    await page.getByRole('status').getByText(
      lang==='hi'?'कोई परिणाम नहीं मिला':'No results found',{exact:true}).waitFor()
    await page.keyboard.press('Escape')
    await dialog.waitFor({state:'hidden'})
    await page.waitForFunction(()=>document.activeElement===document.querySelector('#search-open'))
    assertions++

    const translated=page.locator('a.language-link')
    assert.equal(await translated.getAttribute('href'),
      lang==='en'?base+'hi/tooling/command-finder':base+'tooling/command-finder')
    const audit=await auditOfflineAccessibility(page!,lang+'-engine-page',
      join(previewRoot,'audit-results'))
    assert.ok(audit.passes>0)
    assertions++

    // The print stylesheet must keep lesson content readable while removing
    // navigation and converting code windows into printable wrapped text.
    await page.emulateMedia({media:'print'})
    assert.equal(await page.locator('.site-header').evaluate(node=>getComputedStyle(node).display),
      'none',lang+': header should not consume printed page space')
    assert.equal(await page.locator('#main').evaluate(node=>getComputedStyle(node).display),
      'block',lang+': teaching content must remain printable')
    assert.equal(await page.locator('main pre').first().evaluate(node=>getComputedStyle(node).whiteSpace),
      'pre-wrap',lang+': Scarp code should wrap when printed')
    await page.emulateMedia({media:'screen'})
    assert.notEqual(await page.locator('.site-header').evaluate(node=>getComputedStyle(node).display),
      'none',lang+': screen navigation must recover after print emulation')
    assertions++

    // GitHub Pages serves this standalone fallback for unknown URLs. It
    // must remain accessible and offer both language homepages offline.
    const notFound=await page.goto(origin+base+'404.html',{waitUntil:'networkidle'})
    assert.equal(notFound?.status(),200)
    assert.equal(await page.title(),'Page not found · Scarp Docs')
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),
      'noindex, follow')
    assert.equal(await page.getByRole('heading',{name:'Page not found'}).count(),1)
    assert.equal(await page.locator('main p[lang="hi"]').count(),1)
    const homeNavigation=page.getByRole('navigation',{name:'Documentation homepages'})
    assert.equal(await homeNavigation.getByRole('link',{name:'English documentation'}).getAttribute('href'),base)
    assert.equal(await homeNavigation.getByRole('link',{name:'हिन्दी दस्तावेज़'}).getAttribute('href'),base+'hi/')
    const fallbackAudit=await auditOfflineAccessibility(page,lang+'-engine-404',
      join(previewRoot,'audit-results'))
    assert.ok(fallbackAudit.passes>0)
    assertions++


    // All code fences are readable without scripts and gain copy controls in
    // browser mode. Test actual keyboard activation, exact Unicode content,
    // clipboard permission rejection, selection fallback and WCAG A/AA.
    await page.goto(origin+prefix.replace(/\/$/,'')+'/reference/current',
      {waitUntil:'networkidle'})
    const codeExample=page.locator('[data-code-example]').first()
    await codeExample.locator('pre code').waitFor()
    const expectedSource=await codeExample.locator('pre code').textContent()
    assert.ok(expectedSource && expectedSource.length>0)
    const copyButton=codeExample.getByRole('button',{
      name:lang==='hi'?'कोड कॉपी करें':'Copy code'
    })
    await copyButton.waitFor({state:'visible'})
    await page.evaluate(`Object.defineProperty(navigator,'clipboard',{
      configurable:true,
      value:{writeText(value){window.__copiedFence=value;return Promise.resolve()}}
    })`)
    await copyButton.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction("typeof window.__copiedFence === 'string'")
    assert.equal(await page.evaluate("window.__copiedFence"),expectedSource,
      lang+': copying must preserve highlighted source and Unicode')
    await codeExample.getByRole('status').getByText(
      lang==='hi'?'कॉपी हो गया':'Copied',{exact:true}).waitFor()
    await page.evaluate(`Object.defineProperty(navigator,'clipboard',{
      configurable:true,
      value:{writeText(){return Promise.reject(new DOMException('Denied','NotAllowedError'))}}
    })`)
    await copyButton.click()
    await codeExample.getByRole('status').getByText(
      lang==='hi'
        ?'क्लिपबोर्ड उपलब्ध नहीं। कोड चुना गया है; Ctrl+C दबाएँ।'
        :'Clipboard unavailable. Code selected; press Ctrl+C.',
      {exact:true}).waitFor()
    // Chromium's Selection.toString() omits the trailing newline of a
    // selected <code> node, even though Clipboard.writeText gets it intact.
    const selected=String(await page.evaluate("window.getSelection()?.toString()"))
    assert.equal(selected.trimEnd(),expectedSource.trimEnd(),
      lang+': denied clipboard must select the entire meaningful source')
    assert.equal(await copyButton.isEnabled(),true)
    const codeAudit=await auditOfflineAccessibility(page!,lang+'-engine-code-copy',
      join(previewRoot,'audit-results'))
    assert.ok(codeAudit.passes>0)
    assertions++

    assert.deepEqual(outside,[],lang+': custom site attempted external requests')
  }finally{await ctx.close()}
}


/** Exercise the *deployed* counter rather than the retired VitePress helper. */
async function deploymentCounter(
  browser:Awaited<ReturnType<typeof chromium.launch>>,
  origin:string,lang:'en'|'hi'
):Promise<void>{
  const {ctx,outside}=await context(browser,origin,1280)
  let mode:'valid'|'negative'|'fractional'|'http'|'offline'='valid'
  await ctx.route(SUCCESSFUL_RUNS_ENDPOINT,route=>{
    if(mode==='offline')return route.abort('failed')
    return route.fulfill({
      status:mode==='http'?429:200,
      contentType:'application/json',
      headers:{'access-control-allow-origin':'*'},
      body:JSON.stringify({total_count:mode==='valid'?8:mode==='negative'?-3:2.5})
    })
  })
  try{
    const page=await ctx.newPage()
    const route=lang==='hi'?base+'hi/project/deployments':base+'project/deployments'
    const response=await page.goto(origin+route,{waitUntil:'networkidle'})
    assert.equal(response?.status(),200)
    const widget=page.locator('[data-deployments]')
    const button=widget.locator('[data-load-deployments]')
    const output=widget.locator('output')
    await button.waitFor({state:'visible'})
    assert.equal(await button.innerText(),lang==='hi'?'संख्या अपडेट करें':'Refresh count')
    async function clickAndCheck(expected:string):Promise<void>{
      await button.click()
      await output.filter({hasText:expected}).waitFor()
      assert.equal(await button.isEnabled(),true)
    }
    await clickAndCheck(lang==='hi'?'सफल Pages workflow रन: 8':'Successful Pages workflow runs: 8')
    assert.equal(await button.innerText(),lang==='hi'?'संख्या अपडेट करें':'Refresh count')
    assertions++
    for (const failing of ['negative','fractional','http','offline'] as const){
      mode=failing
      await clickAndCheck(lang==='hi'?'अभी संख्या उपलब्ध नहीं है':'Count currently unavailable')
      assert.equal(await button.innerText(),lang==='hi'?'दोबारा प्रयास करें':'Try again')
      assertions++
    }
    assert.deepEqual(outside,[],lang+': deployment test performed an uncontrolled external request')
  }finally{await ctx.close()}
}

async function mobile(
  browser:Awaited<ReturnType<typeof chromium.launch>>,origin:string,lang:'en'|'hi'
):Promise<void>{
  const {ctx,outside}=await context(browser,origin,375)
  try{
    const page=await ctx.newPage()
    const route=lang==='hi'?base+'hi/guide/learning-path':base+'guide/learning-path'
    await page.goto(origin+route,{waitUntil:'networkidle'})
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)
    assert.ok(overflow<=2,lang+': narrow layout overflow '+overflow)
    const toggle=page.locator('#menu-toggle')
    await toggle.click()
    assert.equal(await toggle.getAttribute('aria-expanded'),'true')
    assert.equal(await page.locator('#side-nav').evaluate(x=>x.classList.contains('open')),true)
    await page.locator('#side-nav a').first().click()
    assert.equal(await toggle.getAttribute('aria-expanded'),'false')
    // Module imports finish asynchronously after navigation; test the keyboard
    // shortcut only once the new page has installed its event listeners.
    await page.locator('html[data-scarp-ready="true"]').waitFor({state:'attached'})
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await page.locator('#search-query').waitFor({state:'visible'})
    await page.keyboard.press('Escape')
    assert.deepEqual(outside,[])
    await page.setViewportSize({width:320,height:800})
    await page.emulateMedia({reducedMotion:'reduce'})
    assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true)
    const narrowOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)
    assert.ok(narrowOverflow<=2,lang+': 320px layout overflow '+narrowOverflow)
    const audit=await auditOfflineAccessibility(page,lang+'-engine-mobile',
      join(previewRoot,'audit-results'))
    assert.ok(audit.passes>0)
    assertions++
  }finally{await ctx.close()}
}

let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined
try{
  const port=await listen()
  const origin='http://127.0.0.1:'+port
  browser=await chromium.launch({headless:true})
  for(const locale of ['en','hi'] as const){
    await testLocale(browser,origin,locale)
    await mobile(browser,origin,locale)
    await deploymentCounter(browser,origin,locale)
  }
  console.log('PASS: '+assertions+
    ' Scarp-owned engine Chromium tests: keyboard search, clipboard success/denial, release selector, typed deployment API successes/failures, bilingual UI, 320px reflow, reduced motion and axe A/AA scans')
}catch(error){
  console.error('FAIL: Scarp-owned engine Chromium: '+(error instanceof Error ? error.stack : String(error)))
  process.exitCode=1
}finally{
  await browser?.close()
  await new Promise<void>(resolveDone=>server.close(()=>resolveDone()))
}
