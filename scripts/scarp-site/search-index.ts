/** Browser-safe parser for the static search index. No network or DOM dependencies. */
export interface SearchEntry {
  route: string
  title: string
  locale: 'en' | 'hi'
  section: string
  excerpt: string
}

const BASE = '/scarp-docs/'
const MAX_ENTRIES = 4096
const MAX_TEXT = 1_000_000

function isEntry(value: unknown): value is SearchEntry {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  if (row.locale !== 'en' && row.locale !== 'hi') return false
  if (typeof row.route !== 'string' || row.route.length > 1024 ||
      !row.route.startsWith(BASE) || /[\\\s?#%]/u.test(row.route)) return false
  const segments = row.route.slice(BASE.length).split('/')
  if (segments.some((part, index) => part === '.' || part === '..' ||
      (!part && index !== segments.length - 1) || !/^[a-zA-Z0-9._-]*$/.test(part))) return false
  const hindi = row.route.startsWith(BASE + 'hi/')
  if (hindi !== (row.locale === 'hi')) return false
  if (typeof row.title !== 'string' || !row.title.trim() || row.title.length > 512) return false
  if (typeof row.section !== 'string' || !row.section.trim() || row.section.length > 128) return false
  return typeof row.excerpt === 'string' && row.excerpt.length <= MAX_TEXT
}

/** Fail closed, rather than rendering a partial or untrusted index. */
export function parseSearchIndex(input: unknown): SearchEntry[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_ENTRIES) {
    throw new TypeError('Invalid local search index size')
  }
  const seen = new Set<string>()
  const entries: SearchEntry[] = []
  for (const entry of input) {
    if (!isEntry(entry)) throw new TypeError('Invalid local search entry')
    if (seen.has(entry.route)) throw new TypeError('Duplicate local search route')
    seen.add(entry.route)
    entries.push({
      route: entry.route, title: entry.title, locale: entry.locale,
      section: entry.section, excerpt: entry.excerpt
    })
  }
  return entries
}
