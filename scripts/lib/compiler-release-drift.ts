export interface CompilerReleaseRecord {
  tag_name?: string
  prerelease?: boolean
  draft?: boolean
  published_at?: string | null
}
export function latestPublishedCompiler(releases: unknown): CompilerReleaseRecord | null {
  if (!Array.isArray(releases)) return null
  const eligible = releases.filter((item): item is CompilerReleaseRecord =>
    typeof item === 'object' && item !== null &&
    typeof item.tag_name === 'string' &&
    /^v\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/.test(item.tag_name) &&
    item.draft === false &&
    typeof item.published_at === 'string' &&
    !Number.isNaN(Date.parse(item.published_at))
  )
  eligible.sort((a,b) => Date.parse(b.published_at!) - Date.parse(a.published_at!))
  return eligible[0] ?? null
}
export function comparePublishedCompiler(
  releases: unknown,
  manifestTag: string,
  expectedCommit: string,
  resolvedTagCommit?: string
): string[] {
  const errors: string[] = []
  const latest = latestPublishedCompiler(releases)
  if (!latest) return ['No parseable published Scarp compiler release found']
  if (latest.tag_name !== manifestTag) {
    errors.push('Compiler has published ' + latest.tag_name +
      ', but docs are pinned to ' + manifestTag + '. Update and re-test bilingual docs.')
  }
  if (!/^[0-9a-f]{40}$/.test(expectedCommit)) errors.push('Invalid pinned compiler SHA')
  if (resolvedTagCommit && resolvedTagCommit !== expectedCommit) {
    errors.push('Tagged compiler source SHA differs from docs manifest')
  }
  return errors
}
