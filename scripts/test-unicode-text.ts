import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPublishedUnicodeLesson } from './lib/unicode-text-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const en = read('docs/language/unicode-text.md')
const hi = read('docs/hi/language/unicode-text.md')
const fixtures = {
  alpha2: {
    name: 'unicode-text-queries',
    source: read('conformance/alpha2/unicode_text.srp'),
    expected: read('conformance/alpha2/unicode_text.stdout')
  },
  alpha3: {
    name: 'unicode-text-construction',
    source: read('conformance/alpha3/text_construction.srp'),
    expected: read('conformance/alpha3/text_construction.stdout')
  }
}
const check = (english: string, hindi: string): string[] =>
  verifyPublishedUnicodeLesson(english, hindi, fixtures)
assert.deepEqual(check(en, hi), [])
assert.ok(check(en.replace('<!-- scarp-unicode-release: v0.0.5-alpha.2+v0.0.5-alpha.3 -->', ''), hi)
  .some(x => x.includes('release-scope markers')))
assert.ok(check(en, hi.replace('text_codepoint(text, 5)', 'text_codepoint(text, 4)'))
  .some(x => x.includes('source and command fences changed')))
assert.ok(check(en.replace('6 10 127757', '6 9 127757'), hi)
  .some(x => x.includes('alpha.2') && x.includes('stdout')))
assert.ok(check(en, hi.replace('🌍🌍🌍', '🌍🌍'))
  .some(x => x.includes('alpha.3') && x.includes('stdout')))
assert.ok(check(en.replaceAll('7715c28df09c7703b39e14fddb963275b25df476', 'unreleased'), hi)
  .some(x => x.includes('published identity')))
assert.ok(check(en.replace('scarp check unicode_text.srp', 'scarp verify unicode_text.srp'), hi)
  .some(x => x.includes('alpha.2 command')))
assert.ok(check(en, hi.replace('scarp exec text_construction.srp', 'scarp build text_construction.srp'))
  .some(x => x.includes('alpha.3 command')))
assert.ok(check(en.replace('## 3.', '## 99.'), hi)
  .some(x => x.includes('release sections missing')))
console.log('PASS: Unicode tutorial drift tests detect cross-release CLI, source, output, marker and translation errors')
