import { ALPHA6_REF, ALPHA6_SHA } from './alpha6-evidence.ts'
import { extractCodeFences, firstMissingCodeBlock } from './code-fences.ts'

const download = 'https://github.com/scarp-lang/scarp/releases/download/' + ALPHA6_REF + '/'
const release = 'https://github.com/scarp-lang/scarp/releases/tag/' + ALPHA6_REF
const quote = String.fromCharCode(96)
export const alpha6InstallArchives = [
  'scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip',
  'scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz',
  'scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz'
] as const

const expectedBlocks = [
  { language: "powershell", code: "$archive = 'scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip'\n$expected = ((Get-Content \"$archive.sha256\" -Raw).Trim() -split '\\s+')[0]\n$actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash\nif ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }\nExpand-Archive -LiteralPath $archive -DestinationPath '.\\scarp-alpha6'\nSet-Location '.\\scarp-alpha6\\scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc'\n.\\scarp.exe version\n.\\scarp.exe create hello-world\n.\\scarp.exe verify hello-world\n.\\scarp.exe launch hello-world" },
  { language: "bash", code: "sha256sum --check scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256\nmkdir -p scarp-alpha6\ntar -xzf scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz -C scarp-alpha6\ncd scarp-alpha6/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu\n./scarp version\n./scarp create hello-world\n./scarp verify hello-world\n./scarp launch hello-world" },
  { language: "bash", code: "shasum -a 256 -c scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256\nmkdir -p scarp-alpha6\ntar -xzf scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz -C scarp-alpha6\ncd scarp-alpha6/scarp-0.0.6-alpha.1-aarch64-apple-darwin\n./scarp version\n./scarp create hello-world\n./scarp verify hello-world\n./scarp launch hello-world" },
  { language: "bash", code: "git clone https://github.com/scarp-lang/scarp.git\ncd scarp\ngit checkout v0.0.6-alpha.1\ntest \"$(git rev-parse HEAD)\" = \"aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8\" || exit 1\ncargo build --locked --offline\n./target/debug/scarp version" },
  { language: "powershell", code: "git clone https://github.com/scarp-lang/scarp.git\nSet-Location scarp\ngit checkout v0.0.6-alpha.1\nif ((git rev-parse HEAD).Trim() -ne 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8') { throw 'Unexpected source commit' }\ncargo build --locked --offline\n.\\target\\debug\\scarp.exe version" },
] as const

export interface Alpha6InstallPages {
  english: string
  hindi: string
  config: string
  homeEnglish: string
  homeHindi: string
  releaseEnglish: string
  releaseHindi: string
}

export function validateAlpha6Installation(pages: Alpha6InstallPages): string[] {
  const errors: string[] = []
  const requireText = (content: string, required: string, label: string): void => {
    if (!content.includes(required)) errors.push(label + ': missing ' + required)
  }
  for (const [label, page, prefix] of [
    ['English', pages.english, ''], ['Hindi', pages.hindi, '/hi']
  ] as const) {
    const firstFence = page.search(/^~~~[a-z]+/m)
    const introduction = firstFence < 0 ? page : page.slice(0, firstFence)
    for (const marker of [
      '<!-- scarp-cli-release: ' + ALPHA6_REF + ' -->',
      '<!-- scarp-install-release: ' + ALPHA6_REF + ' -->',
      '<!-- scarp-install-compiler: ' + ALPHA6_SHA + ' -->',
      release,
      quote + ALPHA6_SHA + quote,
      download + 'SHA256SUMS',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/scripts/package.ps1',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/scripts/verify-release.py',
      '](' + prefix + '/tooling/cli-alpha6)',
      '](' + prefix + '/tutorials/project-symbol-navigation-alpha6)',
      '](' + prefix + '/releases/v0.0.6-alpha.1)',
      '](' + prefix + '/guide/learning-path)'
    ]) requireText(page, marker, label)
    requireText(introduction, quote + ALPHA6_SHA + quote, label + ' release header')
    for (const archive of alpha6InstallArchives) {
      requireText(page, '[' + quote + archive + quote + '](' + download + archive + ')', label)
      requireText(page, '[' + quote + archive + '.sha256' + quote + '](' + download + archive + '.sha256)', label)
    }
    try {
      const blocks = extractCodeFences(page)
      if (blocks.length !== expectedBlocks.length) errors.push(label + ': expected five complete checksum/platform/source commands')
      for (const [index, expected] of expectedBlocks.entries()) {
        if (blocks[index]?.language !== expected.language || blocks[index]?.code !== expected.code) {
          errors.push(label + ': changed official installation command block #' + (index + 1))
        }
      }
    } catch (e) {
      errors.push(label + ': invalid code fences: ' + String(e))
    }
    if (label === 'English') {
      for (const term of ['experimental interpreter', 'not a digital signature', 'Windows ARM64', 'Intel macOS']) {
        requireText(page, term, label)
      }
    } else {
      if ((page.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 300) {
        errors.push('Hindi: substantial translated installation instructions are missing')
      }
      for (const term of ['digital signature', 'Windows ARM64', 'Intel macOS']) {
        requireText(page, term, label)
      }
    }
  }
  try {
    if (firstMissingCodeBlock(extractCodeFences(pages.english), extractCodeFences(pages.hindi)) !== -1) {
      errors.push('Hindi: executable examples changed or reordered versus English')
    }
  } catch (e) {
    errors.push('Bilingual code-fence parse failure: ' + String(e))
  }
  for (const [locale, path, home, releasePage] of [
    ['English','/guide/installation-alpha6',pages.homeEnglish,pages.releaseEnglish],
    ['Hindi','/hi/guide/installation-alpha6',pages.homeHindi,pages.releaseHindi]
  ] as const) {
    requireText(pages.config, "link: '" + path + "'", locale + ' site navigation')
    requireText(home, 'link: ' + path, locale + ' homepage')
    requireText(releasePage, '](' + path + ')', locale + ' published release')
  }
  if (pages.homeEnglish.includes('details: Use verified prerelease binaries, or build the interpreter from the official Rust source.\n    link: /guide/installation\n')) {
    errors.push('English homepage still promotes archived alpha.4 installation')
  }
  return errors
}
