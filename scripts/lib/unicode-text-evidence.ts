import { extractCodeFences } from './code-fences.ts'
import { verifyTutorialExamples, type ExecutableExample } from './tutorial-evidence.ts'

export interface PublishedTextCases {
  alpha2: ExecutableExample
  alpha3: ExecutableExample
}
const ALPHA2 = 'v0.0.5-alpha.2'
const ALPHA3 = 'v0.0.5-alpha.3'
const ALPHA2_SHA = 'e4db8e191cd7ea623123cae7348450ca6c95b170'
const ALPHA3_SHA = '7715c28df09c7703b39e14fddb963275b25df476'
const alpha2Commands = [
  'scarp --version', 'scarp check unicode_text.srp', 'scarp run unicode_text.srp'
] as const
const alpha3Commands = [
  'scarp version', 'scarp verify text_construction.srp', 'scarp exec text_construction.srp'
] as const

function section(markdown: string, start: string, stop: string): string | null {
  const i = markdown.indexOf(start)
  const j = markdown.indexOf(stop, i + start.length)
  if (i < 0 || j < 0 || j <= i) return null
  return markdown.slice(i, j)
}
function linesOfShell(markdown: string): string[] {
  return extractCodeFences(markdown)
    .filter(f => ['sh', 'bash', 'shell'].includes(f.language))
    .flatMap(f => f.code.split(/\r?\n/).map(line => line.trim()).filter(Boolean))
}

/**
 * Pure checker for release-specific tutorial evidence.
 * Tagged compilers execute the actual cases independently in GitHub CI.
 */
export function verifyPublishedUnicodeLesson(en: string, hi: string, examples: PublishedTextCases): string[] {
  const errors: string[] = []
  if (examples.alpha2.name !== 'unicode-text-queries' ||
      examples.alpha3.name !== 'unicode-text-construction') {
    errors.push('unexpected published text fixture names')
  }
  const original = extractCodeFences(en).map(f => [f.language, f.code])
  const translated = extractCodeFences(hi).map(f => [f.language, f.code])
  if (JSON.stringify(original) !== JSON.stringify(translated)) {
    errors.push('English/Hindi source and command fences changed')
  }

  for (const [locale, page, prefix] of [
    ['English', en, ''],
    ['Hindi', hi, 'hi/']
  ] as const) {
    if (!page.includes('<!-- scarp-unicode-release: ' + ALPHA2 + '+' + ALPHA3 + ' -->') ||
        !page.includes('<!-- scarp-cli-release: ' + ALPHA3 + ' -->')) {
      errors.push(locale + ': missing supported release-scope markers')
    }
    for (const [tag, sha, file] of [
      [ALPHA2, ALPHA2_SHA, 'unicode_text.srp'],
      [ALPHA3, ALPHA3_SHA, 'text_construction.srp']
    ] as const) {
      if (!page.includes('https://github.com/scarp-lang/scarp/releases/tag/' + tag) ||
          !page.includes(sha) ||
          !page.includes('https://github.com/scarp-lang/scarp/blob/' + tag + '/examples/' + file)) {
        errors.push(locale + ': missing pinned published identity or source link for ' + tag)
      }
    }
    for (const link of [
      '/' + prefix + 'language/types',
      '/' + prefix + 'reference/status',
      '/' + prefix + 'guide/quickstart-alpha3'
    ]) {
      if (!page.includes('](' + link + ')')) errors.push(locale + ': missing related page ' + link)
    }

    const section2 = section(page, '## 2.', '## 3.')
    const section3 = section(page, '## 3.', '## 4.')
    if (!section2 || !section3) {
      errors.push(locale + ': release sections missing or reordered')
      continue
    }
    errors.push(...verifyTutorialExamples(section2, [examples.alpha2])
      .map(x => locale + ': alpha.2 ' + x))
    errors.push(...verifyTutorialExamples(section3, [examples.alpha3])
      .map(x => locale + ': alpha.3 ' + x))

    const actual2 = linesOfShell(section2)
    const actual3 = linesOfShell(section3)
    for (const cmd of alpha2Commands) {
      if (actual2.filter(line => line === cmd).length !== 1) {
        errors.push(locale + ': missing or duplicated alpha.2 command ' + cmd)
      }
    }
    for (const cmd of alpha3Commands) {
      if (actual3.filter(line => line === cmd).length !== 1) {
        errors.push(locale + ': missing or duplicated alpha.3 command ' + cmd)
      }
    }
    if (actual2.length !== alpha2Commands.length ||
        actual2.some(line => /^scarp (?:verify|exec|inspect|build|compile)\b/.test(line))) {
      errors.push(locale + ': alpha.2 section uses unsupported or extra executable commands')
    }
    if (actual3.length !== alpha3Commands.length ||
        actual3.some(line => /^scarp (?:build|compile)\b/.test(line))) {
      errors.push(locale + ': alpha.3 section uses unsupported or extra executable commands')
    }
  }
  return errors
}
