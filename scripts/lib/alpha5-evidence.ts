import { extractCodeFences } from './code-fences.ts'

export interface Alpha5Fixture {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  releasedAt: string
  source: string
  stdout: string
  projectInspection: boolean
  cBackend: { availability: string; cli: boolean; api: string; unsupportedDiagnostic: string }
  platformArchives: string[]
}

export interface Alpha5Pages {
  releaseEn: string
  releaseHi: string
  cliEn: string
  cliHi: string
  installEn: string
  installHi: string
  c11En: string
  c11Hi: string
  statusEn: string
  statusHi: string
  config: string
}

const tag = 'v0.0.5-alpha.5'
const commit = '2eeed0aa52ccb59523307841ad8ffbd83f8911a8'
const published = 'https://github.com/scarp-lang/scarp/releases/tag/' + tag
const programUrl = 'https://github.com/scarp-lang/scarp/blob/' + tag + '/examples/native_scalar_repeat.srp'
const expectedArchives = [
  'scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip',
  'scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz',
  'scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz'
]

function blocks(page: string): Array<{ language: string; code: string }> {
  return extractCodeFences(page).map(f => ({ language: f.language, code: f.code }))
}

/** Release-specific evidence contract. Historical alpha.1-alpha.4 pages remain pinned. */
export function validateAlpha5Docs(p: Alpha5Pages, meta: Alpha5Fixture, source: string, stdout: string): string[] {
  const errors: string[] = []
  if (meta.compilerRepository !== 'scarp-lang/scarp' || meta.compilerRef !== tag ||
      meta.compilerCommit !== commit || meta.releasedAt !== '2026-11-04T11:59:57Z' ||
      meta.source !== 'examples/native_scalar_repeat.srp' ||
      meta.stdout !== 'examples/native_scalar_repeat.stdout' || !meta.projectInspection ||
      meta.cBackend.availability !== 'rust-embedding-only' || meta.cBackend.cli !== false ||
      meta.cBackend.api !== 'scarp::c_backend::emit_c' ||
      meta.cBackend.unsupportedDiagnostic !== 'E0049' ||
      JSON.stringify(meta.platformArchives) !== JSON.stringify(expectedArchives)) {
    errors.push('published alpha.5 source, tag, archive or API identity drift')
  }
  if (!source.trim().includes('repeat 5 as index') ||
      !source.includes('repeat 4 as row') ||
      !source.includes('if step == 1 { continue; }') ||
      !source.includes('if step == 3 { break; }') ||
      stdout !== 'even-index sum\n6\ntriangle cells\n6\n0\n2\n') {
    errors.push('published scalar repeat fixture changed without source verification')
  }
  for (const [area, a, b] of [
    ['release', p.releaseEn, p.releaseHi],
    ['CLI', p.cliEn, p.cliHi],
    ['installation', p.installEn, p.installHi],
    ['C11 backend', p.c11En, p.c11Hi]
  ] as const) {
    if (JSON.stringify(blocks(a)) !== JSON.stringify(blocks(b))) {
      errors.push(area + ': English/Hindi runnable source or output drift')
    }
  }
  for (const [locale, prefix, release, cli, install, c11, status] of [
    ['English', '', p.releaseEn, p.cliEn, p.installEn, p.c11En, p.statusEn],
    ['Hindi', '/hi', p.releaseHi, p.cliHi, p.installHi, p.c11Hi, p.statusHi]
  ] as const) {
    for (const [area, page, markers] of [
      ['release', release, ['<!-- scarp-alpha5-release: ' + commit + ' -->', programUrl, published,
        '](' + prefix + '/tooling/cli-alpha5)', '](' + prefix + '/reference/c11-backend-alpha5)']],
      ['CLI', cli, ['<!-- scarp-cli-release: ' + tag + ' -->',
        '<!-- scarp-alpha5-cli-reference: ' + commit + ' -->', published,
        'scarp inspect modules --json hello-scarp', 'scarp inspect modules --json hello-scarp/src/main.srp',
        'scarp modules --json hello-scarp', '](' + prefix + '/tooling/cli-alpha4)']],
      ['installer', install, ['<!-- scarp-install-release: ' + tag + ' -->', commit, published,
        'Get-FileHash', 'sha256sum --check', 'shasum -a 256 -c',
        '](' + prefix + '/tooling/cli-alpha5)']],
      ['C11', c11, ['<!-- scarp-c-backend-release: ' + tag + ' -->',
        '<!-- scarp-c-backend-source: ' + commit + ' -->', published,
        'src/c_backend.rs', 'tests/c_backend.rs', 'E0049', '256', '4096',
        '](' + prefix + '/tooling/cli-alpha5)']],
      ['status', status, ['<!-- scarp-release-status: ' + tag + ' -->', commit,
        '](' + prefix + '/releases/v0.0.5-alpha.5)',
        '](' + prefix + '/tooling/cli-alpha5)',
        '](' + prefix + '/reference/c11-backend-alpha5)',
        '<!-- scarp-main-reference-baseline: v0.0.5-alpha.1 -->']]
    ] as const) {
      for (const marker of markers) if (!page.includes(marker)) errors.push(locale + ' ' + area + ': missing ' + marker)
    }

    for (const archive of expectedArchives) {
      const url = 'https://github.com/scarp-lang/scarp/releases/download/' + tag + '/'
      if (!install.includes('[`' + archive + '`](' + url + archive + ')') ||
          !install.includes('[`' + archive + '.sha256`](' + url + archive + '.sha256)')) {
        errors.push(locale + ': published archive/checksum pairing incorrect for ' + archive)
      }
    }

    if (!blocks(release).some(f => f.language === 'scarp' && f.code === source.trim()) ||
        !blocks(release).some(f => f.language === 'text' && f.code === stdout.trim()) ||
        !blocks(cli).some(f => f.language === 'text' && f.code === stdout.trim())) {
      errors.push(locale + ': published complete source or exact stdout not present')
    }
    if (locale === 'Hindi' && [release, cli, install, c11].some(page =>
      (page.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 100)) {
      errors.push('Hindi: missing substantial translated alpha.5 content')
    }
  }

  for (const exact of [
    "{ text: 'CLI (alpha.5)', link: '/tooling/cli-alpha5' }",
    "{ text: 'CLI (alpha.5)', link: '/hi/tooling/cli-alpha5' }",
    "{ text: 'Command-line interface (alpha.5)', link: '/tooling/cli-alpha5' }",
    "{ text: 'CLI संदर्भ (alpha.5)', link: '/hi/tooling/cli-alpha5' }",
    "/guide/installation-alpha5",
    "/hi/guide/installation-alpha5",
    "/releases/v0.0.5-alpha.5",
    "/hi/releases/v0.0.5-alpha.5"
  ]) if (!p.config.includes(exact)) errors.push('latest-version navigation missing ' + exact)

  return errors
}
