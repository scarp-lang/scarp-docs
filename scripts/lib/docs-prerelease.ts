export interface DocsPrereleaseMetadata {
  tag: string
  version: string
  title: string
  compilerTag: string
  notesFile: string
}

/** Release metadata is untrusted until checked: a docs release must be prerelease-only. */
export function validateDocsPrerelease(
  raw: unknown, packageVersion: string, releaseNotes: string
): string[] {
  const errors: string[] = []
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return ['release metadata must be an object']
  }
  const metadata = raw as Partial<DocsPrereleaseMetadata>
  for (const key of ['tag', 'version', 'title', 'compilerTag', 'notesFile'] as const) {
    if (typeof metadata[key] !== 'string' || metadata[key].trim() === '') {
      errors.push('missing nonempty release metadata: ' + key)
    }
  }
  const version = metadata.version ?? ''
  if (!/^0\.\d+\.\d+-(alpha|beta|rc)\.\d+$/.test(version)) {
    errors.push('docs version must be a pre-1.0 semantic prerelease, not a stable version')
  }
  if (metadata.tag !== 'docs-v' + version) {
    errors.push('documentation tag must be docs-v + exact package version')
  }
  if (packageVersion !== version) {
    errors.push('private documentation package and release metadata versions disagree')
  }
  if (metadata.compilerTag !== 'v0.0.5-alpha.4') {
    errors.push('this snapshot must be pinned to the published alpha.4 compiler')
  }
  if (!metadata.title?.startsWith('Scarp Docs v' + version) ||
      !metadata.title.toLowerCase().includes('prerelease')) {
    errors.push('release title must clearly identify a docs prerelease')
  }
  if (metadata.notesFile !== 'RELEASE_NOTES.md') {
    errors.push('release notes must use the audited root Markdown file')
  }
  if (!releaseNotes.includes('Scarp Docs v' + version) ||
      !releaseNotes.includes(metadata.compilerTag ?? '') ||
      !releaseNotes.includes('not a stable release') ||
      !releaseNotes.includes('does not publish a new Scarp compiler')) {
    errors.push('release notes must distinguish the docs prerelease from the compiler')
  }
  return errors
}
