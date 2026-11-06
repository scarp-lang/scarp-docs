/**
 * Published Scarp compiler CLI command finder. This table records availability,
 * not a cross-release compatibility guarantee. Never infer a feature from main.
 *
 * Release boundaries come from the tagged upstream src/main.rs and docs:
 * alpha.1/2: run/check/tokens; alpha.3: Scarp-first CLI + static verify;
 * alpha.4: create/launch/project verify; alpha.5: inspect project modules;
 * alpha.6: inspect symbols and references.
 */
export const RELEASES = [
  { tag: 'v0.0.5-alpha.1', label: 'v0.0.5-alpha.1', source: 'afe8b5380c9d6c4774162e51c6c9bc8b90901671' },
  { tag: 'v0.0.5-alpha.2', label: 'v0.0.5-alpha.2', source: 'e4db8e191cd7ea623123cae7348450ca6c95b170' },
  { tag: 'v0.0.5-alpha.3', label: 'v0.0.5-alpha.3', source: '7715c28df09c7703b39e14fddb963275b25df476' },
  { tag: 'v0.0.5-alpha.4', label: 'v0.0.5-alpha.4', source: '79141329176f5dce51457e90a6652902f6432135' },
  { tag: 'v0.0.5-alpha.5', label: 'v0.0.5-alpha.5', source: '2eeed0aa52ccb59523307841ad8ffbd83f8911a8' },
  { tag: 'v0.0.6-alpha.1', label: 'v0.0.6-alpha.1 (latest)', source: 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8' }
] as const

export type ReleaseTag = (typeof RELEASES)[number]['tag']
export const LATEST_RELEASE: ReleaseTag = 'v0.0.6-alpha.1'

export const TASKS = [
  { id: 'run-file', en: 'Run a source file', hi: 'Source file चलाएँ', first: 0, reference: '/tooling/cli-alpha1' },
  { id: 'static-verify', en: 'Statically verify a file', hi: 'बिना चलाए static जाँच', first: 2, reference: '/tooling/cli' },
  { id: 'create-project', en: 'Create and launch a project', hi: 'Project बनाएँ और चलाएँ', first: 3, reference: '/guide/quickstart-alpha4' },
  { id: 'inspect-project', en: 'Inspect a project module graph', hi: 'Project modules जाँचें', first: 4, reference: '/tooling/cli-alpha5' },
  { id: 'inspect-symbols', en: 'Inspect definitions and references', hi: 'Symbols और references खोजें', first: 5, reference: '/tooling/cli-alpha6' },
  { id: 'diagnose-host', en: 'Diagnose the installed compiler', hi: 'Compiler और host जाँचें', first: 2, reference: '/tooling/cli' },
  { id: 'inspect-ast', en: 'View a parsed syntax tree', hi: 'Syntax tree देखें', first: 2, reference: '/tooling/cli' }
] as const

export type CommandTask = (typeof TASKS)[number]['id']
export type NoteKey = 'legacy-run' | 'exec' | 'verify' | 'project' | 'modules' | 'symbols' | 'diagnose' | 'ast'

export interface CommandAdvice {
  release: ReleaseTag
  task: CommandTask
  supported: boolean
  firstRelease: ReleaseTag
  commands: readonly string[]
  reference: string
  note: NoteKey
}

/**
 * No external API, browser access, file I/O or mutation: same selection always
 * returns the same release-scoped guidance. The site does not inspect the
 * visitor's installed executable and cannot auto-detect its version.
 */
export function commandAdvice(release: ReleaseTag, task: CommandTask): CommandAdvice {
  const versionIndex = RELEASES.findIndex(item => item.tag === release)
  const topic = TASKS.find(item => item.id === task)
  if (versionIndex < 0 || !topic) throw new TypeError('Unknown published compiler version or command task')
  const supported = versionIndex >= topic.first
  const firstRelease = RELEASES[topic.first]!.tag
  const result: CommandAdvice = {
    release, task, supported, firstRelease,
    commands: [], reference: topic.reference, note: 'exec'
  }
  if (!supported) return result
  switch (task) {
    case 'run-file':
      return { ...result, commands: [versionIndex <= 1 ? 'scarp run FILE.srp' : 'scarp exec FILE.srp'],
        reference: versionIndex <= 1 ? '/tooling/cli-alpha1' :
          versionIndex === 2 ? '/tooling/cli' :
          versionIndex === 3 ? '/tooling/cli-alpha4' :
          versionIndex === 4 ? '/tooling/cli-alpha5' : '/tooling/cli-alpha6',
        note: versionIndex <= 1 ? 'legacy-run' : 'exec' }
    case 'static-verify':
      return { ...result, commands: ['scarp verify FILE.srp'], note: 'verify' }
    case 'create-project':
      return { ...result,
        commands: ['scarp create demo', 'scarp verify demo', 'scarp launch demo'],
        note: 'project' }
    case 'inspect-project':
      return { ...result, commands: ['scarp inspect modules --json PROJECT_DIRECTORY'],
        note: 'modules' }
    case 'inspect-symbols':
      return { ...result, commands: [
        'scarp inspect symbols --json FILE.srp',
        'scarp inspect references --json FILE.srp'
      ], note: 'symbols' }
    case 'diagnose-host':
      return { ...result, commands: ['scarp diagnose --json'],
        reference: versionIndex === 5 ? '/tooling/diagnose-alpha6' : '/tooling/cli',
        note: 'diagnose' }
    case 'inspect-ast':
      return { ...result, commands: ['scarp inspect ast FILE.srp'],
        reference: versionIndex === 5 ? '/tooling/inspect-ast-alpha6' : '/tooling/cli',
        note: 'ast' }
  }
}

export const FINDER_TEXT = {
  en: {
    heading: 'Find a command for your compiler version',
    intro: 'Choose the release you actually installed and the task you want to perform.',
    version: 'Installed compiler release',
    task: 'Task',
    supported: 'Available in this published release',
    unavailable: 'Not available in this published release',
    first: 'First published:',
    command: 'Verified command pattern',
    copy: 'Copy commands',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the command text manually.',
    reference: 'Read the release-specific documentation',
    missing: 'Select a newer published compiler release for this task. Do not try to run these commands in the older binary.',
    warning: 'The site cannot detect your installed compiler. Check scarp version; historical tutorials do not imply full compatibility across releases.',
    notes: {
      'legacy-run': 'Before alpha.3, use run. The historical check command can evaluate runtime paths; it is not static verify.',
      exec: 'Exec runs through the Scarp interpreter, not a native compiled executable.',
      verify: 'Verify checks source and imports without executing ordinary runtime statements.',
      project: 'Create writes a new directory and refuses to overwrite an existing one. Launch runs its entrypoint through the interpreter.',
      modules: 'Project inspection needs an explicit directory containing Scarp.project and does not run program statements.',
      symbols: 'Definitions and reference IDs belong to a single inspection snapshot; no LSP or rename command is shipped.',
      diagnose: 'The report is offline and reflects the actual running executable, not native compilation support.',
      ast: 'AST output is human-readable parser debug text, not stable JSON or a substitute for type verification.'
    }
  },
  hi: {
    heading: 'Compiler version के अनुसार सही command खोजें',
    intro: 'अपने इंस्टॉल किए हुए प्रकाशित compiler का version और काम चुनें।',
    version: 'इंस्टॉल किया हुआ compiler release',
    task: 'आप क्या करना चाहते हैं?',
    supported: 'इस प्रकाशित version में उपलब्ध',
    unavailable: 'इस प्रकाशित version में उपलब्ध नहीं',
    first: 'पहली बार प्रकाशित:',
    command: 'सत्यापित command का रूप',
    copy: 'Commands कॉपी करें',
    copied: 'कॉपी हो गया',
    copyFailed: 'कॉपी नहीं हो पाया। Command text चुनकर स्वयं कॉपी करें।',
    reference: 'इसी सुविधा की प्रकाशित documentation पढ़ें',
    missing: 'इस काम के लिए नया प्रकाशित compiler चुनें। पुराने binary में ये commands चलाने का दावा नहीं है।',
    warning: 'Website आपके इंस्टॉल किए compiler को पहचान नहीं सकती। scarp version जाँचें; पुराने उदाहरणों की हर release में compatibility की गारंटी नहीं है।',
    notes: {
      'legacy-run': 'Alpha.3 से पहले run प्रयोग करें। पुराना check runtime के कुछ भाग चलाता है; यह static verify नहीं है।',
      exec: 'Exec, Scarp interpreter से चलता है; native executable compilation नहीं करता।',
      verify: 'Verify सामान्य program statements चलाए बिना source और imports की static जाँच करता है।',
      project: 'Create नया directory बनाता है; पुराने folder को overwrite नहीं करता। Launch interpreter से entrypoint चलाता है।',
      modules: 'Project inspection में स्पष्ट Scarp.project directory चाहिए। यह program statements नहीं चलाता।',
      symbols: 'Symbols और references की IDs केवल एक snapshot के लिए हैं; LSP या rename command शामिल नहीं है।',
      diagnose: 'Offline report असली चल रहे executable का विवरण देती है; native compilation का दावा नहीं है।',
      ast: 'AST output parser का debug text है, stable JSON या type checking का विकल्प नहीं।'
    }
  }
} as const
