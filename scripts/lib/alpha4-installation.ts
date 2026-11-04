import { extractCodeFences } from './code-fences.ts'

// Snapshot of the published v0.0.5-alpha.4 assets and their tagged
// packaging script. Do not derive these from moving compiler main.
export const publishedInstallation = {
  release: 'v0.0.5-alpha.4',
  commit: '79141329176f5dce51457e90a6652902f6432135',
  archives: [
    "scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip",
    "scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz",
    "scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz"
  ],
  packageRoots: [
    'scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc',
    'scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu',
    'scarp-0.0.5-alpha.4-aarch64-apple-darwin'
  ]
} as const

const expectedBlocks = [
  {
    "language": "powershell",
    "code": "$archive = 'scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip'\n$expected = ((Get-Content \"$archive.sha256\" -Raw).Trim() -split '\\s+')[0]\n$actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash\nif ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }\nExpand-Archive -LiteralPath $archive -DestinationPath '.\\scarp-alpha4'\nSet-Location '.\\scarp-alpha4\\scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc'\n.\\scarp.exe version\n.\\scarp.exe create hello-world\n.\\scarp.exe verify hello-world\n.\\scarp.exe launch hello-world"
  },
  {
    "language": "bash",
    "code": "sha256sum --check scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz.sha256\nmkdir -p scarp-alpha4\ntar -xzf scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz -C scarp-alpha4\ncd scarp-alpha4/scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu\n./scarp version\n./scarp create hello-world\n./scarp verify hello-world\n./scarp launch hello-world"
  },
  {
    "language": "bash",
    "code": "shasum -a 256 -c scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz.sha256\nmkdir -p scarp-alpha4\ntar -xzf scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz -C scarp-alpha4\ncd scarp-alpha4/scarp-0.0.5-alpha.4-aarch64-apple-darwin\n./scarp version\n./scarp create hello-world\n./scarp verify hello-world\n./scarp launch hello-world"
  },
  {
    "language": "bash",
    "code": "git clone https://github.com/scarp-lang/scarp.git\ncd scarp\ngit checkout v0.0.5-alpha.4\ntest \"$(git rev-parse HEAD)\" = \"79141329176f5dce51457e90a6652902f6432135\" || exit 1\ncargo build --locked\n./target/debug/scarp version"
  },
  {
    "language": "powershell",
    "code": "git clone https://github.com/scarp-lang/scarp.git\nSet-Location scarp\ngit checkout v0.0.5-alpha.4\nif ((git rev-parse HEAD).Trim() -ne '79141329176f5dce51457e90a6652902f6432135') { throw 'Unexpected source commit' }\ncargo build --locked\n.\\target\\debug\\scarp.exe version"
  }
] as const
const releaseUrl = 'https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/'
const releasePage = 'https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4'
const requiredPaths = [
  'scripts/package.ps1',
  'scripts/verify-release.py'
] as const

/**
 * Static evidence contract for the published installer. Actual release assets
 * and package layout were checked against the compiler's GitHub release and
 * tagged packaging source; CI separately tests the compiler and docs build.
 */
export function validateAlpha4Installation(
  english: string,
  hindi: string,
  englishIntroduction: string,
  hindiIntroduction: string,
  englishFirstProgram: string,
  hindiFirstProgram: string
): string[] {
  const errors: string[] = []
  for (const [locale, content] of [['English', english], ['Hindi', hindi]] as const) {
    const tag = publishedInstallation.release
    const prefix = locale === 'Hindi' ? '/hi' : ''
    const mustInclude = [
      '<!-- scarp-cli-release: ' + tag + ' -->',
      '<!-- scarp-install-release: ' + tag + ' -->',
      releasePage,
      publishedInstallation.commit,
      releaseUrl + 'SHA256SUMS',
      ...publishedInstallation.archives.flatMap(asset => [
        releaseUrl + asset,
        releaseUrl + asset + '.sha256'
      ]),
      ...requiredPaths.map(p => 'https://github.com/scarp-lang/scarp/blob/' + tag + '/' + p),
      '](' + prefix + '/guide/quickstart-alpha4)',
      '](' + prefix + '/guide/migrate-alpha3-to-alpha4)',
      '](' + prefix + '/reference/compatibility)',
      'sha256sum --check',
      'shasum -a 256 -c',
      'Get-FileHash',
      'Expand-Archive',
      'git checkout ' + tag,
      'git rev-parse HEAD',
      'cargo build --locked'
    ]
    for (const marker of mustInclude) {
      if (!content.includes(marker)) errors.push(locale + ': missing source-pinned install requirement ' + marker)
    }
    // The visible release identity must be correct even if an unchanged
    // source-build example still mentions the pinned compiler commit.
    const firstCodeFence = content.search(/^~~~[a-z]+/m)
    const introduction = firstCodeFence < 0 ? content : content.slice(0, firstCodeFence)
    if (!introduction.includes('`' + publishedInstallation.commit + '`')) {
      errors.push(locale + ': introductory release source commit is stale or missing')
    }
    if (!content.includes('not') && locale === 'English') errors.push('English: clarify interpreter, not native compiler')
    if (locale === 'Hindi' && (content.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 250) {
      errors.push('Hindi: substantial translated installation prose required')
    }
    try {
      const found = extractCodeFences(content)
      if (found.length !== expectedBlocks.length) {
        errors.push(locale + ': expected ' + expectedBlocks.length + ' complete platform and source command blocks')
      }
      for (const [i, expected] of expectedBlocks.entries()) {
        if (!found[i] || found[i].language !== expected.language || found[i].code !== expected.code) {
          errors.push(locale + ': published platform command block #' + (i + 1) + ' changed')
        }
      }
    } catch (e) {
      errors.push(locale + ': invalid fenced commands: ' + String(e))
    }
  }

  for (const [locale, introduction, first, prefix] of [
    ['English', englishIntroduction, englishFirstProgram, ''],
    ['Hindi', hindiIntroduction, hindiFirstProgram, '/hi']
  ] as const) {
    if (!introduction.includes(releasePage)) {
      errors.push(locale + ': introduction must identify the published alpha.4 release')
    }
    if (!introduction.includes('](' + prefix + '/guide/installation)') ||
        !introduction.includes('](' + prefix + '/guide/quickstart-alpha4)')) {
      errors.push(locale + ': introduction must route to current installation and project tutorial')
    }
    if (!first.includes('](' + prefix + '/guide/installation)') ||
        !first.includes('](' + prefix + '/guide/quickstart-alpha4)')) {
      errors.push(locale + ': historical first program must send newcomers to alpha.4')
    }
    if (!first.includes('v0.0.5-alpha.1')) {
      errors.push(locale + ': first-program language evidence must remain historically scoped')
    }
  }
  return errors
}
