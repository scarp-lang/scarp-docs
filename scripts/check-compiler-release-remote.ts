import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { comparePublishedCompiler, type CompilerReleaseRecord } from './lib/compiler-release-drift.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/alpha5-manifest.json'), 'utf8')) as {
  compilerRef: string
  compilerCommit: string
}
const base = 'https://api.github.com/repos/scarp-lang/scarp'
const token = process.env.GITHUB_TOKEN
const headers: Record<string,string> = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'scarp-docs-compiler-release-drift-check'
}
if (token) headers.Authorization = 'Bearer ' + token
async function api<T>(path: string): Promise<T> {
  const response = await fetch(base + path, { headers })
  if (!response.ok) throw new Error('GitHub API HTTP ' + response.status + ': ' + path)
  return await response.json() as T
}
const releases = await api<CompilerReleaseRecord[]>('/releases?per_page=30')
type GitRef = { object: { type: 'tag'|'commit'; sha: string } }
type AnnotatedTag = { object: { type: 'commit'; sha: string } }
const ref = await api<GitRef>('/git/ref/tags/' + manifest.compilerRef)
const commit = ref.object.type === 'tag'
  ? (await api<AnnotatedTag>('/git/tags/' + ref.object.sha)).object.sha
  : ref.object.sha
const failures = comparePublishedCompiler(releases, manifest.compilerRef, manifest.compilerCommit, commit)
if (failures.length) {
  for (const issue of failures) console.error('::error::' + issue)
  process.exitCode = 1
} else {
  console.log('PASS: docs target the latest published Scarp compiler ' + manifest.compilerRef +
    ', matching pinned source ' + commit)
}
