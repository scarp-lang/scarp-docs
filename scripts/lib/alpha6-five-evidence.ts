import { createHash } from 'node:crypto'
import { extractCodeFences } from './code-fences.ts'

export const ALPHA65_REF='v0.0.6-alpha.5' as const
export const ALPHA65_SHA='205e92f166f186c3905e5880d41c31717b697b8e' as const
export const ALPHA65_PUBLISHED='2026-11-09T11:39:41Z' as const
const names=[
  'nucleus_selection.srp','nucleus_selection.stdout',
  'pearson_correlation.srp','pearson_correlation.stdout'
] as const
type FixtureName=typeof names[number]
export interface Alpha65Manifest {
  compilerRepository:string;compilerRef:string;compilerCommit:string;publishedAt:string
  fixtures:Record<FixtureName,{compilerPath:string;gitBlobSha:string}>
}
export interface Alpha65Pages { english:string; hindi:string }
export interface Alpha65Current { compilerRef:string;compilerCommit:string;status:string }

function blobSha(content:string):string {
  const bytes=Buffer.from(content,'utf8')
  return createHash('sha1').update('blob '+bytes.byteLength+'\\0').update(bytes).digest('hex')
}
function hasExactFence(markdown:string,language:string,content:string):boolean {
  return extractCodeFences(markdown).some(f=>f.language===language&&
    f.code.trimEnd()===content.trimEnd())
}
/** Protects the compiler's published source/output contract from drifting docs.
 * Tests use full Git blob hashes and original tagged program bytes, not copied prose.
 */
export function validateAlpha65Docs(
  manifest:Alpha65Manifest,pages:Alpha65Pages,fixtures:Record<string,string>,current:Alpha65Current
):string[] {
  const errors:string[]=[]
  if(manifest.compilerRepository!=='scarp-lang/scarp'||
    manifest.compilerRef!==ALPHA65_REF||manifest.compilerCommit!==ALPHA65_SHA||
    manifest.publishedAt!==ALPHA65_PUBLISHED)errors.push('Incorrect published alpha.5 release identity')
  if(current.compilerRef!==ALPHA65_REF||current.compilerCommit!==ALPHA65_SHA||
    current.status!=='published-prerelease')errors.push('Latest compiler manifest differs from published alpha.5')
  const inventory=Object.keys(manifest.fixtures).sort()
  if(JSON.stringify(inventory)!==JSON.stringify([...names].sort()))
    errors.push('Unexpected alpha.5 release fixture inventory')
  for(const name of names){
    const item=manifest.fixtures[name]
    if(!item||item.compilerPath!=='examples/'+name||!(/^[a-f0-9]{40}$/.test(item.gitBlobSha))||
      typeof fixtures[name]!=='string'||blobSha(fixtures[name])!==item.gitBlobSha){
      errors.push('Tagged source or stdout Git blob mismatch: '+name)
    }
  }
  if(fixtures['nucleus_selection.stdout']!=='[integer: 0, 1]\\n[0.5, 0.25]\\n[integer: 0, 1, 2]\\n[integer: 1, 2]\\n')
    errors.push('Top-P tagged stdout changed')
  if(fixtures['pearson_correlation.stdout']!=='1.0\\n-1.0\\n0.0\\n')
    errors.push('Pearson tagged stdout changed')
  for(const [locale,markdown,prefix] of [
    ['English',pages.english,''],
    ['Hindi',pages.hindi,'/hi']
  ] as const) {
    for(const value of [
      '<!-- scarp-current-release: '+ALPHA65_REF+' -->',
      '<!-- scarp-cli-release: '+ALPHA65_REF+' -->',
      '<!-- scarp-current-source: '+ALPHA65_SHA+' -->',
      ALPHA65_PUBLISHED.slice(0,10).split('-').join('-') /* date appears through page prose, not ISO */,
      'https://github.com/scarp-lang/scarp/releases/tag/'+ALPHA65_REF,
      ']('+prefix+'/language/nucleus-selection-alpha5)',
      ']('+prefix+'/language/pearson-correlation-alpha5)',
      'SHA256SUMS',
      'not a stable'
    ]) {
      // Hindi docs use native-language caveats and date; validate only shared markers here.
      if((value==='not a stable'&&locale==='Hindi')||
        (value===ALPHA65_PUBLISHED.slice(0,10)&&locale==='Hindi'))continue
      if(!markdown.includes(value))errors.push(locale+': missing release evidence '+value)
    }
    if(locale==='Hindi'&&!markdown.includes('stable release नहीं'))
      errors.push('Hindi: explicit experimental-release warning missing')
    for(const name of names){
      const fixture=fixtures[name]
      const language=name.endsWith('.srp')?'scarp':'text'
      if(typeof fixture!=='string'||!hasExactFence(markdown,language,fixture))
        errors.push(locale+': missing exact '+name+' fenced source/output')
      const link='https://github.com/scarp-lang/scarp/blob/'+ALPHA65_SHA+'/examples/'+name
      if(!markdown.includes(link))errors.push(locale+': source attribution link missing '+name)
    }
  }
  return errors
}
