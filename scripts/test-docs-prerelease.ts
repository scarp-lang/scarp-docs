import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateDocsPrerelease, type DocsPrereleaseMetadata } from './lib/docs-prerelease.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const metadata = JSON.parse(read('data/docs-prerelease.json')) as DocsPrereleaseMetadata
const project = JSON.parse(read('package.json')) as { version: string }
const notes = read('RELEASE_NOTES.md')
const check = (change: Partial<DocsPrereleaseMetadata>, text = notes, version = project.version) =>
  validateDocsPrerelease({ ...metadata, ...change }, version, text)

assert.deepEqual(check({}), [])
assert.ok(check({ version: '0.1.0' }).length, 'stable versions are rejected')
assert.ok(check({ tag: 'v0.1.0-alpha.1' }).length, 'docs prefix cannot be omitted')
assert.ok(check({ tag: 'docs-v0.1.0-alpha.2' }).length, 'metadata tag must equal version')
assert.ok(check({ compilerTag: 'v0.0.5-alpha.5' }).length, 'compiler release must not silently advance')
assert.ok(check({ notesFile: '../RELEASE_NOTES.md' }).length, 'unreviewed release note paths are disallowed')
assert.ok(check({ title: 'Scarp stable release' }).length, 'release must be labeled prerelease')
assert.ok(check({}, notes.replace('not a stable release', 'stable now')).length, 'notes must warn about stability')
assert.ok(check({}, notes, '0.2.0-alpha.1').length, 'package version must agree')
assert.ok(validateDocsPrerelease(null, project.version, notes).length)
console.log('PASS: corrected first docs prerelease metadata and nine negative regression checks')
