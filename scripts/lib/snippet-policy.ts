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
  const alpha4Cli = markdown.includes('<!-- scarp-cli-release: v0.0.5-alpha.4 -->') ||
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
      }
    }
    if (['sh', 'shell', 'bash'].includes(fence.language)) {
      for (const [i, line] of code.split('\n').entries()) {
        const command = /^\s*(?:\$\s*)?scarp\s+(build|compile|create|launch|exec|verify|inspect)\b/.exec(line)
        if (command && (!(
          (['exec', 'verify', 'inspect'].includes(command[1]) && (alpha3Cli || alpha4Cli)) ||
          (['create', 'launch'].includes(command[1]) && alpha4Cli)
        ))) {
          issues.push({ line: fence.line + i + 1, message: 'unsupported Scarp CLI command for this documented release' })
        }
      }
    }
  }
  return issues
}
