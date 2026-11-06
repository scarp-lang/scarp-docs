import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/**
 * Enumerate published Markdown source files without generated VitePress assets.
 * Paths are POSIX-style because the same inventory drives canonical URLs in CI
 * on Linux and developers' local Windows machines.
 */
export function documentationPages(docsRoot: string): string[] {
  function walk(folder: string): string[] {
    return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
      if (entry.name.startsWith('.')) return []
      const absolute = join(folder, entry.name)
      if (entry.isDirectory()) return walk(absolute)
      return entry.isFile() && entry.name.endsWith('.md')
        ? [relative(docsRoot, absolute).split(sep).join('/')]
        : []
    })
  }
  return walk(docsRoot).sort()
}
