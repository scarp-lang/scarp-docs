export interface CountClaim {
  label: string
  pattern: RegExp
  expected: number
}

/**
 * Validate documented fixture counts against manifest-derived numbers.
 * Patterns must capture the displayed decimal count as their first group.
 * Exactly one occurrence is required so stale or duplicated claims cannot hide.
 */
export function checkCountClaims(content: string, rules: readonly CountClaim[]): string[] {
  const errors: string[] = []
  for (const { label, pattern, expected } of rules) {
    const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
    const occurrences = [...content.matchAll(global)]
    if (occurrences.length !== 1) {
      errors.push(`${label}: expected one count claim, found ${occurrences.length}`)
      continue
    }
    const actualText = occurrences[0][1]
    const actual = Number(actualText)
    if (!/^\d+$/.test(actualText ?? '') || !Number.isSafeInteger(actual) || actual !== expected) {
      errors.push(`${label}: expected ${expected}, found ${actualText ?? '(missing capture)'}`)
    }
  }
  return errors
}
