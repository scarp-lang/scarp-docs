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
        if (/^\s*(?:\$\s*)?scarp\s+(?:build|compile|exec|verify|inspect)\b/.test(line)) {
          issues.push({ line: fence.line + i + 1, message: 'unsupported Scarp CLI command in a runnable shell example' })
        }
      }
    }
  }
  return issues
}
