export interface CompilerReleaseRecord {
  tag_name?: string
  prerelease?: boolean
  draft?: boolean
  published_at?: string | null
  assets?: unknown
}
export interface CompilerReleaseEvidence {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  status: string
  assets: string[]
  assetDigests: Record<string, string>
}
const tagPattern = /^v\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/
const gitSha = /^[0-9a-f]{40}$/
const digestPattern = /^sha256:[0-9a-f]{64}$/
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function latestPublishedCompiler(releases: unknown): CompilerReleaseRecord | null {
  if (!Array.isArray(releases)) return null
  const eligible = releases.filter((item): item is CompilerReleaseRecord =>
    isObject(item) &&
    typeof item.tag_name === 'string' &&
    tagPattern.test(item.tag_name) &&
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
  if (!gitSha.test(expectedCommit)) errors.push('Invalid pinned compiler SHA')
  if (!resolvedTagCommit || !gitSha.test(resolvedTagCommit)) {
    errors.push('Compiler tag did not resolve to a valid source commit')
  } else if (resolvedTagCommit !== expectedCommit) {
    errors.push('Tagged compiler source SHA differs from docs manifest')
  }
  return errors
}

/** Parse the immutable public download contract without trusting remote filenames. */
export function requiredCompilerAssets(tag: string): string[] {
  if (!tagPattern.test(tag)) throw new Error('Invalid compiler release tag')
  const base = 'scarp-' + tag.slice(1) + '-'
  const archives = [
    base + 'x86_64-pc-windows-msvc.zip',
    base + 'x86_64-unknown-linux-gnu.tar.gz',
    base + 'aarch64-apple-darwin.tar.gz'
  ]
  return [...archives, ...archives.map(name => name + '.sha256'), 'SHA256SUMS']
}

export function validateCompilerEvidence(manifest: unknown): string[] {
  if (!isObject(manifest)) return ['Compiler evidence manifest is not an object']
  const errors: string[] = []
  if (manifest.compilerRepository !== 'scarp-lang/scarp') errors.push('Unexpected compiler repository')
  const tag = manifest.compilerRef
  if (typeof tag !== 'string' || !tagPattern.test(tag)) return [...errors, 'Invalid compiler release tag']
  const prerelease = tag.includes('-')
  if (manifest.status !== (prerelease ? 'published-prerelease' : 'published-stable')) errors.push('Compiler publication status does not match tag')
  if (typeof manifest.compilerCommit !== 'string' || !gitSha.test(manifest.compilerCommit)) errors.push('Invalid pinned compiler SHA')
  if (typeof manifest.releasedAt !== 'string' || !Number.isFinite(Date.parse(manifest.releasedAt))) errors.push('Invalid publication timestamp')
  const required = requiredCompilerAssets(tag)
  const assets = manifest.assets
  if (!Array.isArray(assets) || assets.some(name => typeof name !== 'string') ||
      new Set(assets).size !== assets.length || assets.length !== required.length ||
      required.some(name => !assets.includes(name))) errors.push('Manifest asset inventory differs from required archives and checksum files')
  const digests = manifest.assetDigests
  if (!isObject(digests)) return [...errors, 'Missing pinned asset digests']
  if (Object.keys(digests).length !== required.length) errors.push('Manifest digest inventory has unexpected entries')
  for (const name of required) {
    const digest = digests[name]
    if (typeof digest !== 'string' || !digestPattern.test(digest)) errors.push('Invalid or missing pinned digest: ' + name)
  }
  return errors
}

/** Compare the published API metadata, not a moving download redirect or source branch. */
export function compareCompilerEvidence(releases: unknown, manifest: unknown, resolvedCommit?: string): string[] {
  const errors = validateCompilerEvidence(manifest)
  if (errors.length) return errors
  const pinned = manifest as CompilerReleaseEvidence
  errors.push(...comparePublishedCompiler(releases, pinned.compilerRef, pinned.compilerCommit, resolvedCommit))
  const latest = latestPublishedCompiler(releases)
  // If the latest release moved, do not misreport its assets as corruption of the old release.
  if (!latest || latest.tag_name !== pinned.compilerRef) return errors
  if (latest.prerelease !== (pinned.status === 'published-prerelease')) errors.push('Remote prerelease status differs from manifest')
  if (Date.parse(latest.published_at!) !== Date.parse(pinned.releasedAt)) errors.push('Remote publication timestamp differs from manifest')
  if (!Array.isArray(latest.assets)) return [...errors, 'Remote release asset inventory unavailable']
  const remote = latest.assets.filter(isObject)
  for (const name of requiredCompilerAssets(pinned.compilerRef)) {
    const matches = remote.filter(asset => asset.name === name)
    if (matches.length !== 1) {
      errors.push('Expected exactly one published asset: ' + name)
      continue
    }
    const asset = matches[0]
    if (asset.state !== 'uploaded' || typeof asset.size !== 'number' ||
        !Number.isSafeInteger(asset.size) || asset.size <= 0) errors.push('Asset is not a nonempty completed upload: ' + name)
    if (asset.digest !== pinned.assetDigests[name]) errors.push('Published asset digest differs from pinned digest: ' + name)
  }
  return errors
}

/** Resolve lightweight or nested annotated tags; reject cycles and non-commit targets. */
export async function resolveCompilerTag(
  initial: unknown, fetchAnnotatedTag: (sha: string) => Promise<unknown>
): Promise<string> {
  const visited = new Set<string>()
  let current = initial
  for (let depth = 0; depth <= 8; depth++) {
    if (!isObject(current) || typeof current.sha !== 'string' || !gitSha.test(current.sha)) {
      throw new Error('Invalid compiler tag target')
    }
    if (current.type === 'commit') return current.sha
    if (current.type !== 'tag') throw new Error('Compiler tag target is not a commit or annotated tag')
    if (visited.has(current.sha)) throw new Error('Cyclic annotated compiler tag')
    if (depth === 8) break
    visited.add(current.sha)
    const annotated = await fetchAnnotatedTag(current.sha)
    if (!isObject(annotated)) throw new Error('Invalid annotated compiler tag response')
    current = annotated.object
  }
  throw new Error('Annotated compiler tag exceeds maximum resolution depth')
}
