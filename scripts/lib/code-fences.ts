/**
 * Small CommonMark-style fenced-code scanner for the bilingual docs checker.
 * It intentionally ignores indented code blocks: the docs use fenced examples.
 */
export interface CodeFence {
  language: string
  code: string
  line: number
}

export function extractCodeFences(markdown: string): CodeFence[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: CodeFence[] = []
  let opened: { marker: '`' | '~'; size: number; language: string; line: number } | null = null
  let body: string[] = []

  for (const [index, line] of lines.entries()) {
    if (opened !== null) {
      const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line)
      if (close && close[1][0] === opened.marker && close[1].length >= opened.size) {
        blocks.push({
          language: opened.language,
          code: body.join('\n').trim(),
          line: opened.line
        })
        opened = null
        body = []
      } else {
        body.push(line)
      }
      continue
    }

    const start = /^ {0,3}(`{3,}|~{3,})([^\n]*)$/.exec(line)
    if (!start) continue
    const marker = start[1][0] as '`' | '~'
    const info = start[2].trim()
    // Backticks inside the info string invalidate a backtick-fenced opener.
    if (marker === '`' && info.includes('`')) continue
    opened = {
      marker,
      size: start[1].length,
      language: info.split(/\s+/)[0] ?? '',
      line: index + 1
    }
  }

  if (opened !== null) throw new Error(`Unclosed code fence at line ${opened.line}`)
  return blocks
}

/**
 * Hindi pages may include additional translated demonstrations, but they must
 * retain every English example, including duplicates, in its original order.
 * Returns the zero-based index of the first missing source block, or -1.
 */
export function firstMissingCodeBlock(source: readonly CodeFence[], localized: readonly CodeFence[]): number {
  let next = 0
  for (let i = 0; i < source.length; i++) {
    const example = source[i]
    while (next < localized.length &&
      (localized[next].code !== example.code || localized[next].language !== example.language)) {
      next++
    }
    if (next === localized.length) return i
    next++
  }
  return -1
}
