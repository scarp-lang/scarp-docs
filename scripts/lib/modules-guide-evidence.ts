import { extractCodeFences } from './code-fences.ts'
import { verifyTutorialExamples, type ExecutableExample } from './tutorial-evidence.ts'

const alpha1 = 'v0.0.5-alpha.1'
const alpha2 = 'v0.0.5-alpha.2'
const sha1 = 'afe8b5380c9d6c4774162e51c6c9bc8b90901671'
const sha2 = 'e4db8e191cd7ea623123cae7348450ca6c95b170'
const expectedNames = [
  'modules-alpha1', 'static-module-introspection', 'inspection-json-schema',
  'private-imported-member', 'cyclic-module-import'
] as const
const shellCommands = [
  ['scarp --version', 'scarp check module_demo.srp', 'scarp run module_demo.srp'],
  ['scarp --version', 'scarp check module_inspection.srp',
    'scarp run module_inspection.srp', 'scarp modules module_inspection.srp',
    'scarp modules --json inspection_json.srp', 'scarp run inspection_json.srp']
] as const
const links = [
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/module_inspection.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.modules.json',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/library.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/private.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/loop.srp',
  'https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/cycle.srp'
]

/** Pure bilingual check: published example order, complete source/outputs, JSON and correct release CLI. */
export function validateModuleGuide(en: string, hi: string, examples: readonly ExecutableExample[], jsonSnapshot: string): string[] {
  const errors: string[] = []
  if (examples.length !== expectedNames.length ||
      examples.some((e, i) => e.name !== expectedNames[i])) {
    errors.push('module guide has missing, reordered or unexpected compiler cases')
  }
  const enFences = extractCodeFences(en).map(f => [f.language, f.code])
  const hiFences = extractCodeFences(hi).map(f => [f.language, f.code])
  if (JSON.stringify(enFences) !== JSON.stringify(hiFences)) {
    errors.push('English/Hindi source, command, or expected-output fences differ')
  }

  for (const [locale, markdown, prefix] of [
    ['en', en, ''], ['hi', hi, 'hi/']
  ] as const) {
    if (!markdown.includes('<!-- scarp-modules-release: ' + alpha1 + '+' + alpha2 + ' -->') ||
        !markdown.includes(sha1) || !markdown.includes(sha2)) {
      errors.push(locale + ': missing published compiler identity or release marker')
    }
    for (const tag of [alpha1, alpha2]) {
      if (!markdown.includes('https://github.com/scarp-lang/scarp/releases/tag/' + tag)) {
        errors.push(locale + ': missing public release link ' + tag)
      }
    }
    for (const url of links) {
      if (!markdown.includes(url)) errors.push(locale + ': missing tagged source provenance ' + url)
    }
    for (const local of [
      '/' + prefix + 'language/modules',
      '/' + prefix + 'reference/source-loading',
      '/' + prefix + 'reference/status',
      '/' + prefix + 'tooling/alpha2-inspection'
    ]) {
      if (!markdown.includes('](' + local + ')')) {
        errors.push(locale + ': missing related documentation ' + local)
      }
    }

    errors.push(...verifyTutorialExamples(markdown, examples)
      .map(problem => locale + ': ' + problem))
    const jsonFences = extractCodeFences(markdown).filter(f => f.language === 'json')
    if (jsonFences.length !== 1 || jsonFences[0].code !== jsonSnapshot.trim()) {
      errors.push(locale + ': published alpha.2 JSON inspection snapshot missing or modified')
    }
    const commands = extractCodeFences(markdown)
      .filter(f => ['sh', 'bash', 'shell'].includes(f.language))
      .map(f => f.code.split(/\r?\n/).map(cmd => cmd.trim()).filter(Boolean))
    if (commands.length !== shellCommands.length ||
        commands.some((list, i) => JSON.stringify(list) !== JSON.stringify(shellCommands[i]))) {
      errors.push(locale + ': wrong versioned modules CLI command sequence')
    }
    if (commands.some(list => list.some(cmd => /^scarp (?:build|compile|verify|exec|inspect)\b/.test(cmd)))) {
      errors.push(locale + ': unexpected compiler CLI verb in release-scoped modules lesson')
    }
    for (const code of ['E0041', 'E0039']) {
      if (!markdown.includes('error[' + code + ']:')) {
        errors.push(locale + ': missing complete tagged ' + code + ' diagnostic')
      }
    }
  }
  return errors
}
