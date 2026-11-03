import { extractCodeFences } from './code-fences.ts'
import { verifyTutorialExamples, type ExecutableExample } from './tutorial-evidence.ts'

const RELEASE = 'v0.0.5-alpha.2'
const SHA = 'e4db8e191cd7ea623123cae7348450ca6c95b170'
const requiredCommands = [
  'scarp --version',
  'scarp check bit_fields.srp',
  'scarp run bit_fields.srp',
  'scarp check shift.srp',
  'scarp run shift.srp',
  'scarp check radix.srp',
  'scarp run radix.srp'
] as const

/** Contract of an alpha.2-only tutorial with one successful and two failing programs. */
export function validateBitwiseLesson(en: string, hi: string, examples: readonly ExecutableExample[]): string[] {
  const errors: string[] = []
  const requiredCases = ['integer-bit-operations', 'shift-count-out-of-range', 'invalid-binary-radix']
  if (examples.length !== requiredCases.length ||
      examples.some((example, i) => example.name !== requiredCases[i])) {
    errors.push('wrong release-scoped positive/negative bitwise case inventory')
  }
  const enFences = extractCodeFences(en)
  const hiFences = extractCodeFences(hi)
  const normalized = (blocks: typeof enFences): Array<[string, string]> =>
    blocks.map(block => [block.language, block.code])
  if (JSON.stringify(normalized(enFences)) !== JSON.stringify(normalized(hiFences))) {
    errors.push('English/Hindi bitwise code or expected output changed')
  }
  for (const [label, page, prefix, fences] of [
    ['English', en, '', enFences],
    ['Hindi', hi, 'hi/', hiFences]
  ] as const) {
    if (!page.includes('<!-- scarp-bitwise-release: ' + RELEASE + ' -->') ||
        !page.includes('https://github.com/scarp-lang/scarp/releases/tag/' + RELEASE) ||
        !page.includes(SHA)) {
      errors.push(label + ': missing published alpha.2 tag, commit, or release marker')
    }
    const publishedLinks = [
      'https://github.com/scarp-lang/scarp/blob/' + RELEASE + '/examples/bit_fields.srp',
      'https://github.com/scarp-lang/scarp/blob/' + RELEASE + '/examples/bit_fields.stdout',
      'https://github.com/scarp-lang/scarp/blob/' + RELEASE + '/tests/fixtures/bits/shift.srp',
      'https://github.com/scarp-lang/scarp/blob/' + RELEASE + '/tests/fixtures/bits/radix.srp'
    ]
    for (const url of publishedLinks) {
      if (!page.includes(url)) errors.push(label + ': missing official tagged source evidence ' + url)
    }
    for (const link of [
      '/' + prefix + 'language/operators',
      '/' + prefix + 'reference/status',
      '/' + prefix + 'releases/v0.0.5-alpha.2',
      '/' + prefix + 'reference/compatibility'
    ]) {
      if (!page.includes('](' + link + ')')) errors.push(label + ': missing local reference ' + link)
    }
    errors.push(...verifyTutorialExamples(page, examples).map(e => label + ': ' + e))
    const shell = fences.filter(f => ['sh', 'shell', 'bash'].includes(f.language))
      .flatMap(f => f.code.split(/\r?\n/).map(line => line.trim()).filter(Boolean))
    if (shell.length !== requiredCommands.length ||
        shell.some((cmd, i) => cmd !== requiredCommands[i])) {
      errors.push(label + ': wrong alpha.2 CLI sequence, missing command or extra command')
    }
    if (shell.some(line => /^scarp (?:verify|exec|inspect|build|compile)\b/.test(line))) {
      errors.push(label + ': unshipped CLI verb included in published alpha.2 instructions')
    }
    for (const code of ['E0046', 'E0006']) {
      if (!page.includes('error[' + code + ']:')) {
        errors.push(label + ': missing exact published diagnostic ' + code)
      }
    }
  }
  return errors
}
