import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const docs = join(root, 'docs')
const hi = join(docs, 'hi')
const config = readFileSync(join(docs, '.vitepress/config.mts'), 'utf8')
const failures: string[] = []
// Use a common root for recursion; do not change it for nested directories.
function allMarkdown(base: string, current = base): string[] {
  return readdirSync(current,{withFileTypes:true}).flatMap(item => {
    const full=join(current,item.name)
    return item.isDirectory() ? item.name.startsWith('.') ? [] : allMarkdown(base,full)
      : item.name.endsWith('.md') ? [relative(base,full)] : []
  })
}
const enPaths = allMarkdown(docs).filter(path => !path.startsWith('hi/'))
const hiPaths = new Set(allMarkdown(hi))
const devanagari = /[\u0900-\u097F]/g
for (const path of enPaths) {
  if (!hiPaths.has(path)) {failures.push(`Hindi page missing for ${path}`);continue}
  const original=readFileSync(join(docs,path),'utf8')
  const translated=readFileSync(join(hi,path),'utf8')
  if ((translated.match(devanagari)||[]).length < 50) failures.push(`${path}: translation must contain substantial Hindi text`)
  if (!path.endsWith('index.md') && !translated.startsWith('# ')) failures.push(`${path}: missing localized heading`)
  try {
    const upstreamExamples = extractCodeFences(original)
    const localizedExamples = extractCodeFences(translated)
    const missing = firstMissingCodeBlock(upstreamExamples, localizedExamples)
    if (missing !== -1) {
      const example = upstreamExamples[missing]
      failures.push(`${path}: code fence #${missing + 1} from line ${example.line} is missing, changed, or reordered (${example.code.slice(0, 32)})`)
    }
  } catch (cause) {
    failures.push(`${path}: invalid fenced Markdown: ${cause instanceof Error ? cause.message : String(cause)}`)
  }
  if (translated.includes('https://github.com/scarp-lang/scarp-lang')) failures.push(`${path}: wrong compiler repository`)
}
for (const path of hiPaths) if (!enPaths.includes(path)) failures.push(`English page missing for ${path}`)
for (const required of ["hi: {", "label: 'हिन्दी'", "lang: 'hi-IN'", "link: '/hi/'", "link: '/hi/language/overview'"]) {
  if (!config.includes(required)) failures.push(`VitePress missing locale setting: ${required}`)
}
for (const line of config.matchAll(/link:\s*'\/(hi\/[^']*)'/g)) {
  let target=join(docs,line[1]);
  if (!existsSync(target)&&!existsSync(`${target}.md`)&&!existsSync(join(target,'index.md'))) failures.push(`Hindi nav target absent: /${line[1]}`)
}
const english=new Set(enPaths)
if (english.size < 29) failures.push('Expected at least 29 English source pages')
if (failures.length) {
  for (const problem of failures) console.error('FAIL:',problem)
  process.exitCode=1
} else console.log(`PASS: ${enPaths.length} English/Hindi page pairs, retained code blocks and locale navigation`)
