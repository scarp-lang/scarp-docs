import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkSnippetPolicy } from './lib/snippet-policy.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docs = resolve(root, 'docs')
const failures: string[] = []
let total = 0
let pages = 0

function walk(dir: string): void {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.')) continue
    const path = join(dir, item.name)
    if (item.isDirectory()) { walk(path); continue }
    if (!item.isFile() || !item.name.endsWith('.md')) continue
    pages++
    const source = readFileSync(path, 'utf8')
    try {
      for (const issue of checkSnippetPolicy(source)) {
        failures.push(`${relative(root, path)}:${issue.line}: ${issue.message}`)
        total++
      }
    } catch (error) {
      failures.push(`${relative(root, path)}: invalid fenced source: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
walk(docs)

if (failures.length) {
  console.error(`FAIL: ${failures.length} documentation snippet-policy errors\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${pages} Markdown pages checked for unsupported runnable Scarp/CLI syntax`)
}
