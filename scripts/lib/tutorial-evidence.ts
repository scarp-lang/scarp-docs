import { extractCodeFences } from './code-fences.ts'

export interface SupportingSource {
  name: string
  source: string
}

export interface ExecutableExample {
  name: string
  source: string
  expected: string
  supportingSources?: readonly SupportingSource[]
}

const normalized = (value: string): string => value.replace(/\r\n?/g, '\n').trim()

/**
 * Verify the complete contents of each published fixture, not just a
 * representative snippet. For multi-file programs, dependencies must appear
 * in manifest order before the entry-point source. This detects an omitted,
 * altered or reordered companion file in either language.
 *
 * Explanatory prose and non-Scarp/non-output fences (such as CLI commands)
 * are permitted between the entry-point source and the expected stdout.
 */
export function verifyTutorialExamples(markdown: string, cases: readonly ExecutableExample[]): string[] {
  const fences = extractCodeFences(markdown)
  const problems: string[] = []
  let cursor = 0

  for (const example of cases) {
    for (const support of example.supportingSources ?? []) {
      const index = fences.findIndex((fence, position) =>
        position >= cursor && fence.language === 'scarp' && fence.code === normalized(support.source)
      )
      if (index === -1) {
        problems.push(`${example.name}: missing, modified, or out-of-order supporting source ${support.name}`)
        continue
      }
      cursor = index + 1
    }

    const sourceIndex = fences.findIndex((fence, position) =>
      position >= cursor && fence.language === 'scarp' && fence.code === normalized(example.source)
    )
    if (sourceIndex === -1) {
      problems.push(`${example.name}: missing, modified, or out-of-order Scarp source fence`)
      continue
    }

    let outputIndex = sourceIndex + 1
    while (outputIndex < fences.length && fences[outputIndex].language !== 'scarp' &&
           fences[outputIndex].language !== 'text') {
      outputIndex++
    }
    const output = fences[outputIndex]
    if (!output || output.language !== 'text' || output.code !== normalized(example.expected)) {
      problems.push(`${example.name}: missing, modified, or misplaced expected stdout fence`)
      cursor = sourceIndex + 1
      continue
    }
    cursor = outputIndex + 1
  }

  return problems
}
