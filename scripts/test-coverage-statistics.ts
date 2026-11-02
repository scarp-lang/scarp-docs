import assert from 'node:assert/strict'
import { checkCountClaims, type CountClaim } from './lib/coverage-statistics.ts'

const rules: CountClaim[] = [
  { label: 'source files', pattern: /all (\d+) pinned files/, expected: 24 },
  { label: 'case count', pattern: /runs (\d+) cases/, expected: 11 }
]

assert.deepEqual(checkCountClaims('all 24 pinned files; runs 11 cases', rules), [])
assert.match(checkCountClaims('all 23 pinned files; runs 11 cases', rules)[0] ?? '', /source files: expected 24, found 23/)
assert.match(checkCountClaims('all 24 pinned files; runs 10 cases', rules)[0] ?? '', /case count: expected 11, found 10/)
assert.match(checkCountClaims('runs 11 cases', rules)[0] ?? '', /source files: expected one count claim, found 0/)
assert.match(checkCountClaims('all 24 pinned files; all 24 pinned files; runs 11 cases', rules)[0] ?? '', /found 2/)
assert.deepEqual(checkCountClaims('सभी 11 स्रोत-आउटपुट जोड़ों', [
  { label: 'Hindi', pattern: /सभी (\d+) स्रोत-आउटपुट जोड़ों/, expected: 11 }
]), [])
assert.match(checkCountClaims('all ?? pinned files', [rules[0]])[0] ?? '', /found 0/)

console.log('PASS: manifest-backed coverage claims reject stale, duplicate and absent English/Hindi counts')
