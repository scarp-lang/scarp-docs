type Baseline = { repository: string; release: string; releaseSourceCommit: string }
type ReleaseCase = { name: string; source: string }
type ReleaseManifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: ReleaseCase[] }

export interface StatusSources {
  baseline: Baseline
  alpha2: ReleaseManifest
  alpha3: ReleaseManifest
}

function sourceIndex(markdown: string): { tag: string; source: string; target: string }[] {
  const records: { tag: string; source: string; target: string }[] = []
  const pattern = /^\|\s*\[\x60([^\x60]+)\x60\]\((https:\/\/github\.com\/scarp-lang\/scarp\/blob\/(v0\.0\.5-alpha\.[23])\/examples\/([^)]+))\)\s*\|[^\n]*$/gm
  for (const match of markdown.matchAll(pattern)) {
    records.push({ tag: match[3], source: match[1], target: match[4] })
  }
  return records
}

/** The compiler-tagged source manifests are the evidence—not release prose. */
export function validateReleaseStatusPages(english: string, hindi: string, sources: StatusSources): string[] {
  const problems: string[] = []
  const { baseline, alpha2, alpha3 } = sources
  const releases = [alpha2, alpha3]
  if (baseline.repository !== 'scarp-lang/scarp' || baseline.release !== 'v0.0.5-alpha.1' ||
      baseline.releaseSourceCommit !== 'afe8b5380c9d6c4774162e51c6c9bc8b90901671') {
    problems.push('unexpected historical compiler reference baseline')
  }
  for (const release of releases) {
    if (release.compilerRepository !== 'scarp-lang/scarp' ||
        !/^v0\.0\.5-alpha\.[23]$/.test(release.compilerRef) ||
        !/^[a-f0-9]{40}$/.test(release.compilerCommit) ||
        release.cases.length === 0) {
      problems.push('invalid published release manifest')
    }
  }

  for (const [language, page, prefix] of [
    ['English', english, ''],
    ['Hindi', hindi, 'hi/']
  ] as const) {
    if (!page.includes('<!-- scarp-release-status: v0.0.5-alpha.4 -->')) {
      problems.push(language + ': current-release marker is missing')
    }
    if (!page.includes('v0.0.5-alpha.4') ||
        !page.includes('79141329176f5dce51457e90a6652902f6432135') ||
        !page.includes('](/' + prefix + 'guide/quickstart-alpha4)') ||
        !page.includes('](/' + prefix + 'releases/v0.0.5-alpha.4)')) {
      problems.push(language + ': latest alpha.4 published project evidence or links missing')
    }
    if (!page.includes('<!-- scarp-main-reference-baseline: v0.0.5-alpha.1 -->')) {
      problems.push(language + ': historical-reference marker is missing')
    }
    const evidence: Array<{ version: string; sha: string; count: number }> = [
      { version: baseline.release, sha: baseline.releaseSourceCommit, count: 11 },
      ...releases.map(release => ({
        version: release.compilerRef, sha: release.compilerCommit, count: release.cases.length
      }))
    ]
    for (const { version, sha, count } of evidence) {
      if (!page.includes(version) || !page.includes(sha)) {
        problems.push(language + ': release identifier / source commit missing for ' + version)
      }
      if (!page.includes('**' + count + '**')) {
        problems.push(language + ': missing exact evidence count ' + count + ' for ' + version)
      }
    }
    for (const url of [
      '/' + prefix + 'tooling/cli',
      '/' + prefix + 'tooling/cli-alpha1',
      '/' + prefix + 'reference/upgrade-readiness',
      '/' + prefix + 'releases/v0.0.5-alpha.2',
      '/' + prefix + 'releases/v0.0.5-alpha.3'
    ]) {
      if (!page.includes('](' + url + ')')) problems.push(language + ': missing related reference ' + url)
    }
    const actual = sourceIndex(page)
    const expected = releases.flatMap(release => release.cases.map(item =>
      ({ tag: release.compilerRef, source: item.source, target: item.source })))
    const counts = new Map<string, number>()
    for (const row of actual) {
      const id = row.tag + ':' + row.source
      counts.set(id, (counts.get(id) ?? 0) + 1)
      if (row.source !== row.target || !expected.some(record =>
        record.tag === row.tag && record.source === row.source)) {
        problems.push(language + ': undocumented or mismatched tagged example ' + id)
      }
    }
    for (const row of expected) {
      const id = row.tag + ':' + row.source
      if (counts.get(id) !== 1) problems.push(language + ': expected exactly one tagged row for ' + id)
    }
    if (actual.length !== expected.length) {
      problems.push(language + ': tagged example inventory differs from release manifests')
    }
  }
  return problems
}
