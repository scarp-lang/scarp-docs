import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateHindiLocalSearch, type SearchLocalizationSources } from './lib/hindi-search-policy.ts'
import { LATEST_RELEASE } from './lib/command-finder.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(p:string):string=>readFileSync(resolve(root,p),'utf8')
const pages:SearchLocalizationSources={
  client:read('scripts/scarp-site/client.ts'),
  renderer:read('scripts/scarp-site/build.ts'),
  readme:read('README.md'),
  english:read('docs/guide/search-and-navigation.md'),
  hindi:read('docs/hi/guide/search-and-navigation.md'),
  englishIntro:read('docs/guide/introduction.md'),
  hindiIntro:read('docs/hi/guide/introduction.md')
}
assert.deepEqual(validateHindiLocalSearch(pages),[])
function mutate(key:keyof SearchLocalizationSources,from:string,to:string):void{
  const revised=pages[key].replaceAll(from,to)
  assert.notEqual(revised,pages[key],'Missing regression target '+key+': '+from)
  assert.ok(validateHindiLocalSearch({...pages,[key]:revised}).length>0,
    'Native search drift escaped policy: '+key+' '+from)
}
// The old VitePress theme is not used by any test or acceptance check here.
mutate('client',"const hindi=document.documentElement.lang.startsWith('hi')",
  "const hindi=false")
mutate('client',"entries.filter(e=>e.locale===locale)","entries.filter(e=>true)")
mutate('client',"fetch(BASE+'assets/search-index.json')","fetch('https://search.example.com/index')")
mutate('client',"t('No results found','कोई परिणाम नहीं मिला')",
  "t('No results found','No results found')")
mutate('client',"dialog.showModal()","dialog.show()")
mutate('client',"previousFocus?.isConnected","false")
mutate('client',"(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'",
  "event.altKey&&event.key.toLowerCase()==='k'")
mutate('client',"event.key!=='ArrowDown'&&event.key!=='ArrowUp'",
  "event.key!=='Tab'&&event.key!=='Tab'")
mutate('renderer','aria-keyshortcuts="Control+K Meta+K /"',
  'aria-keyshortcuts="Control+L"')
mutate('renderer','id="search-status" role="status" aria-live="polite"',
  'id="search-status"')
mutate('renderer',"locale:view.locale","locale:'en'")
mutate('renderer',"'दस्तावेज़ खोजें'","'Search documentation'")
mutate('english','Ctrl+K','Alt+K')
mutate('hindi','⌘+K','Alt+K')
mutate('english','](/releases/'+LATEST_RELEASE+')',
  '](/releases/v0.0.5-alpha.1)')
mutate('hindi','](/hi/releases/'+LATEST_RELEASE+')',
  '](/hi/releases/v0.0.5-alpha.1)')
mutate('hindi','](/guide/search-and-navigation)',
  '](/hi/guide/search-and-navigation)')
mutate('englishIntro','](/guide/search-and-navigation)','](/guide/missing)')
mutate('hindiIntro','](/hi/guide/search-and-navigation)','](/hi/guide/missing)')
mutate('readme','docs/hi/guide/search-and-navigation.md',
  'docs/hi/guide/missing.md')
assert.ok(validateHindiLocalSearch({...pages,
  hindi:pages.hindi.replace(/[\u0900-\u097f]/gu,'')}).length>0,
  'Removing all Hindi script must fail')
console.log('PASS: 21 owned-search localization, ARIA, network, keyboard and release-drift regressions')
