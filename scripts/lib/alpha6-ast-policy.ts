import { extractCodeFences, firstMissingCodeBlock } from './code-fences.ts'
import { ALPHA6_REF, ALPHA6_SHA } from './alpha6-evidence.ts'

export interface AstGuidePages {
  en: string
  hi: string
  config: string
  cliEn: string
  cliHi: string
  troubleshootEn: string
  troubleshootHi: string
  releaseEn: string
  releaseHi: string
  readme: string
}

const codeBlocks = [
  {
    "language": "sh",
    "code": "scarp version\nscarp guide inspect ast\nscarp inspect ast examples/hello.srp\nscarp inspect tokens examples/hello.srp\nscarp verify examples/hello.srp"
  },
  {
    "language": "scarp",
    "code": "// My first Scarp program\nprint(\"Hello from Scarp!\");"
  },
  {
    "language": "text",
    "code": "print(1 + );"
  },
  {
    "language": "sh",
    "code": "scarp inspect ast --diagnostic-format=json broken.srp"
  }
] as const

export function validateAstGuide(pages: AstGuidePages): string[] {
  const failures: string[] = []
  const ensure = (where: string, source: string, text: string): void => {
    if (!source.includes(text)) failures.push(where + ': missing ' + text)
  }
  for (const [label, text, prefix] of [
    ['English', pages.en, ''],
    ['Hindi', pages.hi, '/hi']
  ] as const) {
    if (!text.startsWith('# ')) failures.push(label + ': no heading')
    for (const marker of [
      '<!-- scarp-cli-release: ' + ALPHA6_REF + ' -->',
      '<!-- scarp-ast-inspection: ' + ALPHA6_SHA + ' -->',
      '`' + ALPHA6_SHA + '`',
      'https://github.com/scarp-lang/scarp/releases/tag/' + ALPHA6_REF,
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/tests/scarp_inspect_ast.rs',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/src/main.rs',
      'https://github.com/scarp-lang/scarp/blob/' + ALPHA6_REF + '/examples/hello.srp',
      '](' + prefix + '/guide/installation-alpha6)',
      '](' + prefix + '/tooling/cli-alpha6)',
      '](' + prefix + '/reference/source-loading)',
      '](' + prefix + '/tooling/troubleshooting)'
    ]) ensure(label, text, marker)
    try {
      const actual = extractCodeFences(text)
      if (actual.length !== codeBlocks.length) {
        failures.push(label + ': expected four complete code blocks')
      }
      for (const [index, expected] of codeBlocks.entries()) {
        if (actual[index]?.language !== expected.language ||
            actual[index]?.code !== expected.code) {
          failures.push(label + ': changed published AST guide code block #' + (index + 1))
        }
      }
    } catch(e) { failures.push(label + ': malformed code fences: ' + String(e)) }
    for (const command of [
      'scarp inspect ast --json',
      'scarp ast FILE.srp',
      '--diagnostic-format=json',
      '--max-steps',
      'scarp inspect ast -- -source.srp',
      'exit code'
    ]) {
      if (command !== 'exit code' || label === 'Hindi') {
        ensure(label, text, command)
      }
    }
    if (label === 'English') {
      for (const warning of ['not stable', 'not JSON', 'not a stable', 'does not', 'exit code']) {
        // "exit code" may be absent from EN prose where codes are documented as "exit".
        if (warning !== 'exit code') ensure(label, text, warning)
      }
    } else if ((text.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 350) {
      failures.push('Hindi: insufficient translated AST explanation')
    }
  }
  try {
    if (firstMissingCodeBlock(extractCodeFences(pages.en),extractCodeFences(pages.hi)) !== -1) {
      failures.push('Hindi: code fences differ from English')
    }
  } catch(e) { failures.push('Bilingual AST fence error: ' + String(e)) }
  for (const [label,prefix,cli,troubleshoot,release] of [
    ['English','',pages.cliEn,pages.troubleshootEn,pages.releaseEn],
    ['Hindi','/hi',pages.cliHi,pages.troubleshootHi,pages.releaseHi]
  ] as const) {
    const path=prefix+'/tooling/inspect-ast-alpha6'
    ensure(label+' nav',pages.config,"link: '"+path+"'")
    ensure(label+' CLI',cli,']('+path+')')
    ensure(label+' troubleshooting',troubleshoot,']('+path+')')
    ensure(label+' release',release,']('+path+')')
  }
  ensure('README',pages.readme,'docs/tooling/inspect-ast-alpha6.md')
  ensure('README',pages.readme,'docs/hi/tooling/inspect-ast-alpha6.md')
  return failures
}
