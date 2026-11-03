import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateBitwiseLesson } from './lib/bitwise-lesson-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f: string): string => readFileSync(resolve(root, f), 'utf8')
const en = read('docs/language/bitwise-operators-alpha2.md')
const hi = read('docs/hi/language/bitwise-operators-alpha2.md')
const cases = [
  { name: 'integer-bit-operations', source: read('conformance/alpha2/bit_fields.srp'), expected: read('conformance/alpha2/bit_fields.stdout') },
  { name: 'shift-count-out-of-range', source: read('conformance/alpha2-bit-errors/shift.srp'), expected: read('conformance/alpha2-bit-errors/shift.stderr') },
  { name: 'invalid-binary-radix', source: read('conformance/alpha2-bit-errors/radix.srp'), expected: read('conformance/alpha2-bit-errors/radix.stderr') }
]
const check = (english: string, hindi: string, evidence = cases): string[] =>
  validateBitwiseLesson(english, hindi, evidence)
assert.deepEqual(check(en, hi), [])
assert.ok(check(en.replace('<!-- scarp-bitwise-release: v0.0.5-alpha.2 -->', ''), hi)
  .some(x => x.includes('release marker')))
assert.ok(check(en, hi.replace('flags |= 0b0011;', 'flags |= 0b0001;'))
  .some(x => x.includes('English/Hindi bitwise')))
assert.ok(check(en.replace('3\n10\n-9223372036854775808', '2\n10\n-9223372036854775808'), hi)
  .some(x => x.includes('expected stdout')))
assert.ok(check(en, hi.replace('error[E0046]', 'error[E0045]'))
  .some(x => x.includes('shift-count-out-of-range')))
assert.ok(check(en.replaceAll('e4db8e191cd7ea623123cae7348450ca6c95b170', 'wrong-release'), hi)
  .some(x => x.includes('release marker')))
assert.ok(check(en.replace('scarp run bit_fields.srp', 'scarp verify bit_fields.srp'), hi)
  .some(x => x.includes('CLI sequence')))
assert.ok(check(en, hi.replace('scarp run radix.srp', 'scarp build radix.srp'))
  .some(x => x.includes('unshipped CLI')))
assert.ok(check(en, hi, cases.slice(1))
  .some(x => x.includes('case inventory')))
console.log('PASS: bitwise tutorial version, source, stderr, commands and translation regression tests')
