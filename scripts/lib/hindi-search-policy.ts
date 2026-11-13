import { LATEST_RELEASE } from './command-finder.ts'

/**
 * Test the shipping Scarp-owned static renderer and browser controller, not
 * the old VitePress theme. Browser tests separately exercise these behaviors
 * in Chromium; this static gate catches source, locale and navigation drift.
 */
export interface SearchLocalizationSources {
  client: string
  renderer: string
  readme: string
  english: string
  hindi: string
  englishIntro: string
  hindiIntro: string
}

export function validateHindiLocalSearch(sources: SearchLocalizationSources): string[] {
  const failures: string[] = []
  const requireText = (where: string, body: string, fragments: readonly string[]): void => {
    for (const fragment of fragments) {
      if (!body.includes(fragment)) failures.push(where + ': missing ' + fragment)
    }
  }
  const { client, renderer, readme, english, hindi, englishIntro, hindiIntro } = sources

  // Search must be entirely local to Scarp's deployed /scarp-docs/ assets.
  // Separate preview/browser tests cover keyboard behavior and network isolation.
  requireText('Browser', client, [
    "const hindi=document.documentElement.lang.startsWith('hi')",
    "const locale:'en'|'hi'=hindi?'hi':'en'",
    "const t=(en:string,hi:string):string=>hindi?hi:en",
    "fetch(BASE+'assets/search-index.json')",
    "entries.filter(e=>e.locale===locale)",
    "t('No results found','कोई परिणाम नहीं मिला')",
    "t('Could not load the local search index. Use page navigation instead.',",
    "dialog.showModal()",
    "input.focus()",
    "previousFocus?.isConnected",
    "if(event.key==='Escape'&&dialog.open)",
    "event.key!=='ArrowDown'&&event.key!=='ArrowUp'",
    "(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'",
    "event.key==='/'&&!typing&&!dialog.open"
  ])
  const indexStart=client.indexOf('function searchIndex():Promise<SearchEntry[]>')
  const indexEnd=client.indexOf('function search(entries:',indexStart)
  if(indexStart<0 || indexEnd<=indexStart){
    failures.push('Browser: local search index fetch contract missing')
  }else{
    const indexScope=client.slice(indexStart,indexEnd)
    if(/(?:https?:\/\/|algolia|meilisearch|typesense|sendBeacon)/i.test(indexScope)){
      failures.push('Browser: search index loading must not use a remote provider')
    }
    if(!indexScope.includes("fetch(BASE+'assets/search-index.json')")){
      failures.push('Browser: search must fetch only the local static index')
    }
  }

  // HTML source and search index are emitted by the independent generator.
  requireText('Renderer',renderer,[
    "const searchText=localized('Search documentation','दस्तावेज़ खोजें',locale)",
    'id="search-open" aria-haspopup="dialog" aria-controls="search-panel" aria-keyshortcuts="Control+K Meta+K /"',
    'id="search-panel" class="search-panel" aria-labelledby="search-title"',
    'id="search-query" type="search"',
    'id="search-status" role="status" aria-live="polite"',
    'id="search-results"',
    'locale:view.locale',
    "writeFileSync(join(siteRoot,'assets','search-index.json'),JSON.stringify(searchIndex))",
    "const lang=locale==='hi'?'hi-IN':'en-US'"
  ])
  if(/(?:algolia|v-html|from\s+['\"]vitepress['\"]|import\(['\"]vitepress['\"]\))/i.test(renderer)){
    failures.push('Renderer: owned search must not depend on a framework or remote search provider')
  }

  for(const [name,page,prefix] of [
    ['English',english,''],
    ['Hindi',hindi,'/hi']
  ] as const){
    if(!page.startsWith('# '))failures.push(name+': search help missing heading')
    requireText(name+' search help',page,[
      'Ctrl+K','⌘+K','Enter','Esc',
      ']('+prefix+'/guide/learning-path)',
      ']('+prefix+'/releases/'+LATEST_RELEASE+')',
      ']('+prefix+'/reference/status)',
      ']('+prefix+'/tooling/cli-alpha6)'
    ])
  }
  if((hindi.match(/[\u0900-\u097f]/gu)??[]).length<120){
    failures.push('Hindi help: substantial Hindi translation missing')
  }
  if(!hindi.includes('दस्तावेज़ खोजें')){
    failures.push('Hindi help: actual localized search button is not named')
  }
  if(!english.includes('](/hi/guide/search-and-navigation)')||
    !hindi.includes('](/guide/search-and-navigation)')){
    failures.push('Bilingual search help must link both locales')
  }
  if(!englishIntro.includes('](/guide/search-and-navigation)')||
    !hindiIntro.includes('](/hi/guide/search-and-navigation)')){
    failures.push('Both onboarding guides must link their localized search help')
  }
  if(!readme.includes('docs/guide/search-and-navigation.md')||
    !readme.includes('docs/hi/guide/search-and-navigation.md')){
    failures.push('README must link both local search guides')
  }
  return failures
}
