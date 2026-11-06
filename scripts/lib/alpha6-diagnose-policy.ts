import { extractCodeFences, firstMissingCodeBlock } from './code-fences.ts'

export interface DiagnosePages {
  en: string
  hi: string
  config: string
  cliEn: string
  cliHi: string
  installEn: string
  installHi: string
  troubleEn: string
  troubleHi: string
  releaseEn: string
  releaseHi: string
  readme: string
}

export const DIAGNOSE_RELEASE = 'v0.0.6-alpha.1' as const
export const DIAGNOSE_SOURCE = 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8' as const

/** This exact key/type inventory comes from the tagged alpha.6 src/main.rs. */
export const DIAGNOSE_FIELDS = {
  schema_version: 'integer',
  version: 'string',
  host_os: 'string',
  host_arch: 'string',
  execution: 'string',
  static_verify: 'boolean',
  module_inspection: 'boolean',
  project_workflow: 'boolean',
  native_executable: 'boolean',
  package_manager: 'boolean'
} as const

const commands: ReadonlyArray<[string,string]> = [
  ['sh', 'scarp version\nscarp guide diagnose\nscarp diagnose\nscarp diagnose --json'],
  ['powershell', '.\\scarp.exe diagnose --json'],
  ['sh', './scarp diagnose --json']
]

export function validateDiagnoseDocs(pages: DiagnosePages): string[] {
  const errors: string[] = []
  const requireText = (where: string, text: string, token: string): void => {
    if (!text.includes(token)) errors.push(where + ': missing ' + token)
  }

  for (const [locale, content, prefix] of [
    ['English', pages.en, ''],
    ['Hindi', pages.hi, '/hi']
  ] as const) {
    if (!content.startsWith('# ')) errors.push(locale + ': expected top-level heading')
    for (const required of [
      '<!-- scarp-cli-release: ' + DIAGNOSE_RELEASE + ' -->',
      '<!-- scarp-diagnose-compiler: ' + DIAGNOSE_SOURCE + ' -->',
      DIAGNOSE_SOURCE,
      'https://github.com/scarp-lang/scarp/releases/tag/' + DIAGNOSE_RELEASE,
      'https://github.com/scarp-lang/scarp/blob/' + DIAGNOSE_RELEASE + '/src/main.rs',
      'scarp 0.0.6-alpha.1',
      'scarp diagnose --json',
      'scarp diagnose --format=json',
      'exit code 2',
      'PATH',
      'stdout',
      'stderr',
      'cargo build',
      'Scarp.project',
      'native_executable',
      'package_manager',
      '](' + prefix + '/guide/installation-alpha6)',
      '](' + prefix + '/tooling/cli-alpha6)',
      '](' + prefix + '/tooling/inspect-ast-alpha6)',
      '](' + prefix + '/tutorials/project-symbol-navigation-alpha6)',
      '](' + prefix + '/tooling/troubleshooting)'
    ]) requireText(locale,content,required)

    for (const [field,kind] of Object.entries(DIAGNOSE_FIELDS)) {
      requireText(locale,content,'`'+field+'`')
      requireText(locale,content,'| `'+field+'` | '+kind+' |')
    }
    if (locale === 'Hindi' && (content.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 300) {
      errors.push('Hindi: translated capability tutorial has insufficient Hindi content')
    }
    try {
      const blocks = extractCodeFences(content)
      if (blocks.length !== commands.length) errors.push(locale + ': unexpected code fence inventory')
      for (const [index,[lang,code]] of commands.entries()) {
        if (blocks[index]?.language !== lang || blocks[index]?.code !== code) {
          errors.push(locale + ': tagged diagnose command fence #' + (index+1) + ' changed')
        }
      }
    } catch (cause) {
      errors.push(locale + ': invalid code fences: ' + String(cause))
    }
  }
  try {
    if (firstMissingCodeBlock(extractCodeFences(pages.en),extractCodeFences(pages.hi)) !== -1) {
      errors.push('Hindi: translated page changed executable command examples')
    }
  } catch(cause) { errors.push('Bilingual diagnose code-fence scan failed: '+String(cause)) }

  for(const [locale,prefix,cli,install,troubleshoot,release] of [
    ['English','',pages.cliEn,pages.installEn,pages.troubleEn,pages.releaseEn],
    ['Hindi','/hi',pages.cliHi,pages.installHi,pages.troubleHi,pages.releaseHi]
  ] as const) {
    const link=prefix+'/tooling/diagnose-alpha6'
    requireText(locale+' config',pages.config,"link: '"+link+"'")
    for (const [where,content] of [
      ['CLI',cli],['installation',install],['troubleshooting',troubleshoot],['release',release]
    ] as const) requireText(locale+' '+where,content,']('+link+')')
  }
  requireText('README',pages.readme,'docs/tooling/diagnose-alpha6.md')
  requireText('README',pages.readme,'docs/hi/tooling/diagnose-alpha6.md')
  return errors
}
