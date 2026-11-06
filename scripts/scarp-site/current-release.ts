import assert from 'node:assert/strict'
import { LATEST_RELEASE, RELEASES } from '../lib/command-finder.ts'
import { BASE, type Locale } from './routes.ts'

/**
 * The current-release manifest must refer to the exact compiler source commit
 * in the offline CLI capability table. A published tag, never compiler main,
 * determines which downloads are offered in the site navigation.
 */
export function currentPublishedCompilerTag(metadata: unknown): string {
  assert.ok(metadata && typeof metadata === 'object' && !Array.isArray(metadata),
    'Current compiler release manifest must be a JSON object')
  const data = metadata as Record<string, unknown>
  const published = RELEASES.at(-1)
  assert.ok(published, 'There must be a published release')
  assert.equal(published.tag, LATEST_RELEASE, 'Latest CLI version must match final published tag')
  assert.equal(data.compilerRepository, 'scarp-lang/scarp', 'Untrusted compiler repository')
  assert.equal(data.compilerRef, published.tag, 'Latest compiler manifest and CLI table disagree')
  assert.equal(data.compilerCommit, published.source, 'Latest compiler release source SHA drift')
  assert.equal(data.status, 'published-prerelease', 'Do not link unpublished development builds')
  assert.match(published.tag, /^v\d+\.\d+\.\d+-(?:alpha|beta|rc)\.\d+$/,
    'Current documentation must link a valid compiler prerelease tag')
  assert.equal(typeof data.releasedAt, 'string')
  assert.ok(!Number.isNaN(Date.parse(data.releasedAt as string)),
    'Current compiler publication time is not a date')
  const archives = [
    'x86_64-pc-windows-msvc.zip',
    'x86_64-unknown-linux-gnu.tar.gz',
    'aarch64-apple-darwin.tar.gz'
  ].map(platform => 'scarp-' + published.tag.slice(1) + '-' + platform)
  assert.ok(Array.isArray(data.assets), 'Current compiler assets are missing')
  const assets = data.assets as unknown[]
  assert.equal(new Set(assets).size, assets.length, 'Current compiler asset inventory has duplicates')
  for (const asset of [...archives, 'SHA256SUMS']) {
    assert.ok(assets.includes(asset), 'Missing official release asset: ' + asset)
  }
  return published.tag
}

/** Paths point to *our verified bilingual release guides*, never moving main. */
export function currentCompilerReleaseRoute(tag: string, locale: Locale): string {
  assert.equal(tag, LATEST_RELEASE, 'Invalid or outdated compiler navigation tag')
  assert.ok(locale === 'en' || locale === 'hi', 'Unsupported documentation language')
  return BASE + (locale === 'hi' ? 'hi/' : '') + 'releases/' + tag
}
