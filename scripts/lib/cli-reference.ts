import { extractCodeFences } from './code-fences.ts'

const tag = 'v0.0.5-alpha.3'
const compilerCommit = '7715c28df09c7703b39e14fddb963275b25df476'

/** Commands available in the tagged published alpha.3 interpreter. */
export const publishedCliExamples = [
  'scarp version',
  'scarp guide',
  'scarp diagnose --json',
  'scarp verify text_construction.srp',
  'scarp exec text_construction.srp',
  'scarp inspect tokens text_construction.srp',
  'scarp inspect ast text_construction.srp',
  'scarp inspect modules --json collection_module.srp',
  'scarp explain E0015',
  'scarp exec --max-steps 2000000 text_construction.srp',
  'scarp guide inspect modules',
  'scarp verify --diagnostic-format=json diagnostics/type_error.srp'
] as const

/**
 * Pure content gate. Runtime semantics are tested separately using the tagged
 * compiler binary in test-alpha3.ts. This gate catches stale releases, prose
 * that silently omits commands, and translated examples that drift.
 */
export function validatePublishedCliReference(
  english: string,
  hindi: string,
  expectedStdout: string
): string[] {
  const problems: string[] = []
  const enFences = extractCodeFences(english)
  const hiFences = extractCodeFences(hindi)

  if (JSON.stringify(enFences.map(f => [f.language, f.code])) !==
      JSON.stringify(hiFences.map(f => [f.language, f.code]))) {
    problems.push('English and Hindi CLI code fences differ')
  }

  for (const [language, markdown, fences, archive] of [
    ['English', english, enFences, '/tooling/cli-alpha1'],
    ['Hindi', hindi, hiFences, '/hi/tooling/cli-alpha1']
  ] as const) {
    if (!markdown.includes('<!-- scarp-cli-release: ' + tag + ' -->')) {
      problems.push(language + ' page lacks the published-release marker')
    }
    if (!markdown.includes('https://github.com/scarp-lang/scarp/releases/tag/' + tag) ||
        !markdown.includes(compilerCommit)) {
      problems.push(language + ' page lacks the published tag or exact compiler commit')
    }
    if (!markdown.includes('](' + archive + ')')) {
      problems.push(language + ' page does not link the historical alpha.1 CLI')
    }

    const shellLines = fences.filter(f => ['sh', 'bash', 'shell'].includes(f.language))
      .flatMap(f => f.code.split(/\r?\n/).map(line => line.trim()))
    for (const command of publishedCliExamples) {
      if (!shellLines.includes(command)) {
        problems.push(language + ' page is missing published command: ' + command)
      }
    }
    if (!fences.some(f => f.language === 'text' && f.code === expectedStdout.trim())) {
      problems.push(language + ' page has incorrect release-backed expected stdout')
    }
    if (shellLines.some(line => /^scarp (?:build|compile|create|launch|polish)\b/.test(line))) {
      problems.push(language + ' page offers an unshipped executable command')
    }
  }
  return problems
}
