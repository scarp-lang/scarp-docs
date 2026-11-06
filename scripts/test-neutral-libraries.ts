import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sourceCommands from './lib/published-command-finder.ts'
import * as legacyCommands from '../docs/.vitepress/theme/lib/command-finder.ts'
import * as sourceSeo from './lib/site-meta.ts'
import * as legacySeo from '../docs/.vitepress/site-meta.ts'
import * as sourcePages from './lib/pages-api.ts'
import * as legacyPages from '../docs/.vitepress/theme/lib/pages-api.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')

assert.strictEqual(sourceCommands.commandAdvice,legacyCommands.commandAdvice,
  'Old CLI module must be only a compatibility forwarder to canonical release data')
assert.strictEqual(sourceCommands.RELEASES,legacyCommands.RELEASES)
assert.strictEqual(sourceCommands.TASKS,legacyCommands.TASKS)
assert.strictEqual(sourceCommands.FINDER_TEXT,legacyCommands.FINDER_TEXT)
assert.strictEqual(sourceSeo.pairedUrls,legacySeo.pairedUrls)
assert.strictEqual(sourceSeo.urlForPage,legacySeo.urlForPage)
assert.strictEqual(sourcePages.getSuccessfulRunCount,legacyPages.getSuccessfulRunCount)
assert.strictEqual(sourcePages.readSuccessfulRunCount,legacyPages.readSuccessfulRunCount)
assert.equal(sourceCommands.LATEST_RELEASE,'v0.0.6-alpha.1')
assert.equal(sourceSeo.DOCS_BASE,'/scarp-docs/')
for (const [path,canonical] of [
  ['docs/.vitepress/theme/lib/command-finder.ts','published-command-finder.ts'],
  ['docs/.vitepress/theme/lib/pages-api.ts','pages-api.ts'],
  ['docs/.vitepress/site-meta.ts','site-meta.ts']
]) {
  const source=read(path)
  assert.match(source,/^export \* from /,'Legacy path must only forward, not maintain duplicate data')
  assert.ok(source.includes(canonical),'Old forwarder points to wrong canonical path')
  assert.ok(!source.includes('v0.0.6-alpha.1'),
    'Legacy wrappers may not fork compiler-release values')
}
console.log('PASS: canonical Scarp release, SEO and Pages data are shared by source and legacy paths without divergent copies')
