import { extractCodeFences, firstMissingCodeBlock } from './code-fences.ts'
import { ALPHA6_REF, ALPHA6_SHA, type Alpha6Manifest } from './alpha6-evidence.ts'

/** Each stage links only to lessons verified for its *own* published release. */
export interface LearningStage {
  id: string
  release: string
  lessons: readonly string[]
}

export const learningStages = [
  {id:'foundations', release:'v0.0.5-alpha.1',
    lessons:['guide/first-program','language/variables','tutorials/verified-functions',
      'tutorials/repeat-and-loops','tutorials/verified-output']},
  {id:'modules-numerics', release:'v0.0.5-alpha.1',
    lessons:['tutorials/modules-walkthrough','tutorials/verified-vectors',
      'tutorials/verified-tiles','tutorials/verified-classification']},
  {id:'collections-diagnostics', release:'v0.0.5-alpha.2',
    lessons:['language/typed-bindings-alpha2','language/bitwise-operators-alpha2',
      'language/unicode-text','tutorials/alpha2-collections-and-learning',
      'tutorials/alpha2-diagnostics-and-repairs']},
  {id:'static-cli', release:'v0.0.5-alpha.3',
    lessons:['guide/quickstart-alpha3','tooling/cli','releases/v0.0.5-alpha.3']},
  {id:'projects', release:'v0.0.5-alpha.4',
    lessons:['guide/quickstart-alpha4','guide/migrate-alpha3-to-alpha4',
      'releases/v0.0.5-alpha.4']},
  {id:'project-inspection', release:'v0.0.5-alpha.5',
    lessons:['tooling/cli-alpha5','releases/v0.0.5-alpha.5','reference/c11-backend-alpha5']},
  {id:'navigation-rms', release:'v0.0.6-alpha.1',
    lessons:['tutorials/project-symbol-navigation-alpha6','tooling/cli-alpha6',
      'language/rms-alpha6','releases/v0.0.6-alpha.1']}
] as const satisfies readonly LearningStage[]

const knownTags = new Set(learningStages.map(s => s.release))

export interface LearningPathPages {
  english: string
  hindi: string
  config: string
  homeEnglish: string
  homeHindi: string
  introEnglish: string
  introHindi: string
  firstEnglish: string
  firstHindi: string
  quickEnglish: string
  quickHindi: string
  compatibilityEnglish: string
  compatibilityHindi: string
  examplesEnglish: string
  examplesHindi: string
  readme: string
}

export function validateLearningPath(pages: LearningPathPages, release: Alpha6Manifest): string[] {
  const errors: string[] = []
  const fail = (what: string): void => { errors.push(what) }
  if (release.compilerRef !== ALPHA6_REF || release.compilerCommit !== ALPHA6_SHA ||
      release.status !== 'published-prerelease') fail('latest release identity does not match published compiler')
  const en = pages.english
  const hi = pages.hindi
  const expectedStages = learningStages.map(s => s.id + ' ' + s.release)
  for (const [locale,page,prefix] of [
    ['English',en,''],
    ['Hindi',hi,'/hi']
  ] as const) {
    if (!page.startsWith('# ')) fail(locale + ': missing learning-page heading')
    if (!page.includes('<!-- scarp-cli-release: ' + ALPHA6_REF + ' -->') ||
        !page.includes('<!-- scarp-learning-release: ' + ALPHA6_REF + ' -->') ||
        !page.includes('<!-- scarp-learning-compiler: ' + ALPHA6_SHA + ' -->')) {
      fail(locale + ': wrong current compiler release or commit markers')
    }
    if (!page.includes('https://github.com/scarp-lang/scarp/releases/tag/' + ALPHA6_REF)) {
      fail(locale + ': missing published release URL')
    }
    const markers = [...page.matchAll(/<!-- scarp-learning-stage: ([a-z0-9-]+) (v[0-9a-z.-]+) -->/g)]
    const actual = markers.map(m => m[1] + ' ' + m[2])
    if (JSON.stringify(actual) !== JSON.stringify(expectedStages)) {
      fail(locale + ': missing, duplicated, reordered or incorrectly tagged stages')
    }
    for (const stage of learningStages) {
      if (!knownTags.has(stage.release)) fail('unknown release ' + stage.release)
      const marker = '<!-- scarp-learning-stage: ' + stage.id + ' ' + stage.release + ' -->'
      const start = page.indexOf(marker)
      if (start === -1) continue
      const following = page.indexOf('<!-- scarp-learning-stage:',start+marker.length)
      const section = page.slice(start,following===-1 ? undefined : following)
      for (const path of stage.lessons) {
        if (!section.includes('](' + prefix + '/' + path + ')')) {
          fail(locale + ' ' + stage.id + ': missing release-scoped lesson /' + path)
        }
      }
      if (!section.includes(stage.release)) {
        fail(locale + ' ' + stage.id + ': missing explicit version inside learning stage')
      }
    }
    for (const [id,anchor] of [
      ['intro','guide/introduction'],['status','reference/status'],
      ['compatibility','reference/compatibility'],['evidence','reference/evidence']
    ]) {
      if (id !== 'intro' && !page.includes('](' + prefix + '/' + anchor + ')')) {
        fail(locale + ': no ' + id + ' cross-reference')
      }
    }
    const versionCode = extractCodeFences(page).some(block =>
      block.language==='sh' && block.code==='scarp version')
    if (!versionCode) fail(locale + ': missing real compiler version check')
    const commands = ['scarp verify navigation-lab',
      'scarp inspect symbols --json navigation-lab',
      'scarp inspect references --json navigation-lab',
      'scarp launch navigation-lab']
    const blocks=extractCodeFences(page)
    if (!blocks.some(b=>b.language==='sh' && b.code===commands.join('\n'))) {
      fail(locale + ': missing or modified exact alpha.6 capstone commands')
    }
    if (!page.includes('Scarp.project') || !page.includes('30') ||
        !page.includes('v0.0.5-alpha.1') || !page.includes('v0.0.5-alpha.5')) {
      fail(locale + ': missing project/output or historical release boundaries')
    }
  }
  try {
    if (firstMissingCodeBlock(extractCodeFences(en),extractCodeFences(hi))!==-1) {
      fail('Hindi code snippets differ from English or are reordered')
    }
  } catch(error) {
    fail('learning path contains unclosed code fences: ' + String(error))
  }
  if ((hi.match(/[\u0900-\u097f]/g) ?? []).length < 500) {
    fail('Hindi learning path lacks substantial translated instruction')
  }
  for (const [name,page,expected] of [
    ['English navigation',pages.config,"link: '/guide/learning-path'"],
    ['Hindi navigation',pages.config,"link: '/hi/guide/learning-path'"],
    ['English homepage',pages.homeEnglish,'link: /guide/learning-path'],
    ['Hindi homepage',pages.homeHindi,'link: /hi/guide/learning-path'],
    ['English introduction',pages.introEnglish,'](/guide/learning-path)'],
    ['Hindi introduction',pages.introHindi,'](/hi/guide/learning-path)'],
    ['English examples',pages.examplesEnglish,'](/guide/learning-path)'],
    ['Hindi examples',pages.examplesHindi,'](/hi/guide/learning-path)'],
    ['README English',pages.readme,'](docs/guide/learning-path.md)'],
    ['README Hindi',pages.readme,'](docs/hi/guide/learning-path.md)']
  ] as const) {
    if (!page.includes(expected)) fail(name + ': missing discoverable learning-path link')
  }
  // The primary home action + feature card and introductory overview + study
  // instructions should each retain a visible learning-path entry in both locales.
  for (const [locale,home,intro,prefix] of [
    ['English',pages.homeEnglish,pages.introEnglish,''],
    ['Hindi',pages.homeHindi,pages.introHindi,'/hi']
  ] as const) {
    const course = prefix + '/guide/learning-path'
    if (home.split('link: ' + course).length - 1 < 2) {
      fail(locale + ': both homepage hero and feature card must link to learning path')
    }
    if (intro.split('](' + course + ')').length - 1 < 2) {
      fail(locale + ': both introduction onboarding and guide section must link to course')
    }
  }
  // The learning path must be reachable from *both* top navigation and sidebar.
  // Requiring two occurrences catches accidental removal from either location.
  for (const prefix of ['', '/hi']) {
    const navLink = "link: '" + prefix + "/guide/learning-path'"
    if (pages.config.split(navLink).length - 1 < 2) {
      fail((prefix ? 'Hindi' : 'English') + ': primary nav and sidebar must both expose the course')
    }
  }
  for (const [locale,compat,intro,first,quick] of [
    ['English',pages.compatibilityEnglish,pages.introEnglish,pages.firstEnglish,pages.quickEnglish],
    ['Hindi',pages.compatibilityHindi,pages.introHindi,pages.firstHindi,pages.quickHindi]
  ] as const) {
    if (!compat.includes(ALPHA6_REF) || !compat.includes(ALPHA6_SHA) ||
        !intro.includes(ALPHA6_REF) || !first.includes(ALPHA6_REF) ||
        !quick.includes(ALPHA6_REF)) {
      fail(locale + ': stale onboarding/compatibility release boundary')
    }
    if (!compat.includes(']('+(locale==='Hindi'?'/hi':'')+'/guide/learning-path)')) {
      fail(locale + ': compatibility page does not link to learner journey')
    }
    if (!compat.includes('v0.0.5-alpha.5') || !compat.includes('v0.0.5-alpha.4')) {
      fail(locale + ': historical version row lost')
    }
  }
  if (pages.introEnglish.includes('**Latest published compiler: [v0.0.5-alpha.5]') ||
      pages.introHindi.includes('**नवीनतम प्रकाशित compiler [v0.0.5-alpha.5]')) {
    fail('deprecated alpha.5 introduction still claims latest compiler')
  }
  if (pages.compatibilityEnglish.includes('**Latest published prerelease (Nov 4)') ||
      pages.compatibilityHindi.includes('**नवीनतम, 4 नवंबर 2026')) {
    fail('deprecated alpha.5 compatibility row still claims latest compiler')
  }
  if (pages.compatibilityHindi.includes('**नवीनतम संस्करण [v0.0.5-alpha.3]')) {
    fail('historical alpha.3 guide falsely claims latest compiler')
  }
  return errors
}
