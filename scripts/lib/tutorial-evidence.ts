import { extractCodeFences } from './code-fences.ts'

export interface ExecutableExample {
  name: string
  source: string
  expected: string
}

const normalized = (value: string): string => value.replace(/\r\n?/g, '\n').trim()

/**
 * Confirm that a published tutorial reproduces each compiler-owned example
 * and its stdout without edits. A source fence must be followed by the
 * corresponding stdout fence (ignoring explanatory prose between fences).
 * Extra unrelated fences may appear, but fixture pairs must stay in order.
 */
export function verifyTutorialExamples(markdown: string, cases: readonly ExecutableExample[]): string[] {
  const fences = extractCodeFences(markdown)
  const problems: string[] = []
  let cursor = 0

  for (const example of cases) {
    const wantSource = normalized(example.source)
    const wantOutput = normalized(example.expected)
    const sourceIndex = fences.findIndex((fence, index) =>
      index >= cursor && fence.language === 'scarp' && fence.code === wantSource
    )
    if (sourceIndex === -1) {
      problems.push(`${example.name}: missing, modified, or out-of-order Scarp source fence`)
      continue
    }
    const output = fences[sourceIndex + 1]
    if (!output || output.language !== 'text' || output.code !== wantOutput) {
      problems.push(`${example.name}: missing, modified, or misplaced expected stdout fence`)
      cursor = sourceIndex + 1
      continue
    }
    cursor = sourceIndex + 2
  }

  return problems
}
