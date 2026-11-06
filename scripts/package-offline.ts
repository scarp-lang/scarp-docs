import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import ts from 'typescript'
import { documentationPages } from './lib/docs-pages.ts'

/** Deterministic, offline-ready tar.gz of the already-built VitePress website. */
export const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
export const dist = join(root, 'docs/.vitepress/dist')
export const artifactDir = join(root, 'artifacts')
const stage = join(artifactDir, '.offline-stage')
export const archiveName = 'scarp-docs-offline.tar.gz'
export const archiveFile = join(artifactDir, archiveName)
export const checksumFile = archiveFile + '.sha256'
export const sha256 = (buffer: Buffer): string =>
  createHash('sha256').update(buffer).digest('hex')

function walk(folder: string): string[] {
  return readdirSync(folder, {withFileTypes: true}).flatMap(entry => {
    const full = join(folder, entry.name)
    if (entry.isDirectory()) return walk(full)
    if (!entry.isFile()) throw new Error('Unsupported file in offline snapshot: ' + full)
    return [relative(stage, full).split(sep).join('/')]
  }).sort()
}

assert.ok(existsSync(dist), 'First run npm run docs:build')
assert.ok(existsSync(join(dist, 'sitemap.xml')), 'Built website is missing sitemap.xml')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {version:string}
const docSources = documentationPages(join(root, 'docs'))
for (const source of docSources) {
  assert.ok(existsSync(join(dist, source.replace(/\.md$/,'.html'))),
    'VitePress build is incomplete: ' + source)
}
assert.ok(docSources.some(page => page.startsWith('hi/')), 'Hindi site is absent')
const commit = (process.env.GITHUB_SHA ??
  execFileSync('git',['rev-parse','HEAD'], {cwd:root,encoding:'utf8'}).trim())
assert.match(commit,/^[a-f0-9]{40}$/,'A complete tested Git commit SHA is required')

// Rebuild from scratch every time; never carry old pages or asset hashes forward.
rmSync(stage, {recursive:true,force:true})
mkdirSync(stage, {recursive:true})
cpSync(dist, join(stage, 'scarp-docs'), {recursive:true})

/**
 * The online documentation uses an organization avatar hosted by GitHub.
 * For the offline snapshot only, replace it with a self-contained Scarp-blue
 * geometric S fallback. Online Pages keeps the original brand avatar.
 * This is deterministic, so packaging does not require downloading an image.
 */
const hostedAvatar = 'https://avatars.githubusercontent.com/u/350973173?v=4'
const offlineLogo = '/scarp-docs/offline-logo.svg'
writeFileSync(join(stage, 'scarp-docs', 'offline-logo.svg'), [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Scarp">',
  '<rect width="128" height="128" fill="#fff"/>',
  '<path d="M97 28H50L30 47L48 64H79L97 82L77 101H30"',
  ' fill="none" stroke="#2563eb" stroke-width="17" stroke-linecap="square" stroke-linejoin="bevel"/>',
  '</svg>'
].join(''), 'utf8')
let localizedAvatars = 0
for (const path of walk(join(stage, 'scarp-docs'))) {
  if (!/\.(?:html|js|css|json|xml)$/.test(path)) continue
  const file = join(stage,path)
  const original = readFileSync(file, 'utf8')
  const count = original.split(hostedAvatar).length-1
  if (count) {
    writeFileSync(file, original.replaceAll(hostedAvatar,offlineLogo),'utf8')
    localizedAvatars += count
  }
}
assert.ok(localizedAvatars > 0,
  'Offline snapshot must replace the hosted Scarp organization avatar locally')

const serverTs = readFileSync(join(root,'scripts/offline/serve.ts'),'utf8')
const compiled = ts.transpileModule(serverTs, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    removeComments: true
  },
  fileName: 'serve.ts',
  reportDiagnostics: true
})
if (compiled.diagnostics?.length) {
  throw new Error('Offline server TypeScript transpilation reported errors')
}
writeFileSync(join(stage,'serve.mjs'),compiled.outputText,'utf8')
const instructions = `Scarp Docs — Offline English/Hindi website
Docs version: ${packageJson.version}
Docs source commit: ${commit}
Latest documented published compiler: v0.0.6-alpha.1
Core language-reference baseline: v0.0.5-alpha.1

Requires Node.js 20.19+ (Node 22 recommended). No npm install needed.

1. From this extracted folder run: node serve.mjs
2. Open http://127.0.0.1:8080/scarp-docs/
3. Hindi: http://127.0.0.1:8080/scarp-docs/hi/
4. Press Ctrl+C to stop.

The server binds ONLY to 127.0.0.1. Search, code highlighting and
internal English/Hindi navigation use local bundled HTML, JavaScript and CSS.
External GitHub, community and download links still need internet.
Do not open index.html with file://; absolute /scarp-docs/ asset
paths require the included local HTTP server.
The snapshot is documentation, NOT a Scarp executable or compiler.
Canonical metadata continues to reference the official online site.

हिन्दी निर्देश
1. Node.js 20.19+ पहले से इंस्टॉल होना चाहिए।
2. इस extracted folder में node serve.mjs चलाएँ।
3. हिन्दी पृष्ठ खोलें: http://127.0.0.1:8080/scarp-docs/hi/
4. रोकने के लिए Ctrl+C दबाएँ।
खोज और अंदर के लिंक offline चलते हैं। GitHub जैसे बाहरी लिंक को
इंटरनेट चाहिए। यह केवल दस्तावेज़ है, Scarp compiler नहीं।
`
writeFileSync(join(stage,'README-OFFLINE.txt'),instructions,'utf8')

const contents = walk(stage)
assert.ok(contents.some(p => p.startsWith('scarp-docs/assets/') && p.endsWith('.js')),
  'VitePress JavaScript bundle missing from offline package')
assert.ok(contents.some(p => p.startsWith('scarp-docs/assets/') && p.endsWith('.css')),
  'VitePress stylesheet missing from offline package')
const manifest = {
  format: 'scarp-docs-offline-v1',
  documentationVersion: packageJson.version,
  documentationCommit: commit,
  latestPublishedCompiler: 'v0.0.6-alpha.1',
  coreReferenceCompiler: 'v0.0.5-alpha.1',
  siteBase: '/scarp-docs/',
  pages: docSources.length,
  files: contents.map(path => ({
    path, bytes: statSync(join(stage,path)).size,
    sha256: sha256(readFileSync(join(stage,path)))
  }))
}
writeFileSync(join(stage,'MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n','utf8')

// Stable gzip header (mtime 0), sorted tar entries, normalized uid/gid/mtime:
// running twice on the same build and commit must give identical archive bytes.
const tar = execFileSync('tar',[
  '--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner',
  '--format=gnu','-cf','-','-C',stage,'.'
], {maxBuffer:128*1024*1024})
const output=gzipSync(tar,{level:9})
writeFileSync(archiveFile,output)
writeFileSync(checksumFile,sha256(output)+'  '+archiveName+'\n','utf8')
console.log('PASS: packaged '+docSources.length+' English/Hindi HTML pages and '+
  manifest.files.length+' static/source files at tested commit '+commit)
console.log('Archive: '+archiveFile+' ('+output.length+' bytes), SHA-256 '+sha256(output))
