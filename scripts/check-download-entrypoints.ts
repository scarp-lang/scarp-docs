import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const manifest = JSON.parse(read('data/compiler-latest-release.json')) as { compilerRef: string; status: string }
const hub = 'https://scarp-lang.github.io/downloads/'
assert.equal(manifest.status, 'published-prerelease')

for (const locale of ['', 'hi/']) {
  const guide = read('docs/' + locale + 'guide/install-latest.md')
  const home = read('docs/' + locale + 'index.md')
  const intro = read('docs/' + locale + 'guide/introduction.md')
  const status = read('docs/' + locale + 'reference/status.md')
  assert.ok(guide.includes(manifest.compilerRef), locale + 'current guide has stale compiler version')
  for (const platform of ['windows','linux','macos']) {
    assert.ok(guide.includes(hub + platform + '/latest'),
      locale + 'current guide missing permanent ' + platform + ' download')
  }
  for (const page of [guide, home, intro, status]) {
    assert.ok(page.includes(hub), locale + 'entrypoint is missing the official download hub')
  }
  assert.ok(home.includes('guide/install-latest'), locale + 'home is missing current installer')
  assert.ok(!home.includes('v0.0.5-alpha.1'), locale + 'home still advertises retired compiler baseline')
}
const config = read('docs/.vitepress/config.mts')
assert.ok(config.includes("link: '/guide/install-latest'"))
assert.ok(config.includes("link: '/hi/guide/install-latest'"))
assert.ok(config.includes(hub))
assert.ok(!config.includes('v0.0.5-alpha.1'), 'navigation still advertises the retired compiler baseline')
const renderer = read('scripts/scarp-site/build.ts')
assert.ok(renderer.includes(hub), 'Scarp-owned HTML renderer missing downloads link')
assert.ok(renderer.includes("BASE+'guide/install-latest'"), 'Scarp-owned HTML renderer missing current install route')
const readme = read('README.md')
assert.ok(readme.includes('**Latest published compiler:** [' + manifest.compilerRef + ']'))
assert.ok(readme.includes(hub))
assert.ok(readme.includes('docs/guide/install-latest.md'))
assert.ok(readme.includes('docs/hi/guide/install-latest.md'))
console.log('PASS: latest release and official downloads linked from bilingual active entrypoints')
