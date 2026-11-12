import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { existsSync, watch } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSite, previewRoot } from './build.ts'

const root=resolve(fileURLToPath(new URL('../..',import.meta.url)))
const preview=process.argv.includes('--preview')
const site=preview?join(root,'docs/.scarp/dist'):join(previewRoot,'scarp-docs')
const base='/scarp-docs/'
const types:Record<string,string>={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.xml':'application/xml; charset=utf-8'
}
if (!preview) await buildSite()
if (!existsSync(join(site,'index.html'))) {
  throw new Error('Scarp site not built; run npm run docs:build first')
}

const requestedPort=Number(process.env.PORT??'5173')
if(!Number.isInteger(requestedPort)||requestedPort<0||requestedPort>65535) {
  throw new TypeError('PORT must be a valid whole number')
}
const server=createServer((req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.writeHead(405,{Allow:'GET, HEAD'}).end('Method not allowed')
    return
  }
  let pathname:string
  try{pathname=decodeURIComponent(new URL(req.url??'/','http://127.0.0.1').pathname)}
  catch{res.writeHead(400).end('Invalid URL');return}
  if(pathname==='/'){
    res.writeHead(302,{Location:base}).end()
    return
  }
  if(!pathname.startsWith(base)||pathname.includes('\\')||pathname.includes('\0')||
    pathname.split('/').some(x=>x==='..'||x==='.')){
    res.writeHead(404).end('Not found')
    return
  }
  const tail=pathname.slice(base.length)
  // Dotted compiler versions such as v0.0.6-alpha.8 are clean HTML routes,
  // not static files with a ".8" extension. Literal assets are recognized
  // only by known content-types, matching the standalone offline server.
  const extension=extname(tail).toLowerCase()
  const suffix=tail.endsWith('/')||!tail?'index.html':
    extension && Object.hasOwn(types,extension)?'':'.html'
  const actual=resolve(site,tail+suffix)
  if(actual!==site&&!actual.startsWith(site+sep)){
    res.writeHead(404).end('Not found')
    return
  }
  void (async()=>{
    try{
      if(!(await stat(actual)).isFile())throw new Error('Not a file')
      const bytes=await readFile(actual)
      res.writeHead(200,{
        'Content-Type':types[extname(actual)]??'application/octet-stream',
        'Content-Length':bytes.byteLength,
        'Cache-Control':'no-store',
        'X-Content-Type-Options':'nosniff'
      })
      res.end(req.method==='HEAD'?undefined:bytes)
    }catch{res.writeHead(404).end('Not found')}
  })()
})
server.listen(requestedPort,'127.0.0.1',()=>{
  const address=server.address()
  const port=address&&typeof address==='object'?address.port:requestedPort
  console.log('Scarp Docs ('+(preview?'production preview':'development')+
    '): http://127.0.0.1:'+port+base)
  console.log('Local machine only; press Ctrl+C to stop.')
})

if(!preview){
  let pending:ReturnType<typeof setTimeout>|undefined
  try{
    const listener=watch(join(root,'docs'),{recursive:true},(_,filename)=>{
      if(!filename?.endsWith('.md'))return
      if(pending)clearTimeout(pending)
      pending=setTimeout(()=>{
        void buildSite().then(()=>console.log('Scarp Docs rebuilt after '+filename))
          .catch(error=>console.error('Scarp build failed: '+String(error)))
      },300)
    })
    server.on('close',()=>listener.close())
  }catch(error){
    console.warn('Automatic file watching unavailable; restart to rebuild: '+String(error))
  }
}
