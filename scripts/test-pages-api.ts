import assert from 'node:assert/strict'
import {
  deploymentLabels, getSuccessfulRunCount, readSuccessfulRunCount,
  SUCCESSFUL_RUNS_ENDPOINT, type Fetcher
} from '../docs/.vitepress/theme/lib/pages-api.ts'

assert.equal(readSuccessfulRunCount({ total_count: 5 }), 5)
assert.equal(readSuccessfulRunCount({ total_count: 0 }), 0)
for (const value of [null, undefined, 12, {}, { total_count: -1 }, { total_count: NaN }, { total_count: 1.5 }, { total_count: '5' }, { total_count: Number.MAX_SAFE_INTEGER + 1 }]) {
  assert.throws(() => readSuccessfulRunCount(value), TypeError)
}
assert.equal(deploymentLabels('hi-IN').retry, 'दोबारा प्रयास करें')
assert.equal(deploymentLabels('en-US').retry, 'Try again')
assert.equal(deploymentLabels('HI-in').history, deploymentLabels('hi-IN').history)

let requested = ''
const success: Fetcher = async (url, init) => {
  requested = url
  assert.equal((init.headers as Record<string, string>).Accept, 'application/vnd.github+json')
  assert.ok(init.signal instanceof AbortSignal)
  return new Response(JSON.stringify({ total_count: 8 }), { status: 200 })
}
assert.equal(await getSuccessfulRunCount(success), 8)
assert.equal(requested, SUCCESSFUL_RUNS_ENDPOINT)

const fail: Fetcher = async () => new Response('Rate limited', { status: 403 })
await assert.rejects(() => getSuccessfulRunCount(fail), /HTTP 403/)
await assert.rejects(() => getSuccessfulRunCount(async () => new Response('{}', { status: 200 })), /Missing GitHub workflow count/)
await assert.rejects(() => getSuccessfulRunCount(success, 0), RangeError)

const abortable: Fetcher = (_url, init) => new Promise((_resolve, reject) => {
  init.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), { once: true })
})
await assert.rejects(() => getSuccessfulRunCount(abortable, 5), /Timed out/)

console.log('PASS: typed deployment counter, localization, API errors, validation and timeout')
