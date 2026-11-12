import { FINDER_TEXT, RELEASES, TASKS } from './command-finder.ts'

export interface FinderSources {
  english: string
  hindi: string
  component: string
  theme: string
  config: string
  readme: string
  learnEn: string
  learnHi: string
  compatEn: string
  compatHi: string
}

const publishedReleases = [
  ['v0.0.5-alpha.1', 'afe8b5380c9d6c4774162e51c6c9bc8b90901671'],
  ['v0.0.5-alpha.2', 'e4db8e191cd7ea623123cae7348450ca6c95b170'],
  ['v0.0.5-alpha.3', '7715c28df09c7703b39e14fddb963275b25df476'],
  ['v0.0.5-alpha.4', '79141329176f5dce51457e90a6652902f6432135'],
  ['v0.0.5-alpha.5', '2eeed0aa52ccb59523307841ad8ffbd83f8911a8'],
  ['v0.0.6-alpha.1', 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8'],
  ['v0.0.6-alpha.2', '398b8ff705154a02423fe458ce3a427401e81e31'],
  ['v0.0.6-alpha.3', 'ceff07d9014f466974e0c9e02fc5d23573f55777'],
  ['v0.0.6-alpha.4', 'f04be0758cbce405ddcdb229699b0ff83c09d207'],
  ['v0.0.6-alpha.5', '205e92f166f186c3905e5880d41c31717b697b8e'],
  ['v0.0.6-alpha.6', 'cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e'],
  ['v0.0.6-alpha.7', 'b1c1fd232b418267d95520c69ee563ac99ecae30'],
  ['v0.0.6-alpha.8', '37253e7805c0ca594560700dd1deb3928458e60d']
]
const firstSupported = [
  ['run-file', 0],
  ['static-verify', 2],
  ['create-project', 3],
  ['inspect-project', 4],
  ['inspect-symbols', 5],
  ['diagnose-host', 2],
  ['inspect-ast', 2],
  ['init-project', 12], ['test-project', 12], ['project-info', 12]
]
const noteKeys = [
  'legacy-run', 'exec', 'verify', 'project', 'modules', 'symbols', 'diagnose', 'ast',
  'init', 'test', 'info'
] as const

type FinderRelease = { tag: string; source: string }
type FinderTask = { id: string; first: number; en: string; hi: string; reference: string }
export type FinderLabels = typeof FINDER_TEXT

/**
 * Does not depend on VitePress runtime; validates every release boundary,
 * locale, navigation surface and basic accessible widget structure in CI.
 */
export function validateCommandFinder(
  sources: FinderSources,
  releases: ReadonlyArray<FinderRelease> = RELEASES,
  tasks: ReadonlyArray<FinderTask> = TASKS,
  labels: FinderLabels = FINDER_TEXT
): string[] {
  const errors: string[] = []
  const expect = (where: string, body: string, fragment: string): void => {
    if (!body.includes(fragment)) errors.push(where + ': missing ' + fragment)
  }

  if (JSON.stringify(releases.map(r => [r.tag,r.source])) !== JSON.stringify(publishedReleases)) {
    errors.push('Release list must match thirteen exact published compiler tag commits in order')
  }
  if (JSON.stringify(tasks.map(t => [t.id,t.first])) !== JSON.stringify(firstSupported)) {
    errors.push('Task availability boundaries differ from the published tagged CLI')
  }

  for (const task of tasks) {
    if (!task.reference.startsWith('/') || task.reference.startsWith('/hi/') ||
        task.reference.includes('..')) {
      errors.push(task.id + ': missing safe release-specific reference route')
    }
    if (!task.en.trim() || !/[\u0900-\u097f]/u.test(task.hi)) {
      errors.push(task.id + ': missing task translation')
    }
  }

  const { english, hindi, component, theme, config, readme, learnEn, learnHi,
    compatEn, compatHi } = sources

  for (const [name,page,prefix] of [
    ['English',english,''],
    ['Hindi',hindi,'/hi']
  ] as const) {
    if (!page.startsWith('# ')) errors.push(name + ': command finder missing title')
    for (const expected of [
      '<ScarpCommandFinder />',
      '](' + prefix + '/guide/learning-path)',
      '](' + prefix + '/reference/compatibility)',
      '](' + prefix + '/guide/installation-alpha6)',
      '](' + prefix + '/tooling/cli-alpha1)',
      '](' + prefix + '/tooling/cli)',
      '](' + prefix + '/guide/quickstart-alpha4)',
      '](' + prefix + '/tooling/cli-alpha5)',
      '](' + prefix + '/tooling/cli-alpha6)',
      '](' + prefix + '/releases/v0.0.6-alpha.3)',
      'v0.0.6-alpha.3',
      'v0.0.6-alpha.2',
      'v0.0.5-alpha.3',
      'v0.0.5-alpha.4',
      'v0.0.5-alpha.5',
      'v0.0.6-alpha.1',
      'scarp --version',
      '](' + prefix + '/tooling/project-alpha8)',
      '](' + prefix + '/releases/v0.0.6-alpha.8)'
    ]) expect(name + ' page',page,expected)
  }
  // An up-to-date destination with a stale visible label misleads readers.
  const latestTag = releases.at(-1)?.tag
  for (const [locale, page, prefix, leading] of [
    ['English', english, '', 'latest published release is '],
    ['Hindi', hindi, '/hi', 'नवीनतम प्रकाशित release ']
  ] as const) {
    const expected = leading + '[' + latestTag + '](' + prefix + '/releases/' + latestTag + ')'
    if (!page.includes(expected)) errors.push(locale + ': latest compiler label and link drift')
  }
  expect('English page',english,'](/hi/tooling/command-finder)')
  expect('Hindi page',hindi,'](/tooling/command-finder)')
  if ((hindi.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 170) {
    errors.push('Hindi guide lacks substantial localized explanation')
  }

  for (const required of [
    "import ScarpCommandFinder from './components/ScarpCommandFinder.vue'",
    "ctx.app.component('ScarpCommandFinder', ScarpCommandFinder)"
  ]) expect('Theme registration',theme,required)
  for (const required of [
    "link: '/tooling/command-finder'",
    "link: '/hi/tooling/command-finder'"
  ]) expect('Sidebar',config,required)
  for (const [name,page,fragment] of [
    ['README',readme,'docs/tooling/command-finder.md'],
    ['README',readme,'docs/hi/tooling/command-finder.md'],
    ['Learning path English',learnEn,'](/tooling/command-finder)'],
    ['Learning path Hindi',learnHi,'](/hi/tooling/command-finder)'],
    ['Compatibility English',compatEn,'](/tooling/command-finder)'],
    ['Compatibility Hindi',compatHi,'](/hi/tooling/command-finder)']
  ]) expect(name,page,fragment)

  for (const marker of [
    'withBase(', 'useData()', 'v-model="selectedVersion"', 'v-model="selectedTask"',
    'v-if="current.supported"', 'aria-live="polite"', 'aria-atomic="true"',
    'navigator.clipboard.writeText', 'role="status"', 'focus-visible',
    'prefers-reduced-motion', 'current.commands.join', 'current.firstRelease',
    '<pre tabindex="0">', 'pre:focus-visible'
  ]) expect('Accessible Vue widget',component,marker)
  if (/\bfetch\s*\(|\bXMLHttpRequest\b|\baxios\b/.test(component)) {
    errors.push('The offline selector must not send a network request')
  }

  for (const locale of ['en','hi'] as const) {
    const messages = labels[locale]
    for (const key of [
      'heading','intro','version','task','supported','unavailable','first',
      'command','copy','copied','copyFailed','reference','missing','warning'
    ] as const) {
      if (!messages[key].trim()) errors.push(locale + ': missing UI label ' + key)
    }
    for (const key of noteKeys) {
      if (!messages.notes[key].trim()) errors.push(locale + ': missing task note ' + key)
    }
  }
  if (!/[\u0900-\u097f]/u.test(labels.hi.unavailable) ||
      !/[\u0900-\u097f]/u.test(labels.hi.copyFailed) ||
      !/[\u0900-\u097f]/u.test(labels.hi.warning)) {
    errors.push('Hindi offline and unavailable states must be translated')
  }
  return errors
}
