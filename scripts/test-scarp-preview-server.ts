import assert from 'node:assert/strict'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { currentPublishedCompilerTag } from './scarp-site/current-release.ts'

/** End-to-end contract for npm run docs:preview, not a mock HTTP server. */
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const dist=join(root,'docs/.scarp/dist')
assert.ok(existsSync(join(dist,'index.html')),
  'Run npm run docs:build before testing the preview server')
const manifest=JSON.parse(readFileSync(join(root,'data/compiler-latest-release.json'),'utf8')) as unknown
const latest=currentPublishedCompilerTag(manifest)
let child:ChildProcessWithoutNullStreams|undefined

try{
  const port=await new Promise<number>((done,fail)=>{
    const proc=spawn(process.execPath,[
      '--import','tsx','scripts/scarp-site/serve-dev.ts','--preview'
    ],{cwd:root,env:{...process.env,PORT:'0'},stdio:['pipe','pipe','pipe']})
    child=proc
    let stdout='',stderr=''
    const timer=setTimeout(()=>{
      proc.kill()
      fail(new Error('Scarp preview server startup timed out: '+stderr))
    },15000)
    proc.stdout.on('data',chunk=>{
      stdout+=String(chunk)
      const match=/http:\/\/127\.0\.0\.1:(\d+)\/scarp-docs\//.exec(stdout)
      if(match){clearTimeout(timer);done(Number(match[1]))}
    })
    proc.stderr.on('data',chunk=>{stderr+=String(chunk)})
    proc.once('error',error=>{clearTimeout(timer);fail(error)})
    proc.once('exit',status=>{
      clearTimeout(timer)
      fail(new Error('Scarp preview server exited '+status+': '+stderr))
    })
  })
  const origin='http://127.0.0.1:'+port
  let verified=0
  for(const lang of ['', 'hi/']){
    for(const tag of [latest, 'v0.0.6-alpha.7']){
      const route='/scarp-docs/'+lang+'releases/'+tag
      const result=await fetch(origin+route+'?from=preview',{
        redirect:'manual',signal:AbortSignal.timeout(10000)
      })
      assert.equal(result.status,200,'Could not preview dotted compiler release '+route)
      assert.match(result.headers.get('content-type')??'',/text\/html/i)
      const html=await result.text()
      assert.ok(html.includes(tag) && html.includes('lang="'+(lang?'hi-IN':'en-US')+'"'),
        'Preview returned wrong release or language at '+route)
      assert.ok(html.includes('href="https://scarp-lang.github.io'+route+'"'),
        'Preview lost canonical clean route at '+route)
      const head=await fetch(origin+route,{
        method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(10000)
      })
      assert.equal(head.status,200,'HEAD must resolve dotted release route '+route)
      assert.match(head.headers.get('content-type')??'',/text\/html/i)
      assert.ok(Number(head.headers.get('content-length'))>0)
      assert.equal(await head.text(),'','HEAD must not return an HTML body')
      verified++
    }
  }
  const asset=await fetch(origin+'/scarp-docs/assets/scarp-site.css',{
    redirect:'manual',signal:AbortSignal.timeout(10000)
  })
  assert.equal(asset.status,200)
  assert.match(asset.headers.get('content-type')??'',/text\/css/i)
  assert.ok((await asset.text()).length>200)
  const denied=await fetch(origin+'/scarp-docs/',{method:'POST',signal:AbortSignal.timeout(10000)})
  assert.equal(denied.status,405)
  const absent=await fetch(origin+'/scarp-docs/releases/not-a-real-tag.999',{
    redirect:'manual',signal:AbortSignal.timeout(10000)
  })
  assert.equal(absent.status,404)
  console.log('PASS: actual docs:preview server, '+verified+
    ' current/historical English/Hindi dotted-version routes, HEAD, assets and safe errors')
}finally{
  child?.kill()
}
