import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Installation, type Alpha6InstallPages } from './lib/alpha6-installation.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const pages: Alpha6InstallPages = {
  english: read('docs/guide/installation-alpha6.md'),
  hindi: read('docs/hi/guide/installation-alpha6.md'),
  config: read('docs/.vitepress/config.mts'),
  homeEnglish: read('docs/index.md'),
  homeHindi: read('docs/hi/index.md'),
  releaseEnglish: read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHindi: read('docs/hi/releases/v0.0.6-alpha.1.md')
}
const errors = validateAlpha6Installation(pages)
if (errors.length) {
  for (const error of errors) console.error('FAIL alpha.6 installation: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: release-pinned alpha.6 Windows/Linux/macOS installer, checksum guard, source build and locale navigation')
}
