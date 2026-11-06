import assert from 'node:assert/strict'
import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

/**
 * Browser acceptance tests of the EXTRACTED distribution, not a dev server.
 * We intercept every external request to prove that interactive documentation
 * features do not depend on GitHub Pages, an external search API or a CDN.
 * The tests use real Chromium accessibility roles, keyboard and responsive UI.
 */
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const extracted = mkdtempSync(join(tmpdir(), 'scarp-docs-browser-'))
const shots = join(root, 'artifacts', 'browser-failures')
mkdirSync(shots, { recursive: true })
const pages = [
  { locale: 'en', path: '/scarp-docs/tooling/command-finder', old: 'Not available in this published release',
    current: 'Available in this published release', copy: 'Copy commands',
    copied: 'Copied', error: 'Copy failed.', search: 'funcra' },
  { locale: 'hi', path: '/scarp-docs/hi/tooling/command-finder',
    old: 'इस प्रकाशित version में उपलब्ध नहीं',
    current: 'इस प्रकाशित version में उपलब्ध', copy: 'Commands कॉपी करें',
    copied: 'कॉपी हो गया', error: 'कॉपी नहीं हो पाया', search: 'funcra' }
] as const

let server: ChildProcessWithoutNullStreams | undefined
let browser: Browser | undefined
let activePage: Page | undefined
let checked = 0

function failAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Offline server did not announce a listening port')), ms))
}
async function serve(): Promise<string> {
  const bin = resolve(extracted, 'serve.mjs')
  server = spawn(process.execPath, [bin], {
    cwd: extracted, env: { ...process.env, PORT: '0' },
    stdio: ['pipe', 'pipe', 'pipe']
  })
  let output = ''
  const started = new Promise<string>((resolveStarted, reject) => {
    server!.stdout.on('data', data => {
      output += String(data)
      const found = /http:\/\/127\.0\.0\.1:(\d+)\/scarp-docs\//.exec(output)
      if (found) resolveStarted('http://127.0.0.1:' + found[1])
    })
    server!.once('error', reject)
    server!.once('exit', code => reject(new Error('Offline server exited early: ' + code)))
  })
  return Promise.race([started, failAfter(15_000)])
}

async function isolatedContext(base: string, width: number, height: number,
    opts: { denyCopy?: boolean; allowCopy?: boolean } = {}):
    Promise<{ context: BrowserContext; external: string[] }> {
  const context = await browser!.newContext({viewport:{width,height},deviceScaleFactor:1})
  const external: string[] = []
  await context.route('**/*', route => {
    const url = route.request().url()
    if (url.startsWith(base+'/')) return route.continue()
    external.push(url)
    return route.abort('blockedbyclient')
  })
  if (opts.allowCopy) {
    await context.grantPermissions(['clipboard-read','clipboard-write'], {origin:base})
  }
  if (opts.denyCopy) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (): Promise<void> => { throw new Error('Clipboard permission denied by test') }
        }
      })
    })
  }
  return {context,external}
}

async function finder(page: Page, locale: typeof pages[number], base: string): Promise<void> {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base + locale.path, {waitUntil:'networkidle'})
  const widget = page.locator('.scarp-command-finder')
  await widget.waitFor({state:'visible'})
  assert.equal(await widget.locator('select').count(), 2, locale.locale+' has two accessible selectors')
  assert.equal(await widget.locator('label[for="scarp-release"]').count(),1)
  assert.equal(await widget.locator('label[for="scarp-task"]').count(),1)
  const result = widget.locator('[aria-live="polite"][aria-atomic="true"]')
  assert.equal(await result.count(),1,'status changes must be announced')

  // Keyboard-only selection of an older compiler. No accidental "future" CLI.
  const version=widget.locator('#scarp-release')
  await version.focus()
  await version.press('Home')
  assert.equal(await version.inputValue(), 'v0.0.5-alpha.1')
  await widget.locator('#scarp-task').selectOption('inspect-symbols')
  await result.getByText(locale.old,{exact:true}).waitFor()
  assert.equal(await result.locator('pre').count(),0,
    'Unavailable task must not render a command to copy')
  assert.ok((await result.innerText()).includes('v0.0.6-alpha.1'))
  checked++

  await version.selectOption('v0.0.6-alpha.1')
  await result.getByText(locale.current,{exact:true}).waitFor()
  assert.match(await result.locator('pre').innerText(),/scarp inspect symbols --json FILE\.srp/)
  assert.match(await result.locator('pre').innerText(),/scarp inspect references --json FILE\.srp/)
  const link=await result.locator('a[href]').getAttribute('href')
  assert.equal(link, (locale.locale==='hi'?'/scarp-docs/hi':'/scarp-docs')+'/tooling/cli-alpha6')
  await page.keyboard.press('Tab')
  checked++

  // Browser-native clipboard works at loopback secure context with permission.
  await widget.getByRole('button',{name:locale.copy}).click()
  await widget.getByRole('button',{name:locale.copied}).waitFor()
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).trim(),
    'scarp inspect symbols --json FILE.srp\nscarp inspect references --json FILE.srp')
  assert.deepEqual(errors,[],locale.locale+' unexpected runtime errors')
  checked++
}

async function deniedClipboard(base:string, locale: typeof pages[number]):Promise<void>{
  const {context,external}=await isolatedContext(base,1000,768,{denyCopy:true})
  try{
    activePage=await context.newPage()
    await activePage.goto(base+locale.path,{waitUntil:'networkidle'})
    await activePage.locator('.scarp-command-finder-copy').click()
    await activePage.getByText(locale.error,{exact:false}).waitFor()
    const commands=await activePage.locator('.scarp-command-finder pre').innerText()
    assert.match(commands,/scarp (exec|run) FILE\.srp/,
      'Failed clipboard permission must leave select-and-copy fallback visible')
    assert.deepEqual(external,[],'Denied-copy browser should not request external services')
    checked++
  }finally{await context.close();activePage=undefined}
}

async function searchOffline(base:string,locale:typeof pages[number],mobile:boolean):Promise<void>{
  const {context,external}=await isolatedContext(base,mobile?390:1280,mobile?844:800)
  try{
    activePage=await context.newPage()
    const page=activePage
    const errors:string[]=[]
    page.on('pageerror', e=>errors.push(e.message))
    await page.goto(base+locale.path,{waitUntil:'networkidle'})
    if(mobile){
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)
      assert.ok(overflow<=2,locale.locale+' mobile layout overflows by '+overflow+'px')
      const menu=page.locator('.VPNavBarHamburger')
      await menu.waitFor({state:'visible'})
      await menu.click()
      await page.locator('.VPNavScreen').waitFor({state:'visible'})
      checked++
      await menu.click()
    }

    // VitePress built-in client search should be usable with a keyboard only.
    await page.keyboard.press('Control+k')
    const input=page.locator('input[type="search"]').first()
    await input.waitFor({state:'visible',timeout:15000})
    await input.fill(locale.search)
    const results=page.locator('.VPLocalSearchBox')
    await results.locator('a[href]').first().waitFor({state:'visible',timeout:15000})
    const href=await results.locator('a[href]').first().getAttribute('href')
    assert.ok(href?.startsWith(locale.locale==='hi'?'/scarp-docs/hi/':'/scarp-docs/'),
      locale.locale+' search result must point at a bundled local route: '+href)
    await page.keyboard.press('Escape')
    await input.waitFor({state:'hidden'})
    assert.deepEqual(errors,[],locale.locale+' search runtime errors')
    assert.deepEqual(external,[],locale.locale+' search attempted external requests')
    checked++
  } finally {await context.close();activePage=undefined}
}


/** Verify a zero-result search state and keyboard focus restoration. */
async function emptySearchAndFocus(base: string, locale: typeof pages[number]): Promise<void> {
  const { context, external } = await isolatedContext(base, 1280, 800)
  try {
    activePage = await context.newPage()
    const page = activePage
    await page.goto(base + locale.path, { waitUntil: 'networkidle' })
    const trigger = page.locator('.VPNavBarSearch button').first()
    await trigger.waitFor({ state: 'visible' })
    await trigger.focus()
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true,
      locale.locale + ': search trigger must be keyboard-focusable')
    await trigger.press('Enter')
    const input = page.locator('input[type="search"]').first()
    await input.waitFor({ state: 'visible' })
    assert.equal(await input.evaluate(element => element === document.activeElement), true,
      locale.locale + ': search input should receive keyboard focus')
    // A single invented token avoids MiniSearch matching unrelated short
    // tokens such as "no" from hyphen-separated negative-test strings.
    await input.fill('zzqvkpwmntrxhfbjkldsrp9776')
    const noResults = locale.locale === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results for'
    await page.locator('.VPLocalSearchBox .no-results').getByText(noResults, { exact: false })
      .waitFor({ state: 'visible', timeout: 15000 })
    await page.keyboard.press('Escape')
    await input.waitFor({ state: 'hidden' })
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true,
      locale.locale + ': search close must return focus to original trigger')
    assert.deepEqual(external, [], locale.locale + ': no-results lookup accessed external network')
    checked++
  } finally { await context.close(); activePage = undefined }
}

/** A language-menu action must navigate to the translated local page. */
async function languageSwitch(base: string, locale: typeof pages[number]): Promise<void> {
  const { context, external } = await isolatedContext(base, 1280, 800)
  try {
    activePage = await context.newPage()
    const page = activePage
    await page.goto(base + locale.path, { waitUntil: 'networkidle' })
    const dropdown = page.locator('.VPNavBarTranslations')
    await dropdown.waitFor({ state: 'visible' })
    await dropdown.hover()
    const target = locale.locale === 'en'
      ? '/scarp-docs/hi/tooling/command-finder'
      : '/scarp-docs/tooling/command-finder'
    const link = dropdown.locator('a[href="' + target + '"]')
    await link.waitFor({ state: 'visible', timeout: 10000 })
    await link.click()
    await page.waitForURL(url => url.pathname === target)
    assert.equal(await page.locator('html').getAttribute('lang'),
      locale.locale === 'en' ? 'hi-IN' : 'en-US')
    await page.locator('.scarp-command-finder select').first().waitFor({ state: 'visible' })
    assert.deepEqual(external, [], locale.locale + ': language switching accessed external network')
    checked++
  } finally { await context.close(); activePage = undefined }
}

/** Check a real theme toggle and skip-to-content keyboard behavior. */
async function themeAndSkip(base: string, locale: typeof pages[number]): Promise<void> {
  const { context, external } = await isolatedContext(base, 1280, 800)
  try {
    activePage = await context.newPage()
    const page = activePage
    await page.goto(base + locale.path, { waitUntil: 'networkidle' })
    const skip = page.locator('.VPSkipLink')
    assert.equal(await skip.count(), 1, locale.locale + ': missing skip-to-content link')
    const href = await skip.getAttribute('href')
    assert.ok(href?.startsWith('#'), locale.locale + ': skip link must target a page section')
    assert.equal(await page.locator(href!).count(), 1, locale.locale + ': skip target does not exist')
    await skip.focus()
    await skip.press('Enter')
    await page.waitForFunction(hash => window.location.hash === hash, href)
    checked++

    const toggle = page.locator('.VPNavBarAppearance button').first()
    await toggle.waitFor({ state: 'visible' })
    const before = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    await toggle.click()
    await page.waitForFunction(previous =>
      document.documentElement.classList.contains('dark') !== previous, before)
    const after = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    assert.notEqual(after, before, locale.locale + ': theme did not change')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')),
      after, locale.locale + ': theme preference should survive same-browser navigation')
    assert.deepEqual(external, [], locale.locale + ': theme/skip controls accessed external network')
    checked++
  } finally { await context.close(); activePage = undefined }
}

/** Reduced motion must not disable the accessible command controls or search. */
async function reducedMotionNavigation(base: string, locale: typeof pages[number]): Promise<void> {
  const context = await browser!.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce'
  })
  const external: string[] = []
  await context.route('**/*', route => {
    const url = route.request().url()
    if (url.startsWith(base + '/')) return route.continue()
    external.push(url)
    return route.abort('blockedbyclient')
  })
  try {
    activePage = await context.newPage()
    const page = activePage
    await page.goto(base + locale.path, { waitUntil: 'networkidle' })
    assert.equal(await page.evaluate(() =>
      matchMedia('(prefers-reduced-motion: reduce)').matches), true)
    const widget = page.locator('.scarp-command-finder')
    await widget.locator('#scarp-release').selectOption('v0.0.5-alpha.1')
    await widget.locator('#scarp-task').selectOption('inspect-symbols')
    await widget.getByText(locale.old, { exact: true }).waitFor()
    await widget.locator('#scarp-release').selectOption('v0.0.6-alpha.1')
    await widget.getByText(locale.current, { exact: true }).waitFor()
    assert.equal(await widget.locator('pre').count(), 1)
    assert.deepEqual(external, [], locale.locale + ': reduced motion used external requests')
    checked++
  } finally { await context.close(); activePage = undefined }
}

try {
  execFileSync('tar',['-xzf',join(root,'artifacts/scarp-docs-offline.tar.gz'),'-C',extracted])
  const base=await serve()
  browser=await chromium.launch({headless:true})
  for(const locale of pages){
    const {context,external}=await isolatedContext(base,1280,800,{allowCopy:true})
    try{
      activePage=await context.newPage()
      await finder(activePage,locale,base)
      assert.deepEqual(external,[],locale.locale+' Command Finder made external requests')
    }finally{await context.close();activePage=undefined}
    await deniedClipboard(base,locale)
    await searchOffline(base,locale,false)
    await searchOffline(base,locale,true)
    await emptySearchAndFocus(base,locale)
    await languageSwitch(base,locale)
    await themeAndSkip(base,locale)
    await reducedMotionNavigation(base,locale)
  }
  console.log('PASS: '+checked+
    ' real Chromium offline checks across English/Hindi desktop/mobile: keyboard, release gates, copy/failure, localized search/no-results, language switch, skip link, theme persistence, reduced-motion and zero external requests')
}catch(err){
  if(activePage) {
    try {await activePage.screenshot({path:join(shots,'last-failure.png'),fullPage:true,timeout:3000})}
    catch { /* preserve original error */ }
  }
  console.error('FAIL: offline browser acceptance: '+String(err))
  process.exitCode=1
}finally{
  await browser?.close()
  server?.kill()
  rmSync(extracted,{recursive:true,force:true})
}
