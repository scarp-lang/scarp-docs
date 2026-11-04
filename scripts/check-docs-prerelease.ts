import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateDocsPrerelease, type DocsPrereleaseMetadata } from './lib/docs-prerelease.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const metadata = JSON.parse(read('data/docs-prerelease.json')) as DocsPrereleaseMetadata
const project = JSON.parse(read('package.json')) as { version: string }
const errors = validateDocsPrerelease(metadata, project.version, read('RELEASE_NOTES.md'))

if (errors.length) {
  for (const error of errors) console.error('FAIL docs prerelease: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: documentation-only prerelease tag, private package version, published compiler boundary and release notes')
}
