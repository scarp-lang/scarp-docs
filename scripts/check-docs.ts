import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docs = resolve(root, 'docs')
const config = resolve(docs, '.vitepress/config.mts')
const checked = [resolve(root, 'README.md'), resolve(root, 'CONTRIBUTING.md')]

function walk(folder: string): string[] {
  return readdirSync(folder).flatMap(name => {
    if (name.startsWith('.') || name === 'node_modules') return []
    const path = resolve(folder, name)
    return statSync(path).isDirectory() ? walk(path) : extname(path) === '.md' ? [path] : []
  })
}

checked.push(...walk(docs))
const failures: string[] = []
let pageCount = 0
let linkCount = 0
let fenceCount = 0
const configured = readFileSync(config, 'utf8')
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8')) as { repository: string; release: string }
const supportedFences = new Set(['scarp', 'rust', 'sh', 'bash', 'shell', 'text', 'json', 'ts', 'js', 'yaml'])

function error(file: string, problem: string): void {
  failures.push(`${relative(root, file)}: ${problem}`)
}

function withoutCode(text: string): string {
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
        if (lang && !supportedFences.has(lang)) error(config, `unsupported code-fence language: ${lang}`)
      } else if (marker === current) {
        inside = false
      }
      return ''
    }
    return inside ? '' : line
  }).join('\n')
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

function anchors(path: string): Set<string> {
  const raw = readFileSync(path, 'utf8')
  const headings = withoutCode(raw).split('\n').filter(line => /^#{1,6}\s+/.test(line))
  const set = new Set<string>()
  const counts = new Map<string, number>()
  for (const line of headings) {
    const base = slugify(line.replace(/^#{1,6}\s+/, '').replace(/\s+#+$/, ''))
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
  const prose = withoutCode(raw)
  const matches = prose.matchAll(/\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)
  for (const match of matches) {
    const link = match[1].replace(/^<|>$/g, '')
    linkCount++
    resolveTarget(path, link)
  }
}

// Verify all sidebar/nav destinations and home-page action links; Markdown checks alone miss them.
for (const match of configured.matchAll(/\blink:\s*['"]([^'"]+)['"]/g)) {
  linkCount++
  resolveTarget(config, match[1])
}
const home = readFileSync(resolve(docs, 'index.md'), 'utf8')
for (const match of home.matchAll(/^\s+link:\s*(\S+)\s*$/gm)) {
  linkCount++
  resolveTarget(resolve(docs, 'index.md'), match[1])
}
if (!configured.includes("base: '/scarp-docs/'")) error(config, 'GitHub Pages base must be /scarp-docs/')
if (!configured.includes("provider: 'local'")) error(config, 'local search is required')
if (!configured.includes('scarpGrammar')) error(config, 'Scarp highlighting grammar must be registered')
if (baseline.repository !== 'scarp-lang/scarp' || !/^v0\.0\.5-alpha\.1$/.test(baseline.release)) error(config, 'compiler baseline is missing or unexpected')
if (!configured.includes(baseline.release)) error(config, 'site version badge does not match the compiler baseline')
if (!readFileSync(resolve(docs, 'reference/status.md'), 'utf8').includes(baseline.release)) error(config, 'feature status does not match the compiler baseline')
if (pageCount < 15) error(config, `expected at least 15 real documentation pages, found ${pageCount}`)

if (failures.length) {
  console.error(`FAILED documentation checks (${failures.length}):\n${failures.map(x => `  - ${x}`).join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${pageCount} documentation pages, ${linkCount} internal/external link references, ${fenceCount} code fences, navigation and base-path checks`)
}
