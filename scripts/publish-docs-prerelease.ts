import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { validateDocsPrerelease, type DocsPrereleaseMetadata } from './lib/docs-prerelease.ts'

/**
 * Runs only after a passing Documentation CI on main.
 * Corrects the original release's tag IN PLACE, retaining its release ID
 * and publication history. Never publishes a stable or compiler release.
 */
const repository = process.env.GITHUB_REPOSITORY
const testedSha = process.env.TESTED_SHA
if (repository !== 'scarp-lang/scarp-docs' || !/^[a-f0-9]{40}$/.test(testedSha ?? '')) {
  throw new Error('Refusing to publish outside the official repo or without a tested commit SHA')
}

const metadata = JSON.parse(readFileSync('data/docs-prerelease.json', 'utf8')) as DocsPrereleaseMetadata
const packageVersion = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version
const notes = readFileSync(metadata.notesFile, 'utf8')
const errors = validateDocsPrerelease(metadata, packageVersion, notes)
if (errors.length) throw new Error('Release metadata invalid: ' + errors.join('; '))
if (metadata.tag !== 'docs-v0.1.0-alpha.1') throw new Error('Expected first prerelease tag')
const legacyTag = 'docs-v0.2.0-alpha.1'
const legacySha = 'bc972ac94090723351ea98324b45842511015a90'
const expectedLegacyId = 433734856

const gh = (...args: string[]): string => execFileSync('gh', args, { encoding: 'utf8' }).trim()
function readApi<T>(path: string): T | null {
  try {
    return JSON.parse(gh('api', path)) as T
  } catch (error) {
    const stderr = String((error as { stderr?: unknown }).stderr ?? '')
    if (/\b404\b|Not Found/i.test(stderr)) return null
    throw error
  }
}
type Release = { id: number; immutable: boolean; prerelease: boolean; draft: boolean; tag_name: string }
type Ref = { object: { sha: string } }
const release = (tag: string): Release | null => readApi<Release>(`repos/${repository}/releases/tags/${tag}`)
const ref = (tag: string): Ref | null => readApi<Ref>(`repos/${repository}/git/ref/tags/${tag}`)
function validPublished(releaseRecord: Release | null): void {
  if (!releaseRecord || releaseRecord.draft || !releaseRecord.prerelease ||
      releaseRecord.tag_name !== metadata.tag) {
    throw new Error('Expected published documentation prerelease with corrected tag')
  }
}

if (release(metadata.tag)) {
  validPublished(release(metadata.tag))
  console.log('Corrected documentation prerelease already published; no duplicate action')
} else {
  const old = release(legacyTag)
  if (old) {
    if (old.id !== expectedLegacyId || old.immutable !== false ||
        old.prerelease !== true || old.draft !== false ||
        ref(legacyTag)?.object.sha !== legacySha) {
      throw new Error('Original release does not match verified first prerelease; manual review required')
    }

    const existingTag = ref(metadata.tag)
    if (existingTag && existingTag.object.sha !== testedSha) {
      throw new Error('Corrected tag already points at a different commit')
    }
    if (!existingTag) {
      gh('api', '-X', 'POST', `repos/${repository}/git/refs`,
        '-f', `ref=refs/tags/${metadata.tag}`, '-f', `sha=${testedSha}`)
    }
    gh('release', 'edit', legacyTag, '--repo', repository!,
      '--tag', metadata.tag, '--verify-tag', '--title', metadata.title,
      '--notes-file', metadata.notesFile, '--prerelease')
    const moved = release(metadata.tag)
    validPublished(moved)
    if (moved?.id !== expectedLegacyId) {
      throw new Error('Release retag did not preserve the original release record')
    }
    if (ref(legacyTag)?.object.sha === legacySha) {
      gh('api', '-X', 'DELETE', `repos/${repository}/git/refs/tags/${legacyTag}`)
    } else if (ref(legacyTag)) {
      throw new Error('Incorrect legacy tag changed unexpectedly; refusing to delete')
    }
  } else {
    gh('release', 'create', metadata.tag, '--repo', repository!,
      '--title', metadata.title, '--notes-file', metadata.notesFile,
      '--target', testedSha!, '--prerelease')
  }
  validPublished(release(metadata.tag))
  if (ref(metadata.tag)?.object.sha !== testedSha) {
    throw new Error('New prerelease tag does not match the passing main commit')
  }
  console.log('Verified release:', gh('release', 'view', metadata.tag, '--repo', repository!,
    '--json', 'tagName,isPrerelease,url'))
}
