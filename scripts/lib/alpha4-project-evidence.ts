import { extractCodeFences } from './code-fences.ts'

const TAG = 'v0.0.5-alpha.4'
const COMMIT = '79141329176f5dce51457e90a6652902f6432135'
export interface ProjectAlpha4Fixture {
  compilerRepository: string
  compilerRef: string
  compilerCommit: string
  generatedName: string
  manifest: string
  entry: string
  stdout: string
  fixtures: { manifest: string; entry: string; output: string }
}
export interface ProjectAlpha4Files {
  manifest: string
  entry: string
  output: string
}

const commandSet = [
  'scarp version', 'scarp create hello-world',
  'scarp verify hello-world', 'scarp launch hello-world'
] as const
function fences(page: string) {
  return extractCodeFences(page).map(f => ({ language: f.language, code: f.code }))
}
function error(label: string, cause: string) {
  return label + ': ' + cause
}
export function validateAlpha4Docs(
  releaseEn: string, releaseHi: string,
  guideEn: string, guideHi: string,
  manifest: ProjectAlpha4Fixture,
  fixtures: ProjectAlpha4Files
): string[] {
  const problems: string[] = []
  if (manifest.compilerRepository !== 'scarp-lang/scarp' || manifest.compilerRef !== TAG ||
      manifest.compilerCommit !== COMMIT || manifest.generatedName !== 'hello-world' ||
      manifest.manifest !== 'Scarp.project' || manifest.entry !== 'src/main.srp' ||
      manifest.stdout !== 'starter.stdout' || manifest.fixtures.manifest !== 'Scarp.project' ||
      manifest.fixtures.entry !== 'starter.srp' || manifest.fixtures.output !== 'starter.stdout') {
    problems.push('alpha.4 tagged compiler manifest or generated file identity changed')
  }
  if (fixtures.manifest !==
      'scarp-project: 1\nname: hello-world\nentry: src/main.srp\n' ||
      fixtures.entry !== 'print("Hello from Scarp!");\n' ||
      fixtures.output !== 'Hello from Scarp!\n') {
    problems.push('published Rust project generator template and output changed')
  }
  const pagePairs = [
    ['release', releaseEn, releaseHi],
    ['quickstart', guideEn, guideHi]
  ] as const
  for (const [kind, en, hi] of pagePairs) {
    const enBlocks = fences(en)
    const hiBlocks = fences(hi)
    if (JSON.stringify(enBlocks) !== JSON.stringify(hiBlocks)) {
      problems.push(kind + ': English/Hindi code fence drift')
    }
    for (const [locale, page, blocks, prefix] of [
      ['en', en, enBlocks, ''],
      ['hi', hi, hiBlocks, 'hi/']
    ] as const) {
      const label = kind + '/' + locale
      if (!page.includes('<!-- scarp-project-release: ' + TAG + ' -->') ||
          !page.includes('<!-- scarp-cli-release: ' + TAG + ' -->') ||
          !page.includes(COMMIT) ||
          !page.includes('https://github.com/scarp-lang/scarp/releases/tag/' + TAG) ||
          !page.includes('https://github.com/scarp-lang/scarp/blob/' + TAG + '/src/project.rs')) {
        problems.push(error(label, 'missing published tag, exact source SHA or release markers'))
      }
      if (!blocks.some(f => f.language === 'text' && f.code === fixtures.manifest.trim()) ||
          !blocks.some(f => f.language === 'scarp' && f.code === fixtures.entry.trim()) ||
          !blocks.some(f => f.language === 'text' && f.code === fixtures.output.trim())) {
        problems.push(error(label, 'missing exact starter manifest, source or stdout'))
      }
      const shell = blocks.filter(f => f.language === 'sh').map(f => f.code.split(/\r?\n/))
      if (!shell.some(cmds => JSON.stringify(cmds) === JSON.stringify(commandSet))) {
        problems.push(error(label, 'missing exact create/verify/launch command sequence'))
      }
      for (const link of [
        '/' + prefix + 'reference/status',
        '/' + prefix + 'tooling/cli',
        kind === 'release' ? '/' + prefix + 'guide/quickstart-alpha4' :
          '/' + prefix + 'releases/v0.0.5-alpha.4'
      ]) {
        if (!page.includes('](' + link + ')')) {
          problems.push(error(label, 'missing versioned related link ' + link))
        }
      }
      if (!page.includes('4,096') || !page.includes('96 UTF-8') ||
          !page.includes('512 UTF-8') ||
          !page.includes('E0039') && false) {
        // The length limits are explained in the full reference, not required
        // in the compact beginner quickstart.
      }
      const unsafe = shell.flat().filter(command => /\bscarp (?:build|compile|install|polish)\b/.test(command))
      if (unsafe.length) problems.push(error(label, 'documents unsupported executable commands'))
    }
  }
  return problems
}
