import { createHash } from 'node:crypto'
import { extractCodeFences } from './code-fences.ts'

export interface Alpha6Fixture {
  path: string
  compilerPath: string
  gitBlobSha: string
}
export interface Alpha6Manifest {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  status: string
  schemaVersion: number
  assets: string[]
  fixtures: Record<string, Alpha6Fixture>
}
export interface Alpha6Pages {
  releaseEn: string
  releaseHi: string
  cliEn: string
  cliHi: string
  rmsEn: string
  rmsHi: string
  statusEn: string
  statusHi: string
  homeEn: string
  homeHi: string
  config: string
  readme: string
}
export const ALPHA6_REF = 'v0.0.6-alpha.1' as const
export const ALPHA6_SHA = 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8' as const

const requiredFixtures = [
  'root_mean_square.srp',
  'root_mean_square.stdout',
  'symbol_navigation.srp',
  'symbol_navigation.stdout',
  'symbol_navigation.symbols.json',
  'symbol_navigation.references.json',
  'modules/navigation_values.srp'
] as const

/** Match the GitHub Git-blob identifier, not a regular content SHA-1. */
export function gitBlobSha(text: string): string {
  const data = Buffer.from(text, 'utf8')
  return createHash('sha1').update('blob ' + data.byteLength + '\0').update(data).digest('hex')
}
function hasFence(markdown: string, language: string, expected: string): boolean {
  return extractCodeFences(markdown).some(f =>
    f.language === language && f.code.trimEnd() === expected.trimEnd())
}
function hasAll(markdown: string, required: string[], label: string, errors: string[]): void {
  for (const value of required) if (!markdown.includes(value)) errors.push(label + ': missing ' + value)
}
export function validateAlpha6Docs(
  pages: Alpha6Pages,
  manifest: Alpha6Manifest,
  fixtures: Record<string, string>
): string[] {
  const errors: string[] = []
  const releaseUrl = 'https://github.com/scarp-lang/scarp/releases/tag/' + ALPHA6_REF
  const blobBase = 'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/examples/'
  const downloadBase = 'https://github.com/scarp-lang/scarp/releases/download/' + ALPHA6_REF + '/'
  const archives = [
    'scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip',
    'scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz',
    'scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz'
  ]
  if (manifest.compilerRepository !== 'scarp-lang/scarp' ||
      manifest.compilerRef !== ALPHA6_REF ||
      manifest.compilerCommit !== ALPHA6_SHA ||
      manifest.releasedAt !== '2026-11-05T11:39:49Z' ||
      manifest.status !== 'published-prerelease' ||
      manifest.schemaVersion !== 1 ||
      JSON.stringify(manifest.assets) !== JSON.stringify([...archives, 'SHA256SUMS'])) {
    errors.push('alpha.6 release identity, source, asset inventory or publication state drift')
  }
  const listed = Object.keys(manifest.fixtures).sort()
  if (JSON.stringify(listed) !== JSON.stringify([...requiredFixtures].sort())) {
    errors.push('alpha.6 pinned fixture inventory differs from the seven tagged files')
  }
  for (const name of requiredFixtures) {
    const f = manifest.fixtures[name]
    const source = fixtures[name]
    if (!f || f.path !== 'conformance/alpha6/' + name ||
        f.compilerPath !== 'examples/' + name ||
        !/^[a-f0-9]{40}$/.test(f.gitBlobSha) ||
        typeof source !== 'string' || gitBlobSha(source) !== f.gitBlobSha) {
      errors.push('unverified compiler Git blob: ' + name)
    }
  }
  if (fixtures['symbol_navigation.stdout'] !== '30\n') errors.push('symbol-navigation stdout differs')
  if (fixtures['root_mean_square.stdout'] !== 'true true\n2.0\ntrue\ntrue\n0.0\n') errors.push('RMS stdout differs')
  for (const [name,kind] of [
    ['symbol_navigation.symbols.json','scarp.symbols'],
    ['symbol_navigation.references.json','scarp.references']
  ]) {
    try {
      const obj = JSON.parse(fixtures[name] ?? '') as Record<string, unknown>
      if (obj.schema_version !== 1 || obj.kind !== kind ||
          obj.span_encoding !== 'utf-8-bytes' ||
          obj.column_encoding !== 'unicode-scalar' || obj.position_base !== 1 ||
          !Array.isArray(obj.files) || !Array.isArray(obj.symbols) ||
          (kind === 'scarp.references' && !Array.isArray(obj.references))) {
        errors.push('invalid tagged symbol JSON fixture: ' + name)
      }
    } catch {
      errors.push('malformed tagged symbol JSON fixture: ' + name)
    }
  }
  for (const [locale,prefix] of [['En',''],['Hi','/hi']] as const) {
    const release = pages['release'+locale]
    const cli = pages['cli'+locale]
    const rms = pages['rms'+locale]
    const status = pages['status'+locale]
    const home = pages['home'+locale]
    for (const [label,page] of [['release',release],['CLI',cli],['RMS',rms]] as const) {
      hasAll(page, ['<!-- scarp-cli-release: '+ALPHA6_REF+' -->',
        '<!-- scarp-alpha6-release: '+ALPHA6_SHA+' -->', ALPHA6_SHA, releaseUrl],
        locale+' '+label, errors)
    }
    hasAll(release, [
      blobBase+'symbol_navigation.srp', blobBase+'root_mean_square.srp',
      ']('+prefix+'/tooling/cli-alpha6)', ']('+prefix+'/language/rms-alpha6)',
      downloadBase+'SHA256SUMS', ...archives.flatMap(a=>[
        downloadBase+a, downloadBase+a+'.sha256'
      ])
    ],locale+' release',errors)
    hasAll(cli, ['scarp inspect symbols --json examples/symbol_navigation.srp',
      'scarp inspect references --json examples/symbol_navigation.srp',
      'scarp.symbols','scarp.references','E0050',
      ']('+prefix+'/releases/v0.0.6-alpha.1)'],locale+' CLI',errors)
    hasAll(rms, ['E0034','4n','E0049','rms',
      ']('+prefix+'/releases/v0.0.6-alpha.1)'],locale+' RMS',errors)
    hasAll(status,[ALPHA6_REF, ALPHA6_SHA,
      ']('+prefix+'/releases/v0.0.6-alpha.1)'],locale+' status',errors)
    hasAll(home,[ALPHA6_REF,'/releases/v0.0.6-alpha.1'].map(s=>
      s.startsWith('/') ? prefix+s : s),locale+' home',errors)
    if (!hasFence(release,'scarp',fixtures['symbol_navigation.srp'] ?? '') ||
        !hasFence(release,'text',fixtures['symbol_navigation.stdout'] ?? '') ||
        !hasFence(release,'scarp',fixtures['root_mean_square.srp'] ?? '') ||
        !hasFence(release,'text',fixtures['root_mean_square.stdout'] ?? '')) {
      errors.push(locale+' release: full tagged source/output fences differ')
    }
    if (!hasFence(rms,'scarp',fixtures['root_mean_square.srp'] ?? '') ||
        !hasFence(rms,'text',fixtures['root_mean_square.stdout'] ?? '')) {
      errors.push(locale+' RMS: full tagged source/output fences differ')
    }
    if (locale === 'Hi' && [release,cli,rms].some(page =>
        (page.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 100)) {
      errors.push('Hindi: a new alpha.6 guide lacks substantial translation')
    }
  }
  hasAll(pages.config,[
    "{ text: 'CLI (alpha.6)', link: '/tooling/cli-alpha6' }",
    "{ text: 'CLI (alpha.6)', link: '/hi/tooling/cli-alpha6' }",
    '/language/rms-alpha6','/hi/language/rms-alpha6',
    '/releases/v0.0.6-alpha.1','/hi/releases/v0.0.6-alpha.1'
  ],'navigation',errors)
  hasAll(pages.readme,[ALPHA6_REF,ALPHA6_SHA,
    'docs/releases/v0.0.6-alpha.1.md','docs/hi/releases/v0.0.6-alpha.1.md'],
    'README',errors)
  return errors
}
