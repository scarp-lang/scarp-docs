import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

// Checks the *repository paths* linked as compiler evidence, not remote HTTP
// reachability. Use only a checkout of the exact pinned release commit.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8')) as { repository: string; release: string }
const checkouts = new Map([
  [baseline.release, process.argv[2] ? resolve(process.argv[2]) : ''],
  ['v0.0.5-alpha.2', process.argv[3] ? resolve(process.argv[3]) : ''],
  ['v0.0.5-alpha.3', process.argv[4] ? resolve(process.argv[4]) : ''],
  ['v0.0.5-alpha.4', process.argv[5] ? resolve(process.argv[5]) : ''],
  ['v0.0.5-alpha.5', process.argv[6] ? resolve(process.argv[6]) : ''],
  ['v0.0.6-alpha.1', process.argv[7] ? resolve(process.argv[7]) : '']
])
for (const [version, checkout] of checkouts) {
  if (!checkout || !existsSync(resolve(checkout, 'Cargo.toml'))) {
    console.error('Usage: npm run check:evidence -- <alpha1-checkout> <alpha2-checkout> <alpha3-checkout> <alpha4-checkout> <alpha5-checkout> <alpha6-checkout>')
    console.error(`Missing published release checkout: ${version}`)
    process.exit(2)
  }
}
const docs = resolve(root, 'docs')
const files = [resolve(root, 'README.md'), resolve(root, 'CONTRIBUTING.md')]
function walk(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (entry.name.endsWith('.md')) files.push(path)
  }
}
walk(docs)
const failures: string[] = []
const prefix = `https://github.com/${baseline.repository}/`
let checked = 0
for (const page of files) {
  const content = readFileSync(page, 'utf8')
  for (const [url] of content.matchAll(/https:\/\/github\.com\/scarp-lang\/scarp\/(?:blob|tree)\/v[0-9]+\.[0-9]+\.[^/\s)]+\/[^\s)<>"']+/g)) {
    let parsed: URL
    try { parsed = new URL(url) } catch { failures.push(`${relative(root, page)}: malformed evidence URL ${url}`); continue }
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'scarp-lang' || parts[1] !== 'scarp') continue
    const [kind, tag, ...segments] = parts.slice(2)
    const checkout = checkouts.get(tag)
    if (!checkout) { failures.push(`${relative(root, page)}: unsupported compiler evidence tag ${tag}`); continue }
    let rel: string
    try { rel = decodeURIComponent(segments.join('/')) } catch { failures.push(`${relative(root, page)}: invalid encoded evidence path`); continue }
    const target = resolve(checkout, rel)
    const normalized = relative(checkout, target)
    if (!rel || normalized.startsWith('..') || isAbsolute(normalized) || !existsSync(target)) {
      failures.push(`${relative(root, page)}: missing compiler evidence: ${url}`)
      continue
    }
    const isDirectory = statSync(target).isDirectory()
    if ((kind === 'blob' && isDirectory) || (kind === 'tree' && !isDirectory)) {
      failures.push(`${relative(root, page)}: incorrect blob/tree link: ${url}`)
      continue
    }
    checked++
  }
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} compiler evidence errors\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(`PASS: ${checked} compiler-release evidence paths exist in the pinned checkout`)
