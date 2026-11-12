import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, relative, dirname, extname } from 'node:path'
import { documentationPages } from './lib/docs-pages.ts'
import { BASE, ORIGIN, pairedRoutes, sourceRoute } from './scarp-site/routes.ts'
import { currentPublishedCompilerTag } from './scarp-site/current-release.ts'
import { fileURLToPath } from 'node:url'
import { documentationHeadingSlug } from './lib/docs-slug.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docs = resolve(root, 'docs')
const sourceContract = resolve(root, 'scripts/scarp-site/routes.ts')
const pages = documentationPages(docs)
const checked = [
  resolve(root, 'README.md'),
  resolve(root, 'CONTRIBUTING.md'),
  ...pages.map(page => resolve(docs,page))
]
const failures: string[] = []
let pageCount = 0
let linkCount = 0
let fenceCount = 0
const currentRelease = currentPublishedCompilerTag(JSON.parse(readFileSync(resolve(root, 'data/compiler-latest-release.json'), 'utf8')) as unknown)
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8')) as { repository: string; release: string }
const supportedFences = new Set(['scarp', 'rust', 'sh', 'bash', 'shell', 'powershell', 'text', 'json', 'ts', 'js', 'yaml'])

function error(file: string, problem: string): void {
  failures.push(`${relative(root, file)}: ${problem}`)
}

function withoutCode(text: string, file: string): string {
  let inside = false
  let marker = ''
  return text.split(/\r?\n/).map(line => {
    const fence = /^\s*(`{3,}|~{3,})(\w+)?/.exec(line)
    if (fence) {
      const current = fence[1][0]
      if (!inside) {
        inside = true
        marker = current
        const lang = fence[2] || ''
        fenceCount++
        if (lang && !supportedFences.has(lang)) error(file, `unsupported code-fence language: ${lang}`)
      } else if (marker === current) {
        inside = false
      }
      return ''
    }
    return inside ? '' : line
  }).join('\n')
}

function anchors(path: string): Set<string> {
  const raw = readFileSync(path, 'utf8')
  const headings = withoutCode(raw, path).split('\n').filter(line => /^#{1,6}\s+/.test(line))
  const set = new Set<string>()
  const counts = new Map<string, number>()
  for (const line of headings) {
    const base = documentationHeadingSlug(line.replace(/^#{1,6}\s+/, '').replace(/\s+#+$/, ''))
    const used = counts.get(base) || 0
    counts.set(base, used + 1)
    set.add(used ? `${base}-${used}` : base)
  }
  return set
}

function resolveTarget(file: string, link: string): void {
  let url
  try { url = decodeURI(link.trim()) } catch { error(file, `malformed link URI: ${link}`); return }
  if (/^(https?:\/\/|mailto:|tel:|#)/.test(url)) {
    if (url.startsWith('#')) {
      const anchor = url.slice(1)
      if (anchor && !anchors(file).has(anchor)) error(file, `missing same-page anchor: #${anchor}`)
    }
    return
  }
  if (/^(javascript:|data:|file:)/i.test(url)) { error(file, `prohibited URL scheme: ${link}`); return }
  const [pathPart, fragment = ''] = url.split('#')
  const clean = pathPart.split('?')[0]
  let dest
  if (!clean) dest = file
  else if (clean.startsWith('/')) dest = resolve(docs, `.${clean}`)
  else dest = resolve(dirname(file), clean)
  const attempts = [dest, `${dest}.md`, resolve(dest, 'index.md')]
  if (clean.endsWith('.html')) attempts.push(`${dest.slice(0, -5)}.md`)
  if (clean.endsWith('/')) attempts.push(resolve(dest, 'index.md'))
  const found = attempts.find(p => existsSync(p) && statSync(p).isFile())
  if (!found) { error(file, `missing local link: ${link}`); return }
  if (fragment && extname(found) === '.md' && !anchors(found).has(fragment)) {
    error(file, `missing target anchor: ${link}`)
  }
}

for (const path of checked) {
  const raw = readFileSync(path, 'utf8')
  if (path.startsWith(docs)) {
    pageCount++
    if (!/^(?:---[\s\S]*?---\s*)?#\s+\S/m.test(raw) && !/^layout:\s*home/m.test(raw)) {
      error(path, 'missing top-level title or home layout')
    }
    if (/\b(?:TODO|TBD|lorem ipsum)\b/i.test(raw)) error(path, 'unresolved placeholder marker')
  }
  const prose = withoutCode(raw, path)
  const matches = prose.matchAll(/\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)
  for (const match of matches) {
    const link = match[1].replace(/^<|>$/g, '')
    linkCount++
    resolveTarget(path, link)
  }
}

// The independent engine generates every navigation entry from this source
// inventory. Validate the actual source-route contract rather than VitePress.
for (const page of pages) {
  const pair = pairedRoutes(page)
  if (pair.route !== sourceRoute(page) || pair.canonical !== ORIGIN + pair.route ||
      !pair.route.startsWith(BASE)) {
    error(resolve(docs,page), 'generated canonical route differs from source routing')
  }
  const english = page.startsWith('hi/') ? page.slice(3) : page
  const hindi = 'hi/' + english
  if (!pages.includes(english) || !pages.includes(hindi)) {
    error(resolve(docs,page), 'missing bilingual source-route counterpart')
  }
}

// Home frontmatter links are rendered as clickable actions and features, so
// validate both locales, not just the English homepage.
for (const home of ['index.md', 'hi/index.md']) {
  const file = resolve(docs, home)
  const markdown = readFileSync(file, 'utf8')
  for (const match of markdown.matchAll(/^\s+link:\s*(\S+)\s*$/gm)) {
    linkCount++
    resolveTarget(file, match[1])
  }
}
if (BASE !== '/scarp-docs/' || ORIGIN !== 'https://scarp-lang.github.io') {
  error(sourceContract, 'Scarp-owned GitHub Pages origin or base-path changed')
}
if (baseline.repository !== 'scarp-lang/scarp' || baseline.release !== 'v0.0.5-alpha.1') {
  error(sourceContract, 'historical compiler baseline is missing or unexpected')
}
for (const page of ['reference/status.md','hi/reference/status.md']) {
  if (!readFileSync(resolve(docs,page),'utf8').includes(baseline.release)) {
    error(resolve(docs,page), 'historical reference baseline is missing')
  }
}
for (const page of ['releases/'+currentRelease+'.md','hi/releases/'+currentRelease+'.md']) {
  if (!pages.includes(page)) error(resolve(docs,page),'current published compiler guide missing')
}
for (const page of [
  'guide/installation.md','hi/guide/installation.md',
  'guide/installation-alpha6.md','hi/guide/installation-alpha6.md'
]) {
  const file=resolve(docs,page)
  const introduction=readFileSync(file,'utf8').split(/^~~~[a-z]+/m,1)[0]
  const localePrefix=page.startsWith('hi/')?'/hi':''
  if (!introduction.includes(']('+localePrefix+'/releases/'+currentRelease+')')) {
    error(file,'historical installer must link the latest published compiler release '+currentRelease)
  }
}
// The downloadable offline archive is built by the same TypeScript renderer
// as production. Its two reader-facing guides must link to the *current*
// release, without attributing generated output to the retired VitePress runtime.
for(const [page,locale] of [
  ['guide/offline-docs.md',''],
  ['hi/guide/offline-docs.md','/hi']
] as const){
  const file=resolve(docs,page)
  const body=readFileSync(file,'utf8')
  if(!body.includes(']('+locale+'/releases/'+currentRelease+')')) {
    error(file,'offline guide latest compiler link drift: '+currentRelease)
  }
  if(body.includes('VitePress')) {
    error(file,'offline guide describes retired website generation framework')
  }
}
if (pageCount !== pages.length || pageCount < 142) {
  error(sourceContract, `expected complete bilingual docs inventory (at least 142), got ${pageCount}`)
}

if (failures.length) {
  console.error(`FAILED documentation checks (${failures.length}):\n${failures.map(x => `  - ${x}`).join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${pageCount} documentation pages, ${linkCount} internal/external link references, ${fenceCount} code fences, navigation and base-path checks`)
}
