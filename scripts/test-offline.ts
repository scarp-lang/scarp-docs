import assert from 'node:assert/strict'
import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { documentationPages } from './lib/docs-pages.ts'

const root = resolve(fileURLToPath(new URL('..',import.meta.url)))
const artifactDir = join(root,'artifacts')
const filename = 'scarp-docs-offline.tar.gz'
const archive=join(artifactDir,filename)
const checksum=join(artifactDir,filename+'.sha256')
const sha = (bytes:Buffer):string=>createHash('sha256').update(bytes).digest('hex')

assert.ok(existsSync(archive),'Run npm run package:offline after npm run docs:build')
const archiveBytes=readFileSync(archive)
const digest=sha(archiveBytes)
assert.equal(readFileSync(checksum,'utf8'),digest+'  '+filename+'\n')
const stage=join(artifactDir,'.offline-stage')
const tar=execFileSync('tar',[
  '--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner',
  '--format=gnu','-cf','-','-C',stage,'.'
], {maxBuffer:128*1024*1024})
assert.equal(sha(gzipSync(tar,{level:9})),digest,
  'Two package builds from identical files must have identical bytes')

const extract=mkdtempSync(join(tmpdir(),'scarp-docs-offline-'))
let server:ChildProcessWithoutNullStreams|undefined
try {
  const paths=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).split('\n').filter(Boolean)
  assert.ok(paths.length>20,'Archive contains too few files')
  assert.ok(paths.every(path=>path.startsWith('./') && !path.split('/').includes('..')),
    'Archive must have only safe, relative paths')
  execFileSync('tar',['-xzf',archive,'-C',extract])
  const inventory=JSON.parse(readFileSync(join(extract,'MANIFEST.json'),'utf8')) as {
    format:string;documentationVersion:string;documentationCommit:string;
    latestPublishedCompiler:string;coreReferenceCompiler:string;
    siteBase:string;pages:number;files:Array<{path:string;bytes:number;sha256:string}>
  }
  assert.equal(inventory.format,'scarp-docs-offline-v1')
  assert.match(inventory.documentationVersion,/^0\.\d+\.\d+-alpha\.\d+$/)
  assert.match(inventory.documentationCommit,/^[a-f0-9]{40}$/)
  assert.equal(inventory.latestPublishedCompiler,'v0.0.6-alpha.1')
  assert.equal(inventory.coreReferenceCompiler,'v0.0.5-alpha.1')
  assert.equal(inventory.siteBase,'/scarp-docs/')
  const sources=documentationPages(join(root,'docs'))
  assert.equal(inventory.pages,sources.length)
  assert.equal(inventory.files.length,new Set(inventory.files.map(f=>f.path)).size)
  for(const file of inventory.files){
    assert.ok(!file.path.startsWith('/') && !file.path.split('/').includes('..'))
    const full=resolve(extract,file.path)
    assert.ok(full.startsWith(extract+sep),'package inventory points outside extraction')
    assert.ok(statSync(full).isFile(),file.path+' must be regular')
    const bytes=readFileSync(full)
    assert.equal(bytes.length,file.bytes,file.path+' file length mismatch')
    assert.equal(sha(bytes),file.sha256,file.path+' checksum mismatch')
  }
  const pagePaths=sources.map(page=>'scarp-docs/'+page.replace(/\.md$/,'.html'))
  for(const page of pagePaths) {
    assert.ok(inventory.files.some(x=>x.path===page),'Offline route missing '+page)
  }
  assert.ok(inventory.files.some(x=>x.path.endsWith('.css')&&x.path.startsWith('scarp-docs/assets/')))
  assert.ok(inventory.files.some(x=>x.path.endsWith('.js')&&x.path.startsWith('scarp-docs/assets/')))
  assert.ok(readFileSync(join(extract,'README-OFFLINE.txt'),'utf8').includes('हिन्दी'))

  const port=await new Promise<number>((resolvePort,reject)=>{
    server=spawn(process.execPath,[join(extract,'serve.mjs')],{
      cwd:extract,env:{...process.env,PORT:'0'},stdio:['pipe','pipe','pipe']
    })
    const timer=setTimeout(()=>reject(new Error('Local docs server did not start')),15000)
    let output=''
    let error=''
    server.stdout.on('data',data=>{
      output+=String(data)
      const match=/http:\/\/127\.0\.0\.1:(\d+)\/scarp-docs\//.exec(output)
      if(match){clearTimeout(timer);resolvePort(Number(match[1]))}
    })
    server.stderr.on('data',data=>{error+=String(data)})
    server.once('error',err=>{clearTimeout(timer);reject(err)})
    server.once('exit',code=>{clearTimeout(timer);reject(new Error('Local server exited '+code+': '+error))})
  })
  const origin='http://127.0.0.1:'+port
  async function request(path:string, expected:number, mime?:RegExp):Promise<Response>{
    const response=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(10000)})
    assert.equal(response.status,expected,path+' status mismatch')
    if(mime) assert.match(response.headers.get('content-type')??'',mime,path+' content-type')
    return response
  }
  const slash=await request('/',302)
  assert.equal(slash.headers.get('location'),'/scarp-docs/')
  for(const path of [
    '/scarp-docs/','/scarp-docs/hi/',
    '/scarp-docs/guide/learning-path',
    '/scarp-docs/hi/guide/learning-path',
    '/scarp-docs/tooling/command-finder',
    '/scarp-docs/hi/tooling/command-finder',
    '/scarp-docs/guide/installation-alpha6',
    '/scarp-docs/hi/guide/installation-alpha6'
  ]){
    const response=await request(path,200,/text\/html/i)
    const html=await response.text()
    assert.match(html,/<html\b/i,path+' missing HTML')
    assert.ok(html.includes('/scarp-docs/assets/'),path+' missing local asset base')
    assert.ok(html.includes('lang="'+(path.includes('/hi/')?'hi-IN':'en-US')+'"'))
  }
  const en=await (await request('/scarp-docs/',200,/text\/html/i)).text()
  const assets=[...en.matchAll(/(?:src|href)="(\/scarp-docs\/assets\/[^"?#]+\.(?:js|css))/g)].map(x=>x[1])
  assert.ok(assets.some(x=>x.endsWith('.js'))&&assets.some(x=>x.endsWith('.css')),
    'Homepage must reference local bundled JS/CSS')
  for(const asset of new Set(assets.slice(0,8))){
    const data=await request(asset,200,asset.endsWith('.css')?/text\/css/:/javascript/)
    assert.ok((await data.arrayBuffer()).byteLength>0)
  }
  const sitemap=await request('/scarp-docs/sitemap.xml',200,/xml/)
  assert.equal((await sitemap.text()).match(/<url>/g)?.length, sources.length)
  await request('/scarp-docs/does-not-exist',404)
  await request('/not-inside-prefix',404)
  const forbidden=await fetch(origin+'/scarp-docs/',{method:'POST'})
  assert.equal(forbidden.status,405)
  console.log('PASS: reproducible offline archive, SHA-256, '+inventory.files.length+
    ' file hashes, '+sources.length+' English/Hindi routes and local HTTP/JS/CSS/search-capable asset serving')
} finally {
  server?.kill()
  rmSync(extract,{recursive:true,force:true})
}
