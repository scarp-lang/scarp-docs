import { extractCodeFences, firstMissingCodeBlock } from './code-fences.ts'
import { ALPHA6_REF, ALPHA6_SHA, gitBlobSha, type Alpha6Manifest } from './alpha6-evidence.ts'

export const NAVIGATION_PROJECT_MANIFEST =
  'scarp-project: 1\nname: navigation-lab\nentry: src/main.srp\n'

export interface Alpha6ProjectSources {
  manifest: string
  main: string
  module: string
  stdout: string
  taggedMain: string
  taggedModule: string
  taggedStdout: string
}
export interface Alpha6ProjectPages {
  english: string
  hindi: string
  config: string
  examplesEn: string
  examplesHi: string
  homeEn: string
  homeHi: string
  readme: string
}

function fence(markdown: string, language: string, exactSource: string): boolean {
  return extractCodeFences(markdown).some(block =>
    block.language === language && block.code === exactSource.trim())
}
function command(markdown: string, expected: string): boolean {
  return extractCodeFences(markdown).some(block =>
    ['sh','shell','bash'].includes(block.language) &&
      block.code.split('\n').some(line => line.trim() === expected))
}

/** Pure validation for both guides, pinned sources, generator manifest, and navigation. */
export function validateAlpha6Project(
  pages: Alpha6ProjectPages,
  sources: Alpha6ProjectSources,
  published: Alpha6Manifest
): string[] {
  const failures: string[] = []
  const fail = (message: string): void => { failures.push(message) }
  const pinnedMain = published.fixtures['symbol_navigation.srp']
  const pinnedModule = published.fixtures['modules/navigation_values.srp']
  const pinnedStdout = published.fixtures['symbol_navigation.stdout']
  if (published.compilerRef !== ALPHA6_REF || published.compilerCommit !== ALPHA6_SHA ||
      published.status !== 'published-prerelease') {
    fail('compiler release identity or publication state drift')
  }
  if (sources.manifest !== NAVIGATION_PROJECT_MANIFEST) fail('manifest must match generated project v1')
  if (sources.main !== sources.taggedMain ||
      !pinnedMain || gitBlobSha(sources.main) !== pinnedMain.gitBlobSha) {
    fail('entrypoint does not match published alpha.6 compiler Git blob')
  }
  if (sources.module !== sources.taggedModule ||
      !pinnedModule || gitBlobSha(sources.module) !== pinnedModule.gitBlobSha) {
    fail('imported module does not match published alpha.6 compiler Git blob')
  }
  if (sources.stdout !== sources.taggedStdout || sources.stdout !== '30\n' ||
      !pinnedStdout || gitBlobSha(sources.stdout) !== pinnedStdout.gitBlobSha) {
    fail('project stdout does not match published alpha.6 fixture')
  }
  const requiredCommands = [
    'scarp create navigation-lab',
    'scarp verify navigation-lab',
    'scarp inspect modules --json navigation-lab',
    'scarp inspect symbols --json navigation-lab',
    'scarp inspect references --json navigation-lab',
    'scarp launch navigation-lab',
    'scarp exec navigation-lab/src/main.srp'
  ]
  for (const [locale,page,prefix] of [
    ['English',pages.english,''],
    ['Hindi',pages.hindi,'/hi']
  ] as const) {
    const missing = (name: string, required: string): void => {
      if (!page.includes(required)) fail(locale + ' guide: missing ' + name + ' ' + required)
    }
    missing('release marker','<!-- scarp-cli-release: ' + ALPHA6_REF + ' -->')
    missing('compiler SHA marker','<!-- scarp-alpha6-project-lab: ' + ALPHA6_SHA + ' -->')
    missing('published release','https://github.com/scarp-lang/scarp/releases/tag/' + ALPHA6_REF)
    missing('exact tagged entrypoint',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/examples/symbol_navigation.srp')
    missing('exact tagged module',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/examples/modules/navigation_values.srp')
    missing('exact tagged output',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/examples/symbol_navigation.stdout')
    missing('CLI link','](' + prefix + '/tooling/cli-alpha6)')
    missing('release guide link','](' + prefix + '/releases/v0.0.6-alpha.1)')
    missing('project fixture link','conformance/alpha6-project')
    missing('JSON symbol kind','scarp.symbols')
    missing('JSON reference kind','scarp.references')
    missing('versioned schema','schema_version: 1')
    missing('static versus runtime explanation','verify')
    missing('safe project guidance','Scarp.project')
    for (const [lang,content] of [
      ['text',sources.manifest],
      ['scarp',sources.module],
      ['scarp',sources.main],
      ['text',sources.stdout]
    ]) if (!fence(page,lang,content)) fail(locale + ' guide: missing or modified exact ' + lang + ' code block')
    for (const entry of requiredCommands) {
      if (!command(page,entry)) fail(locale + ' guide: missing published command ' + entry)
    }
    if ((page.match(/scarp create navigation-lab/g) ?? []).length < 2) {
      fail(locale + ' guide: missing separate scaffold-creation instructions')
    }
    if (locale === 'Hindi' && (page.match(/[\u0900-\u097f]/g) ?? []).length < 250) {
      fail('Hindi guide: insufficient human-language translation')
    }
  }
  try {
    const englishFences = extractCodeFences(pages.english)
    const hindiFences = extractCodeFences(pages.hindi)
    if (firstMissingCodeBlock(englishFences,hindiFences) !== -1) {
      fail('Hindi guide loses or reorders a tagged English code block')
    }
  } catch (error) {
    fail('invalid bilingual Markdown fences: ' + String(error))
  }
  for (const [name,content,link] of [
    ['English navigation',pages.config,"/tutorials/project-symbol-navigation-alpha6"],
    ['Hindi navigation',pages.config,"/hi/tutorials/project-symbol-navigation-alpha6"],
    ['English examples',pages.examplesEn,"/tutorials/project-symbol-navigation-alpha6"],
    ['Hindi examples',pages.examplesHi,"/hi/tutorials/project-symbol-navigation-alpha6"],
    ['English homepage',pages.homeEn,"/tutorials/project-symbol-navigation-alpha6"],
    ['Hindi homepage',pages.homeHi,"/hi/tutorials/project-symbol-navigation-alpha6"],
    ['README',pages.readme,"docs/tutorials/project-symbol-navigation-alpha6.md"],
    ['README Hindi',pages.readme,"docs/hi/tutorials/project-symbol-navigation-alpha6.md"]
  ] as const) {
    if (!content.includes(link)) fail(name + ': missing tutorial discoverability link')
  }
  return failures
}
