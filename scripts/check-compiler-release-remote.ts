import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  compareCompilerEvidence, resolveCompilerTag, validateCompilerEvidence,
  type CompilerReleaseEvidence
} from './lib/compiler-release-drift.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const raw: unknown = JSON.parse(readFileSync(resolve(root, 'data/compiler-latest-release.json'), 'utf8'))
const invalid = validateCompilerEvidence(raw)
if (invalid.length) throw new Error(invalid.join('\n'))
const manifest = raw as CompilerReleaseEvidence
const base = 'https://api.github.com/repos/scarp-lang/scarp'
const token = process.env.GITHUB_TOKEN
const headers: Record<string,string> = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'scarp-docs-compiler-release-drift-check'
}
if (token) headers.Authorization = 'Bearer ' + token
async function api(path: string): Promise<unknown> {
  const response = await fetch(base + path, { headers, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error('GitHub API HTTP ' + response.status + ': ' + path)
  return await response.json()
}
const releases = await api('/releases?per_page=100')
const ref = await api('/git/ref/tags/' + encodeURIComponent(manifest.compilerRef))
const target = typeof ref === 'object' && ref !== null && 'object' in ref ? ref.object : null
const commit = await resolveCompilerTag(target, sha => api('/git/tags/' + sha))
const failures = compareCompilerEvidence(releases, manifest, commit)
if (failures.length) {
  for (const issue of failures) console.error('::error::' + issue)
  process.exitCode = 1
} else {
  console.log('PASS: latest published compiler ' + manifest.compilerRef +
    ', exact source ' + commit + ', and all ' + manifest.assets.length + ' published asset digests match')
}
