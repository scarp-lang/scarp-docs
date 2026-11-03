import { extractCodeFences } from './code-fences.ts'
import { verifyTutorialExamples, type ExecutableExample } from './tutorial-evidence.ts'

const release = 'v0.0.5-alpha.2'
const commit = 'e4db8e191cd7ea623123cae7348450ca6c95b170'
export const typedLessonCases = ['typed-declarations', 'exact-scalar-conversions'] as const
const requiredCommands = [
  'scarp --version',
  'scarp check typed_declarations.srp',
  'scarp run typed_declarations.srp',
  'scarp check scalar_conversions.srp',
  'scarp run scalar_conversions.srp'
] as const

/** Release-scoped, pure validation; does not claim alpha.3 binary compatibility. */
export function verifyTypedBindingsLesson(
  english: string,
  hindi: string,
  examples: readonly ExecutableExample[]
): string[] {
  const issues: string[] = []
  if (examples.length !== 2 ||
      examples.some((item, index) => item.name !== typedLessonCases[index])) {
    issues.push('wrong pinned alpha.2 fixture set or lesson order')
  }
  const enFences = extractCodeFences(english)
  const hiFences = extractCodeFences(hindi)
  if (JSON.stringify(enFences.map(f => [f.language, f.code])) !==
      JSON.stringify(hiFences.map(f => [f.language, f.code]))) {
    issues.push('English/Hindi exact code fences do not match')
  }
  for (const [name, markdown, fences, locale] of [
    ['English', english, enFences, ''],
    ['Hindi', hindi, hiFences, 'hi/']
  ] as const) {
    if (!markdown.includes('<!-- scarp-language-release: ' + release + ' -->')) {
      issues.push(name + ': missing explicit release marker')
    }
    if (!markdown.includes('https://github.com/scarp-lang/scarp/releases/tag/' + release) ||
        !markdown.includes(commit)) {
      issues.push(name + ': missing release tag or source commit')
    }
    issues.push(...verifyTutorialExamples(markdown, examples).map(msg => name + ': ' + msg))
    const shell = fences.filter(f => ['sh', 'shell', 'bash'].includes(f.language))
      .flatMap(f => f.code.split(/\r?\n/).map(line => line.trim()))
    for (const command of requiredCommands) {
      if (!shell.includes(command)) issues.push(name + ': missing alpha.2 CLI command: ' + command)
    }
    if (shell.some(cmd => /^scarp (?:verify|exec|inspect|build|compile)\b/.test(cmd))) {
      issues.push(name + ': includes a CLI command not shipped in alpha.2')
    }
    for (const path of [
      '/' + locale + 'language/variables', '/' + locale + 'language/types',
      '/' + locale + 'reference/status', '/' + locale + 'guide/quickstart-alpha3'
    ]) {
      if (!markdown.includes('](' + path + ')')) issues.push(name + ': missing reference to ' + path)
    }
    for (const source of ['typed_declarations.srp', 'scalar_conversions.srp']) {
      if (!markdown.includes('https://github.com/scarp-lang/scarp/blob/' + release + '/examples/' + source)) {
        issues.push(name + ': missing official tagged source link for ' + source)
      }
    }
  }
  return issues
}
