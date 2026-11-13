import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateHindiLocalSearch, type SearchLocalizationSources } from './lib/hindi-search-policy.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
export const sources:SearchLocalizationSources={
  client:read('scripts/scarp-site/client.ts'),
  renderer:read('scripts/scarp-site/build.ts'),
  readme:read('README.md'),
  english:read('docs/guide/search-and-navigation.md'),
  hindi:read('docs/hi/guide/search-and-navigation.md'),
  englishIntro:read('docs/guide/introduction.md'),
  hindiIntro:read('docs/hi/guide/introduction.md')
}
const errors=validateHindiLocalSearch(sources)
if(errors.length){
  for(const error of errors)console.error('FAIL Scarp-owned bilingual search: '+error)
  process.exitCode=1
}else{
  console.log('PASS: native TypeScript search index, HTML/ARIA, keyboard controls, Hindi/English help and latest compiler navigation')
}
