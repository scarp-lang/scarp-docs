import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePublishedCliReference } from './lib/cli-reference.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const en = read('docs/tooling/cli.md')
const hi = read('docs/hi/tooling/cli.md')
const stdout = read('conformance/alpha3/text_construction.stdout')
const check = (english: string, hindi: string, expected = stdout): string[] =>
  validatePublishedCliReference(english, hindi, expected)

assert.deepEqual(check(en, hi), [])
assert.ok(check(en.replace('<!-- scarp-cli-release: v0.0.5-alpha.3 -->', ''), hi)
  .some(problem => problem.includes('release marker')))
assert.ok(check(en.replaceAll('7715c28df09c7703b39e14fddb963275b25df476', 'unreleased'), hi)
  .some(problem => problem.includes('exact compiler commit')))
assert.ok(check(en, hi.replace('scarp verify text_construction.srp', 'scarp verify missing.srp'))
  .some(problem => problem.includes('missing published command')))
assert.ok(check(en.replace('Hello, 🌍', 'Hello, world'), hi)
  .some(problem => problem.includes('code fences differ')))
assert.ok(check(en, hi.replace('](/hi/tooling/cli-alpha1)', '](broken-link)'))
  .some(problem => problem.includes('historical alpha.1 CLI')))
assert.ok(check(en, hi, 'wrong expected output')
  .some(problem => problem.includes('expected stdout')))
assert.ok(check(en.replace('scarp guide\n', 'scarp build test.srp\n'), hi)
  .some(problem => problem.includes('unshipped executable command')))

console.log('PASS: alpha.3 CLI reference checker catches stale release, missing command, wrong output, and Hindi drift')
