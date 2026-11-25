import { requiredCompilerAssets, type CompilerReleaseEvidence } from './compiler-release-drift.ts'

/**
 * A historical page may legitimately contain earlier tags. Check only the
 * specifically designated release announcement, not every version string.
 * The label and destination must agree; an unrelated current link cannot
 * compensate for a stale announcement.
 */
export function announcementIssues(source: string, marker: RegExp, expected: string): string[] {
  const lines = source.split(/\r?\n/).filter(line => marker.test(line))
  if (lines.length !== 1) return ['Expected exactly one release announcement; found ' + lines.length]
  return lines[0].includes(expected) ? [] : ['Release announcement must contain ' + expected]
}

type Contract = { path: string; marker: RegExp; expected: string }
const releaseLink = (tag: string, prefix: string, label = tag): string =>
  '[' + label + '](' + prefix + '/releases/' + tag + ')'

export function announcementContracts(tag: string): Contract[] {
  const upstream = '[' + tag + '](https://github.com/scarp-lang/scarp/releases/tag/' + tag + ')'
  const contracts: Contract[] = [
    { path:'README.md', marker:/^\*\*Latest published compiler:\*\*/, expected:upstream }
  ]
  for (const hi of [false,true]) {
    const prefix = hi ? '/hi' : ''
    const root = 'docs' + prefix + '/'
    const link = releaseLink(tag,prefix)
    const add = (path: string, marker: RegExp, expected = link): void => {
      contracts.push({path:root+path,marker,expected})
    }
    add('index.md', hi ? /^नवीनतम सत्यापित प्रकाशित compiler / : /^The latest verified published compiler is /)
    add('guide/current.md', hi ? /^नए उपयोगकर्ताओं को / : /^The recommended compiler for new users is /)
    add('guide/install-latest.md', hi ? /नवीनतम सत्यापित प्रकाशित compiler \*\*/ : /the latest verified published compiler is \*\*/, releaseLink(tag,prefix,'Scarp '+tag))
    add('reference/current.md', hi ? /^\*\*प्रकाशित वर्तमान snapshot:/ : /^\*\*Current published snapshot:/)
    add('guide/introduction.md', hi ? /^\*\*नवीनतम प्रकाशित compiler / : /^\*\*Latest published compiler:/, upstream)
    add('reference/status.md', hi ? /^\*\*नवीनतम प्रकाशित compiler:/ : /^\*\*Latest published compiler:/)
    add('guide/learning-path.md', hi ? /^\*\*नवीनतम compiler:/ : /^\*\*Current compiler:/)
    add('reference/compatibility.md', hi ? /^\|.*\*\*नवीनतम \(/ : /^\|.*\*\*Latest \(/)
    add('tooling/command-finder.md', hi ? /नवीनतम प्रकाशित release \[/ : /latest published release is \[/)
    add('guide/offline-docs.md', hi ? /नवीनतम अलग से सत्यापित प्रकाशित compiler / : /latest separately documented published compiler is /)
    add('guide/quickstart-alpha4.md', hi ? /^नए उपयोगकर्ताओं के लिए / : /^New installs should use /,
      releaseLink(tag,prefix,hi ? 'प्रकाशित '+tag+' release और checksum' : 'published '+tag+' release and checksums'))
    add('guide/search-and-navigation.md', hi ? /नवीनतम प्रकाशित compiler डाउनलोड/ : /latest published compiler downloads/,
      releaseLink(tag,prefix,hi ? 'नवीनतम प्रकाशित compiler डाउनलोड' : 'latest published compiler downloads'))
  }
  return contracts
}

export function releaseAnnouncementIssues(read: (path: string) => string, tag: string): string[] {
  return announcementContracts(tag).flatMap(({path,marker,expected}) =>
    announcementIssues(read(path),marker,expected).map(issue=>path+': '+issue))
}

/** Require one correct checksum row per actual archive; duplicates are errors. */
export function archiveDigestIssues(markdown: string, evidence: CompilerReleaseEvidence): string[] {
  const rows = markdown.split(/\r?\n/).filter(line=>line.startsWith('|'))
  const errors: string[] = []
  for (const name of requiredCompilerAssets(evidence.compilerRef).slice(0,3)) {
    const quoted = '`' + name + '`'
    const matching = rows.filter(row=>row.includes(quoted))
    const digest = evidence.assetDigests[name]?.slice(7)
    if (matching.length !== 1) errors.push(name+': expected one archive checksum row')
    else if (!matching[0].includes(quoted+' | '+ '`'+digest+'` |')) errors.push(name+': checksum differs from release evidence')
  }
  return errors
}
