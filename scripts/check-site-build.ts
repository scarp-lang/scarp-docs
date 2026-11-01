import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pairedUrls } from '../docs/.vitepress/site-meta.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const docs = join(root, 'docs')
const dist = join(docs, '.vitepress', 'dist')

function markdown(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.')) return []
    const path = join(dir, entry.name)
    return entry.isDirectory() ? markdown(path) : entry.name.endsWith('.md') ? [relative(docs, path).split(sep).join('/')] : []
  })
}

function headTags(html: string, tag: string): Array<Record<string, string>> {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? ''
  const matches = [...head.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\/?>`, 'gi'))]
  return matches.map(match => Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(item => [item[1], item[2]])))
}

assert.ok(existsSync(dist), `Missing site build at ${dist}: run npm run docs:build first`)
const pages = markdown(docs)
let checked = 0
const failures: string[] = []
for (const path of pages) {
  const rendered = join(dist, path.replace(/\.md$/, '.html'))
  if (!existsSync(rendered)) { failures.push(`${path}: no generated HTML at ${relative(root, rendered)}`); continue }
  const html = readFileSync(rendered, 'utf8')
  const expected = pairedUrls(path)
  const links = headTags(html, 'link')
  const canonical = links.filter(attrs => attrs.rel === 'canonical')
  if (canonical.length !== 1 || canonical[0].href !== expected.canonical) {
    failures.push(`${path}: missing/incorrect canonical tag`)
  }
  for (const [locale, url] of [['en', expected.english], ['hi', expected.hindi], ['x-default', expected.english]]) {
    if (!links.some(attrs => attrs.rel === 'alternate' && attrs.hreflang === locale && attrs.href === url)) {
      failures.push(`${path}: missing hreflang ${locale} -> ${url}`)
    }
  }
  const meta = headTags(html, 'meta')
  if (!meta.some(attrs => attrs.property === 'og:url' && attrs.content === expected.canonical)) failures.push(`${path}: missing og:url`)
  const lang = path.startsWith('hi/') ? 'hi-IN' : 'en-US'
  if (!new RegExp(`<html\\b[^>]*\\blang="${lang}"`, 'i').test(html)) failures.push(`${path}: expected <html lang="${lang}">`)
  checked++
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} static site errors:\n${failures.map(e => `  - ${e}`).join('\n')}`)
  process.exitCode = 1
} else console.log(`PASS: ${checked} built HTML pages, canonical/hreflang, Open Graph and document language`)
