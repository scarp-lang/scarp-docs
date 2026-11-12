import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'
import { currentPublishedCompilerTag } from './scarp-site/current-release.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
const tag='v0.0.6-alpha.8'
const commit='37253e7805c0ca594560700dd1deb3928458e60d'
const publishedAt='2026-11-12T13:19:58Z'
const docs=['releases/'+tag, 'tooling/project-alpha8', 'tutorials/calculator-alpha8']
interface Case { source:string;localSource:string }
const manifest=JSON.parse(read('conformance/alpha8-manifest.json')) as {
  compilerRepository:string;compilerRef:string;compilerCommit:string;
  releasedAt:string;cases:Case[];expectedStdout:string
}
assert.equal(currentPublishedCompilerTag(JSON.parse(read('data/compiler-latest-release.json')) as unknown),tag)
assert.equal(manifest.compilerRepository,'scarp-lang/scarp')
assert.equal(manifest.compilerRef,tag)
assert.equal(manifest.compilerCommit,commit)
assert.equal(manifest.releasedAt,publishedAt)
assert.equal(manifest.cases.length,6)
const officialPaths=[
  'examples/projects/calculator/scarp.project',
  'examples/projects/calculator/src/main.srp',
  'examples/projects/calculator/src/math.srp',
  'examples/projects/calculator/tests/addition.srp',
  'examples/projects/calculator/tests/input.srp',
  'examples/projects/calculator/tests/input.stdin'
]
assert.deepEqual(manifest.cases.map(c=>c.source),officialPaths)
const snippets=manifest.cases.map(c=>read(c.localSource).trimEnd())
assert.equal(manifest.expectedStdout,'conformance/alpha8/calculator.stdout')
assert.equal(read(manifest.expectedStdout),'5\n')
const marker='<!-- scarp-current-release: '+tag+' -->'
const source='<!-- scarp-current-source: '+commit+' -->'
for(const doc of docs){
  const en=read('docs/'+doc+'.md')
  const hi=read('docs/hi/'+doc+'.md')
  for(const body of [en,hi]){
    assert.ok(body.includes(marker),doc+': published-release marker drift')
    assert.ok(body.includes(source),doc+': tagged commit marker drift')
    assert.ok(body.includes('<!-- scarp-cli-release: '+tag+' -->'),
      doc+': release-guarded CLI marker missing')
    assert.ok(body.includes('](/'+(body===hi?'hi/':'')+'releases/'+tag+')') ||
      doc==='releases/'+tag,doc+': latest release crosslink missing')
    assert.ok(body.includes('assert'),doc+': published assertion feature missing')
    assert.ok(body.includes('scarp test'),doc+': published test runner missing')
  }
  assert.ok((hi.match(/[\u0900-\u097f]/gu)??[]).length>=80,
    doc+': substantial Hindi translation missing')
  assert.equal(firstMissingCodeBlock(extractCodeFences(en),extractCodeFences(hi)),-1,
    doc+': bilingual exact code fences differ')
}
for(const name of ['src/main.srp']){
  const original=snippets[officialPaths.findIndex(p=>p.endsWith(name))]!
  for(const file of ['docs/releases/'+tag+'.md','docs/hi/releases/'+tag+'.md']){
    assert.ok(read(file).includes(original),file+': source differs from tagged main.srp')
    assert.ok(read(file).includes('~~~text\n5\n~~~'),file+': example stdout missing')
  }
}
for(const file of ['docs/tutorials/calculator-alpha8.md','docs/hi/tutorials/calculator-alpha8.md']){
  const text=read(file)
  for(const item of snippets)assert.ok(text.includes(item),file+': exact tagged calculator file missing')
  assert.ok(text.includes('~~~text\n5\n~~~'),file+': expected stdout missing')
  for(const command of [
    'scarp verify examples/projects/calculator',
    'scarp run examples/projects/calculator',
    'scarp project info --json examples/projects/calculator',
    'scarp test --list examples/projects/calculator',
    'scarp test --require-tests examples/projects/calculator',
    'scarp test --json --filter input examples/projects/calculator'
  ])assert.ok(text.includes(command),file+': published command absent '+command)
}
for(const file of ['docs/releases/'+tag+'.md','docs/hi/releases/'+tag+'.md']){
  const body=read(file)
  for(const platform of [
    'x86_64-pc-windows-msvc.zip','x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ]){
    const archive='scarp-0.0.6-alpha.8-'+platform
    const uri='https://github.com/scarp-lang/scarp/releases/download/'+tag+'/'+archive
    assert.ok(body.includes(']('+uri+')'),file+': missing official archive '+archive)
    assert.ok(body.includes(']('+uri+'.sha256)'),file+': missing checksum '+archive)
  }
  assert.ok(body.includes('SHA256SUMS') && body.includes('E0065'),
    file+': published diagnostics and release evidence missing')
}
for(const [p,locale] of [
  ['docs/index.md','en'],['docs/hi/index.md','hi'],
  ['docs/reference/status.md','en'],['docs/hi/reference/status.md','hi']
] as const){
  const text=read(p)
  assert.ok(text.includes('](/'+(locale==='hi'?'hi/':'')+'releases/'+tag+')'),
    p+': main onboarding does not link published alpha.8')
}
console.log('PASS: alpha.8 published source commit, 6 exact calculator files, stdout, 3 bilingual guides, downloads, and latest navigation')
