import { extractCodeFences, type CodeFence } from './code-fences.ts'

const releaseMarker = '<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->'
const pinnedSourceCommits = [
  '7715c28df09c7703b39e14fddb963275b25df476',
  '79141329176f5dce51457e90a6652902f6432135'
]
const requiredCommands = [
  'scarp verify FILE.srp',
  'scarp exec FILE.srp',
  'scarp create DIRECTORY',
  'scarp verify DIRECTORY',
  'scarp launch DIRECTORY'
]
const expectedFences: Pick<CodeFence, 'language' | 'code'>[] = [
  {
    language: 'sh',
    code: 'scarp version\nscarp verify app.srp\nscarp exec app.srp'
  },
  {
    language: 'sh',
    code: 'scarp create hello-world\nscarp verify hello-world\nscarp launch hello-world'
  },
  {
    language: 'text',
    code: 'scarp-project: 1\nname: hello-world\nentry: src/main.srp'
  },
  { language: 'scarp', code: 'print("Hello from Scarp!");' },
  { language: 'text', code: 'Hello from Scarp!' },
  {
    language: 'sh',
    code: 'scarp verify --diagnostic-format=json hello-world\nscarp launch --diagnostic-format=json hello-world'
  }
]

/**
 * Prevents documentation for one published compiler release from silently
 * claiming commands shipped in another release or changing tested examples.
 * The actual tagged interpreter is exercised separately in compiler CI.
 */
export function validateAlpha4MigrationDocs(english: string, hindi: string): string[] {
  const errors: string[] = []
  const pages = [
    { label: 'English', content: english, prefix: '' },
    { label: 'Hindi', content: hindi, prefix: '/hi' }
  ]
  for (const { label, content, prefix } of pages) {
    if (!content.startsWith('# ')) errors.push(label + ': missing top-level title')
    if (!content.includes(releaseMarker)) errors.push(label + ': missing release migration marker')
    for (const release of ['v0.0.5-alpha.3', 'v0.0.5-alpha.4']) {
      if (!content.includes('https://github.com/scarp-lang/scarp/releases/tag/' + release)) {
        errors.push(label + ': missing published ' + release + ' release URL')
      }
    }
    for (const sha of pinnedSourceCommits) {
      if (!content.includes(sha)) errors.push(label + ': missing published compiler commit ' + sha)
    }
    if (!content.includes('https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/tests/scarp_projects.rs')) {
      errors.push(label + ': missing tagged project test evidence')
    }
    for (const command of requiredCommands) {
      if (!content.includes('| `' + command + '` |')) errors.push(label + ': missing version matrix row for ' + command)
    }
    for (const path of [
      prefix + '/guide/quickstart-alpha4',
      prefix + '/releases/v0.0.5-alpha.4',
      prefix + '/tooling/cli'
    ]) {
      if (!content.includes('](' + path + ')')) errors.push(label + ': missing local navigation link ' + path)
    }
    if (!content.includes('`check`') || !content.includes('`verify`')) {
      errors.push(label + ': missing legacy check versus static verify warning')
    }
    if (!content.includes('overwrit') && !content.includes('overwrite')) {
      errors.push(label + ': missing warning about existing project folders')
    }
    if (!content.includes('backup') && !content.includes('back up')) {
      errors.push(label + ': missing preservation guidance for existing source files')
    }
    if (!content.includes('4,096') || !content.includes('512') || !content.includes('1–96')) {
      errors.push(label + ': manifest size and path limits must be explained')
    }
    let blocks: CodeFence[]
    try {
      blocks = extractCodeFences(content)
    } catch (cause) {
      errors.push(label + ': ' + String(cause))
      continue
    }
    if (blocks.length !== expectedFences.length) {
      errors.push(label + ': expected ' + expectedFences.length + ' complete evidence code fences')
    }
    for (const [index, expected] of expectedFences.entries()) {
      if (!blocks[index] || blocks[index].language !== expected.language || blocks[index].code !== expected.code) {
        errors.push(label + ': changed published example #' + (index + 1))
      }
    }
  }
  if (!/[ऀ-ॿ]/u.test(hindi) || (hindi.match(/[ऀ-ॿ]/gu) ?? []).length < 100) {
    errors.push('Hindi: missing substantial localization')
  }
  return errors
}
