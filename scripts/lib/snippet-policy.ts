import { extractCodeFences } from './code-fences.ts'

export interface SnippetIssue {
  line: number
  message: string
}

/** Remove quoted strings and // comments, preserving newlines and offsets. */
function withoutStringsAndComments(source: string): string {
  return source.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*/g, match => match.replace(/[^\n]/g, ' '))
}

/**
 * Scope this guard to executable Scarp examples and actual shell commands.
 * A historical syntax explanation in prose or a text fence is not executable.
 * The pinned interpreter conformance suite remains the source of truth for
 * semantic correctness; this gate only catches known unsupported spellings.
 */
export function checkSnippetPolicy(markdown: string): SnippetIssue[] {
  const issues: SnippetIssue[] = []
  // Only explicitly tagged release pages can teach commands introduced in alpha.3/alpha.4.
  // Generic or older-release source examples must not silently advertise new CLI verbs.
  const alpha3Cli = markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.3 -->')
  // The bilingual upgrade guide spans alpha.3 and alpha.4, but only the
  // published alpha.4 side demonstrates new project verbs.
  const alpha18Cli = ['v0.0.6-alpha.18', 'v0.0.6-alpha.19', 'v0.0.6-alpha.20', 'v0.0.7-alpha.1', 'v0.0.7-alpha.2'].some(tag =>
    markdown.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
  const nativeObjectCli = markdown.includes('<!-- scarp-cli-release: v0.0.7-alpha.2 -->')
  const alpha10Cli = alpha18Cli ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.17 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.10 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.11 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.12 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.13 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.14 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.15 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.16 -->')
  const alpha9Cli = alpha10Cli || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.9 -->')
  const alpha8Cli = alpha9Cli || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.8 -->')
  const alpha6Cli = alpha8Cli || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.1 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.2 -->') ||
    markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.3 -->')
    || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.4 -->')
    || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.5 -->')
    || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.6 -->')
    || markdown.includes('<!-- scarp-cli-release: v0.0.6-alpha.7 -->')
  const alpha5Cli = alpha6Cli || markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.5 -->')
  const alpha4Cli = alpha5Cli ||
    markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.4 -->') ||
    markdown.includes('<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->')
  for (const fence of extractCodeFences(markdown)) {
    const code = fence.code.replace(/\r\n?/g, '\n')
    if (fence.language === 'scarp') {
      const stripped = withoutStringsAndComments(code)
      for (const [i, line] of stripped.split('\n').entries()) {
        if (/^\s*let(?:\s+mut)?\s+[A-Za-z_][\w]*\s*=/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'legacy let declaration; use bind or var in current Scarp source' })
        }
        if (/^\s*(?:fn|function)\s+[A-Za-z_][\w]*\s*\(/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'unsupported function declaration; use typed funcra' })
        }
        if (!alpha8Cli && /^\s*assert\s*\(/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'native assertions require published alpha.8' })
        }
      }
    }
    if (['sh', 'shell', 'bash'].includes(fence.language)) {
      for (const [i, line] of code.split('\n').entries()) {
        // A project directory is an alpha.5-only target for static module
        // inspection; alpha.4 exposes inspection of individual source files.
        if (!alpha6Cli && /^\s*(?:\$\s*)?scarp inspect (?:symbols|references)\b/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'symbol navigation requires published alpha.6' })
          continue
        }
        if (!alpha5Cli &&
            /^\s*(?:\$\s*)?scarp inspect modules --json (?:hello-scarp|hello-world|DIRECTORY)\s*$/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'project module inspection requires published alpha.5' })
          continue
        }
        if (!alpha9Cli && /^\s*(?:\$\s*)?scarp test\b/.test(line) && line.includes('--json=v2')) {
          issues.push({ line: fence.line + i + 1, message: 'test JSON v2 requires published alpha.9' })
          continue
        }
        if (!alpha10Cli && /^\s*(?:\$\s*)?scarp (?:exec|run|launch) --interactive\b/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'interactive CLI input requires published alpha.10' })
          continue
        }
        if (!alpha18Cli && /^\s*(?:\$\s*)?scarp exec\s*$/.test(line)) {
          issues.push({ line: fence.line + i + 1,
            message: 'zero-argument scarp exec requires published alpha.18' })
          continue
        }
        if (!nativeObjectCli && /^\s*(?:\$\s*)?scarp native-object\b/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'native-object requires published v0.0.7-alpha.2' })
          continue
        }
        const command = /^\s*(?:\$\s*)?scarp\s+(build|compile|create|launch|exec|verify|inspect|init|test|project)\b/.exec(line)
        if (command && (!(
          (['exec', 'verify', 'inspect'].includes(command[1]) && (alpha3Cli || alpha4Cli)) ||
          (['create', 'launch'].includes(command[1]) && alpha4Cli) ||
          (['init', 'test', 'project'].includes(command[1]) && alpha8Cli)
        ))) {
          issues.push({ line: fence.line + i + 1, message: 'unsupported Scarp CLI command for this documented release' })
        }
      }
    }
  }
  return issues
}
