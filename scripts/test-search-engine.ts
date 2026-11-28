import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  parseSearchIndex, parseDocumentationQuery, searchDocumentation, searchPreview,
  type SearchEntry
} from './scarp-site/search-index.ts'

function entry(
  name:string, title:string, section:string, excerpt:string,
  locale:'en'|'hi'='en'
):SearchEntry {
  const prefix=locale==='hi'?'hi/':''
  return {route:'/scarp-docs/'+prefix+section+'/'+name,
    locale,title,section,excerpt}
}
const examples: SearchEntry[] = parseSearchIndex([
  entry('lifetimes','Lifetime and memory','language',
    'Lifetime automatically manages memory values without explicit ownership, borrowing or a garbage collector.'),
  entry('functions','Functions and contracts','language',
    'Use funcra and pure funcra declarations. Functions can specify integer or string results.'),
  entry('decimal','Exact decimal calculations','language',
    'The decimal type preserves exact sums: 0.1 plus 0.2 equals 0.3. E0063 is unrelated.'),
  entry('commands','Command reference','tooling',
    'Use scarp exec to execute a program, or scarp inspect for tooling diagnostics.'),
  entry('diagnostic','Compiler diagnostics','reference',
    'E0063 identifies invalid fixed-array indices. This diagnostic is reported by the compiler.'),
  entry('walkthrough','Beginning with Scarp','guide',
    'Use the compiler and the editor to run your first program.'),
  entry('repeat','Repeat loops','language',
    'repeat 5 as i { } declares a loop-bound iteration variable.'),
  entry('tuples','Tuples, arrays, and lists','language',
    'A tuple<integer, string> is fixed-size. It may hold an integer and string together.'),
  entry('intrinsic','C++ and Rust interoperability','reference',
    'Scarp is not C++, but native interoperability may involve C++ toolchains.'),
  entry('safe','Safe HTML display','guide',
    '<script> cannot be executed from search descriptions. & less-than text remains text.'),
  entry('memory','Lifetime और मेमोरी','language',
    'Lifetime मूल्य अपने आप सँभालता है। ownership के लिए अलग syntax आवश्यक नहीं है।','hi'),
  entry('loop','Repeat और loops','language',
    'repeat 5 as i में i हर बार की गिनती के लिए उपलब्ध है।','hi'),
  entry('error','Compiler त्रुटि E0063','reference',
    'E0063 fixed-array index के गलत उपयोग की diagnostic है।','hi'),
  entry('unicode','हिन्दी Unicode अक्षर','guide',
    'नमस्ते 👋 दुनिया! हिंदी प्रोग्राम और Unicode text को खोजिए।','hi')
])

const routes=(query:string,locale:'en'|'hi'='en')=>
  searchDocumentation(examples,query,{locale}).map(item=>item.entry.route)
const names=(query:string,locale:'en'|'hi'='en')=>
  searchDocumentation(examples,query,{locale}).map(item=>item.entry.title)

test('parses safe bounded arrays without changing their payloads',()=>{
  assert.equal(examples.length,14)
  assert.equal(examples[0]!.title,'Lifetime and memory')
  assert.equal(examples[10]!.locale,'hi')
  assert.equal(examples[12]!.excerpt.includes('E0063'),true)
  assert.deepEqual(parseSearchIndex(examples),examples)
  assert.notStrictEqual(parseSearchIndex(examples),examples)
  for(const value of [null,undefined,1,{},false,[],new Set(),'',NaN]) {
    assert.throws(()=>parseSearchIndex(value),TypeError)
  }
})

test('rejects routes that could navigate outside the site',()=>{
  const routeCases=[
    'https://elsewhere.test/',
    '//evil.test/', '/scarp-docs/%2e%2e/something',
    '/scarp-docs/../escape', '/scarp-docs/./anything',
    '/scarp-docs/a//b', '/scarp-docs/hi//page',
    '/scarp-docs/a/b?q=1', '/scarp-docs/a/b#section',
    '/scarp-docs/a\\b', '/scarp-docs/a b',
    '/scarp-docs/ hi/page', '/scarp-docs/?redirect=/x',
    '/scarp-docs/hi/../../external',
    '/scarp-docs/a\nb','/scarp-docs/a\tb',
  ]
  for(const route of routeCases) {
    assert.throws(()=>parseSearchIndex([{...examples[0],route}]),TypeError,route)
  }
  assert.equal(parseSearchIndex([{...examples[0],route:'/scarp-docs/'}]).length,1)
  assert.equal(parseSearchIndex([{...examples[0],route:'/scarp-docs/a/'}]).length,1)
})

test('validates the locale encoded in the route',()=>{
  assert.throws(()=>parseSearchIndex([{...examples[0],locale:'hi'}]),TypeError)
  assert.throws(()=>parseSearchIndex([{...examples[10],locale:'en'}]),TypeError)
  assert.throws(()=>parseSearchIndex([{...examples[0],locale:'fr'}]),TypeError)
  assert.throws(()=>parseSearchIndex([{...examples[10],route:'/scarp-docs/hi'}]),TypeError)
  assert.equal(parseSearchIndex([entry('ok','हिन्दी','guide','सही','hi')]).length,1)
})

test('validates input shapes and prevents unknown fields overriding output',()=>{
  for(const modification of [
    {title:55}, {title:''}, {section:0}, {section:'  '},
    {excerpt:[]}, {excerpt:null}, {route:0}, {locale:'de'},
    {section:'a'.repeat(129)}, {title:'x'.repeat(513)},
    {route:'/scarp-docs/'+'a'.repeat(1100)},
    {excerpt:'a'.repeat(1_000_001)}
  ]) {
    assert.throws(()=>parseSearchIndex([{...examples[0],...modification}]),TypeError)
  }
  const trusted=parseSearchIndex([{...examples[0],unexpected:{admin:true}}])
  assert.equal('unexpected' in trusted[0]!,false)
})

test('rejects duplicate routes and bounded index sizes atomically',()=>{
  assert.throws(()=>parseSearchIndex([examples[0],examples[0]]),/Duplicate/)
  assert.throws(()=>parseSearchIndex(Array.from({length:4097},()=>examples[0])),TypeError)
  const entries=Array.from({length:20},(_,i)=>
    entry('large'+i,'Large '+i,'language','x'.repeat(700_000)))
  assert.throws(()=>parseSearchIndex(entries),/budget/)
  const near=entry('near','Near maximum','guide','y'.repeat(999_999))
  assert.equal(parseSearchIndex([near]).length,1)
})

test('allows empty search but never displays the whole corpus',()=>{
  for(const query of ['', ' ', '\t\n', '-', '---', 'title:', '-memory',
    '  -memory -tuple  ', '-"quoted phrase"', 'section:']) {
    assert.deepEqual(routes(query),[],query)
  }
})

test('parses ordinary multiword AND queries',()=>{
  assert.deepEqual(parseDocumentationQuery('memory Lifetime').clauses.map(c=>c.text),
    ['memory','lifetime'])
  assert.deepEqual(names('Lifetime values'),['Lifetime and memory'])
  assert.deepEqual(routes('lifetime never'),[])
  assert.deepEqual(routes('E0063 fixed-array'),[
    '/scarp-docs/reference/diagnostic'
  ])
})

test('ranks exact title, title prefix, and body mentions consistently',()=>{
  const candidates=parseSearchIndex([
    entry('three','A lifetime demo','guide','Memory lifetime'),
    entry('two','Lifetime lessons','guide','General introduction'),
    entry('one','Lifetime','guide','General introduction')
  ])
  assert.deepEqual(searchDocumentation(candidates,'Lifetime',{locale:'en'})
    .map(r=>r.entry.title),['Lifetime','Lifetime lessons','A lifetime demo'])
  assert.ok(searchDocumentation(candidates,'Lifetime',{locale:'en'})[0]!.score >
    searchDocumentation(candidates,'Lifetime',{locale:'en'})[1]!.score)
  assert.ok(searchDocumentation(candidates,'Lifetime',{locale:'en'})[1]!.titleHit)
})

test('ranks title matches ahead of noisy repeated body matches',()=>{
  const candidates=parseSearchIndex([
    entry('long','Generic content','guide','memory '.repeat(1200)),
    entry('short','Memory management','guide','A brief introduction')
  ])
  const result=searchDocumentation(candidates,'memory',{locale:'en'})
  assert.equal(result[0]!.entry.title,'Memory management')
  assert.ok(result[0]!.score > result[1]!.score)
})

test('supports quoted contiguous phrases',()=>{
  assert.deepEqual(names('"Lifetime and memory"'),['Lifetime and memory'])
  assert.deepEqual(names('"memory and Lifetime"'),[])
  assert.deepEqual(names('"0.1 plus 0.2"'),['Exact decimal calculations'])
  assert.deepEqual(names('"fixed-array indices"'),['Compiler diagnostics'])
})

test('supports scoped field queries and legacy plain queries',()=>{
  assert.deepEqual(names('title:memory'),['Lifetime and memory'])
  assert.deepEqual(names('body:memory'),['Lifetime and memory'])
  assert.deepEqual(names('section:tooling'),['Command reference'])
  assert.deepEqual(names('in:tooling'),['Command reference'])
  assert.deepEqual(names('section:tooling body:diagnostics'),['Command reference'])
  assert.deepEqual(names('title:E0063'),[])
  assert.deepEqual(names('body:E0063'),['Compiler diagnostics','Exact decimal calculations'])
  assert.deepEqual(names('section:invalid'),[])
})

test('mixes positive and negative filters',()=>{
  assert.deepEqual(names('E0063 -decimal'),['Compiler diagnostics'])
  assert.deepEqual(names('E0063 -diagnostic'),['Exact decimal calculations'])
  assert.deepEqual(names('memory -title:lifetime'),[])
  assert.deepEqual(names('in:language -decimal'),[
    'Lifetime and memory','Functions and contracts','Repeat loops','Tuples, arrays, and lists'
  ].sort((a,b)=>a.localeCompare(b)),
  'stable route ordering is not lexical by title')
})

test('search supports Hindi, English identifiers, and combined queries',()=>{
  assert.deepEqual(names('मेमोरी','hi'),['Lifetime और मेमोरी'])
  assert.deepEqual(names('E0063','hi'),['Compiler त्रुटि E0063'])
  assert.deepEqual(names('repeat i','hi'),['Repeat और loops'])
  assert.deepEqual(names('नमस्ते 👋','hi'),['हिन्दी Unicode अक्षर'])
  assert.deepEqual(routes('नमस्ते','en'),[])
  assert.deepEqual(routes('Lifetime','hi'),['/scarp-docs/hi/language/memory'])
})

test('normalizes Unicode compatibility and case consistently',()=>{
  assert.deepEqual(names('LIFETIME'),['Lifetime and memory'])
  assert.deepEqual(names('ｌｉｆｅｔｉｍｅ'),['Lifetime and memory'])
  assert.deepEqual(names('ＦＵＮＣＲＡ'),['Functions and contracts'])
  assert.deepEqual(names('e0063'),['Compiler diagnostics','Exact decimal calculations'])
})

test('preserves compiler operators and punctuation',()=>{
  assert.deepEqual(names('C++'),['C++ and Rust interoperability'])
  assert.deepEqual(names('tuple<integer,'),['Tuples, arrays, and lists'])
  assert.deepEqual(names('0.3'),['Exact decimal calculations'])
  assert.deepEqual(names('<script>'),['Safe HTML display'])
})

test('limits result count without mutating search index',()=>{
  const candidates=parseSearchIndex(Array.from({length:70},(_,i)=>
    entry('result-'+i,'Search result '+i,'guide','Search me too.')))
  assert.equal(searchDocumentation(candidates,'search',{locale:'en',limit:0}).length,0)
  assert.equal(searchDocumentation(candidates,'search',{locale:'en',limit:3}).length,3)
  assert.equal(searchDocumentation(candidates,'search',{locale:'en',limit:999}).length,50)
  assert.equal(searchDocumentation(candidates,'search',{locale:'en',limit:-5}).length,0)
  assert.equal(searchDocumentation(candidates,'search',{locale:'en',limit:NaN}).length,18)
  assert.equal(candidates.length,70)
})

test('ranking remains deterministic after reordering source entries',()=>{
  const original=searchDocumentation(examples,'language',{locale:'en'})
  const reverse=searchDocumentation([...examples].reverse(),'language',{locale:'en'})
  assert.deepEqual(original.map(x=>[x.entry.route,x.score]),
    reverse.map(x=>[x.entry.route,x.score]))
})

test('reuses cached preprocessing and handles multiple independent calls',()=>{
  const first=searchDocumentation(examples,'memory',{locale:'en'})
  const second=searchDocumentation(examples,'memory',{locale:'en'})
  assert.deepEqual(first,second)
  assert.deepEqual(names('repeat'),['Repeat loops'])
  assert.deepEqual(names('memory'),['Lifetime and memory'])
  assert.deepEqual(names('Lifetime','hi'),['Lifetime और मेमोरी'])
})

test('preview preserves surrogate pairs and Devanagari text',()=>{
  const content='अक्षर'.repeat(35)+' नमस्ते 👋 खोज '+'कहानी'.repeat(50)
  const preview=searchPreview(content,'नमस्ते',80)
  assert.ok(preview.includes('नमस्ते'))
  assert.ok(Array.from(preview).length<=82)
  assert.equal(preview.includes('\uFFFD'),false)
  assert.equal(searchPreview('👋'.repeat(300),'👋',40).includes('👋'),true)
})

test('preview respects bounds and empty short descriptions',()=>{
  assert.equal(searchPreview('small','x'), 'small')
  assert.equal(searchPreview('','x'), '')
  assert.equal(searchPreview('a'.repeat(1000),'xyz',40).length,41)
  assert.equal(searchPreview('a'.repeat(1000),'xyz',2).length,25)
  assert.equal(searchPreview('a'.repeat(1000),'xyz',NaN).length,161)
  assert.ok(searchPreview('x'.repeat(300)+'E0063'+'y'.repeat(300),'E0063').includes('E0063'))
})

test('search snippets show query context and hide omitted sections',()=>{
  const candidates=parseSearchIndex([
    entry('long','Memory tools','guide','start '.repeat(110)+'Lifetime pointers'+
      ' end '.repeat(110))
  ])
  const found=searchDocumentation(candidates,'Lifetime',{locale:'en'})
  assert.equal(found.length,1)
  assert.ok(found[0]!.preview.includes('Lifetime pointers'))
  assert.equal(searchDocumentation(candidates,'section:guide',{locale:'en'})[0]!.preview.length>0,true)
})

test('handles malformed queries without throwing',()=>{
  for(const query of [
    '"', '"unterminated', 'in:', 'title:', 'title:"',
    '--memory', '---memory', '-"x y', '   "a b c',
    '""', '-""', 'title:  body:',
    'word\\\\word', '<script>alert(1)</script>',
    '\u0000\n\t', '\uD800', '\uDFFF', '🤖🤖🤖'
  ]) {
    const parsed=parseDocumentationQuery(query)
    assert.ok(Array.isArray(parsed.clauses))
    assert.doesNotThrow(()=>searchDocumentation(examples,query,{locale:'en'}))
  }
})

test('bounds maliciously large queries and clauses',()=>{
  const huge='word '.repeat(10_000)
  const parsed=parseDocumentationQuery(huge)
  assert.ok(parsed.clauses.length<=24)
  assert.equal(parsed.truncated,true)
  assert.ok(searchDocumentation(examples,huge,{locale:'en'}).length<=18)
  assert.equal(parseDocumentationQuery('z'.repeat(200)).clauses[0]!.text.length,120)
})

test('enforces locales and leaves inputs unmodified',()=>{
  const before=JSON.stringify(examples)
  assert.throws(()=>searchDocumentation(examples,'hello',{locale:'fr' as 'en'}),TypeError)
  assert.deepEqual(searchDocumentation(examples,'hello',{locale:'en',limit:0}),[])
  assert.equal(JSON.stringify(examples),before)
})

test('search is consistently bounded over a large but valid corpus',()=>{
  const generated=parseSearchIndex(Array.from({length:1024},(_,index)=>
    entry('article-'+String(index).padStart(4,'0'),
      'Compiler reference '+index,'reference',
      'The compiler supports static diagnostics and numerical functions. '.repeat(4)+
      ' E0063 and Lifetime',index%2?'hi':'en')))
  const start=performance.now()
  const answers=searchDocumentation(generated,'compiler E0063',{locale:'en'})
  const elapsed=performance.now()-start
  assert.equal(answers.length,18)
  assert.ok(elapsed<4000,'Search over 1024 pages should complete in under 4s: '+elapsed)
})
