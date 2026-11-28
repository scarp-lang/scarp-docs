/**
 * Browser-safe validation and search for Scarp's static documentation index.
 * The module is shared by the built browser bundle and Node-side tests. It
 * never touches the DOM, network, storage, or process-global configuration.
 */
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
const MAX_TOTAL_TEXT = 12_000_000
const MAX_QUERY = 512
const MAX_CLAUSES = 24
const MAX_CLAUSE_LENGTH = 120
const DEFAULT_LIMIT = 18
const MAX_RESULTS = 50

type SearchField = 'any' | 'title' | 'section' | 'body'
export interface SearchClause {
  readonly text: string
  readonly field: SearchField
  readonly exclude: boolean
  readonly phrase: boolean
}
export interface SearchQuery {
  readonly clauses: readonly SearchClause[]
  readonly positive: number
  readonly truncated: boolean
}
export interface DocumentationSearchResult {
  readonly entry: SearchEntry
  readonly score: number
  readonly preview: string
  readonly titleHit: boolean
}
export interface SearchOptions {
  readonly locale: 'en' | 'hi'
  readonly limit?: number
  readonly previewLength?: number
}

/** Validate generated data before any route is used as an href. */
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

/** Reject corrupted data atomically; never display a partially trusted index. */
export function parseSearchIndex(input: unknown): SearchEntry[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_ENTRIES) {
    throw new TypeError('Invalid local search index size')
  }
  const seen = new Set<string>()
  const entries: SearchEntry[] = []
  let total = 0
  for (const entry of input) {
    if (!isEntry(entry)) throw new TypeError('Invalid local search entry')
    total += entry.route.length + entry.title.length + entry.section.length + entry.excerpt.length
    if (total > MAX_TOTAL_TEXT) throw new TypeError('Local search index exceeds text budget')
    if (seen.has(entry.route)) throw new TypeError('Duplicate local search route')
    seen.add(entry.route)
    entries.push({
      route: entry.route, title: entry.title, locale: entry.locale,
      section: entry.section, excerpt: entry.excerpt
    })
  }
  return entries
}

/** NFKC handles compatibility punctuation without destroying Hindi matras. */
function fold(input: string): string {
  return input.normalize('NFKC').toLocaleLowerCase('und')
}

/**
 * Query grammar:
 *   term term             AND across terms
 *   "exact phrase"        contiguous words, including punctuation
 *   -term                 exclude documents containing a term
 *   title:term            search title only
 *   body:"some phrase"    search documentation content only
 *   section:tooling       filter documentation section
 *   in:language           alias for section:language
 *
 * Mixed English/Hindi is supported. Quotes are optional on an unmatched tail;
 * malformed or oversized input degrades to a bounded, safe search, never a
 * thrown error or unexpectedly broad all-documents result.
 */
export function parseDocumentationQuery(input: string): SearchQuery {
  if (typeof input !== 'string') throw new TypeError('Search query must be text')
  const source = input.slice(0, MAX_QUERY)
  const clauses: SearchClause[] = []
  let positive = 0
  let cursor = 0
  while (cursor < source.length && clauses.length < MAX_CLAUSES) {
    while (cursor < source.length && /\s/u.test(source[cursor]!)) cursor++
    if (cursor >= source.length) break
    const start = cursor
    let exclude = false
    if (source[cursor] === '-' && cursor + 1 < source.length &&
        !/\s/u.test(source[cursor + 1]!)) {
      exclude = true
      cursor++
    }
    let field: SearchField = 'any'
    const scope = /^(title|body|section|in):/iu.exec(source.slice(cursor))
    if (scope) {
      field = scope[1]!.toLocaleLowerCase() === 'in' ? 'section'
        : scope[1]!.toLocaleLowerCase() as SearchField
      cursor += scope[0].length
    }
    let phrase = false
    let raw = ''
    if (source[cursor] === '"') {
      phrase = true
      cursor++
      while (cursor < source.length && source[cursor] !== '"') {
        raw += source[cursor++]
      }
      if (source[cursor] === '"') cursor++
    } else {
      while (cursor < source.length && !/\s/u.test(source[cursor]!)) {
        raw += source[cursor++]
      }
    }
    // A dangling prefix or a bare '-' must not cause an endless loop.
    if (cursor === start) cursor++
    const term = fold(raw.trim().slice(0, MAX_CLAUSE_LENGTH))
    // Standalone punctuation is not a meaningful search or a valid filter.
    if (!term || !/[\p{L}\p{N}]/u.test(term)) continue
    clauses.push({text:term, field, exclude, phrase})
    if (!exclude) positive++
  }
  return {
    clauses, positive,
    truncated: input.length > MAX_QUERY || clauses.length === MAX_CLAUSES &&
      source.slice(cursor).trim().length > 0
  }
}

interface IndexedPage {
  readonly entry: SearchEntry
  readonly title: string
  readonly section: string
  readonly body: string
}

// Only a single index per fetched JSON payload is typically live. Weak keys
// avoid retaining parsed copies when an index is replaced after a retry.
const indexCache = new WeakMap<readonly SearchEntry[], readonly IndexedPage[]>()
function indexedPages(entries: readonly SearchEntry[]): readonly IndexedPage[] {
  const cached = indexCache.get(entries)
  if (cached) return cached
  const indexed = entries.map(entry => ({
    entry, title: fold(entry.title), section: fold(entry.section),
    body: fold(entry.excerpt)
  }))
  indexCache.set(entries, indexed)
  return indexed
}

function isWordBoundary(text: string, index: number): boolean {
  if (index <= 0) return true
  const previous = Array.from(text.slice(0, index)).at(-1)
  return previous === undefined || !/[\p{L}\p{N}\p{M}_]/u.test(previous)
}

function fieldScore(source: string, needle: string, base: number): number {
  const position = source.indexOf(needle)
  if (position === -1) return 0
  // Exact > prefix > word boundary > substring. Cap repeated occurrence
  // counting to keep a page with repeated boilerplate from dominating rank.
  let points = base
  if (source === needle) points += base * 2
  else if (position === 0) points += Math.round(base * 0.9)
  else if (isWordBoundary(source, position)) points += Math.round(base * 0.35)
  let repeats = 0
  let at = position + needle.length
  while (at < source.length && repeats < 3) {
    const next = source.indexOf(needle, at)
    if (next === -1) break
    repeats++
    at = next + Math.max(needle.length, 1)
  }
  return points + repeats * Math.min(4, Math.round(base / 16))
}

interface MatchResult { score: number; titleHit: boolean; bodyPositions: number[] }
function scorePage(page: IndexedPage, query: SearchQuery): MatchResult | null {
  let score = 0
  let titleHit = false
  const positions: number[] = []
  for (const clause of query.clauses) {
    const {field, text, exclude} = clause
    const title = field === 'any' || field === 'title'
      ? fieldScore(page.title, text, 120) : 0
    const section = field === 'any' || field === 'section'
      ? fieldScore(page.section, text, field === 'section' ? 100 : 10) : 0
    const body = field === 'any' || field === 'body'
      ? fieldScore(page.body, text, 6) : 0
    const matched = title > 0 || section > 0 || body > 0
    if (exclude) {
      if (matched) return null
      continue
    }
    if (!matched) return null
    titleHit ||= title > 0
    // Highest field wins; avoid double counting mirrored title in body.
    score += Math.max(title, section, body)
    if (body) positions.push(page.body.indexOf(text))
  }
  return {score, titleHit, bodyPositions:positions}
}

/**
 * Extract a Unicode code-point bounded context window for display.
 * Strings used for searching may differ in UTF-16 length after NFKC folding;
 * locate the raw match first, then fall back to normalized search position.
 */
export function searchPreview(content: string, query: string, maxLength = 160): string {
  const budget = Number.isInteger(maxLength) ? Math.max(24, Math.min(500, maxLength)) : 160
  const characters = Array.from(content)
  if (characters.length <= budget) return content
  const parsed = parseDocumentationQuery(query)
  const terms = parsed.clauses.filter(clause => !clause.exclude && clause.field !== 'section')
    .map(clause => clause.text)
  const folded = fold(content)
  let first = Number.POSITIVE_INFINITY
  for (const term of terms) {
    const rawAt = content.toLocaleLowerCase().indexOf(term)
    const at = rawAt >= 0 ? rawAt : folded.indexOf(term)
    if (at >= 0) first = Math.min(first, at)
  }
  const anchor = Number.isFinite(first) ? Array.from(content.slice(0, first)).length : 0
  const start = Math.max(0, Math.min(anchor - Math.min(48, Math.floor(budget / 3)),
    characters.length - budget))
  const end = Math.min(characters.length, start + budget)
  return (start ? '…' : '') + characters.slice(start, end).join('').trim() +
    (end < characters.length ? '…' : '')
}

/**
 * Search the current locale only. Ranking is deterministic across browsers and
 * deliberately independent of runtime locale collation implementations.
 * The caller should pass output through textContent, never innerHTML.
 */
export function searchDocumentation(
  entries: readonly SearchEntry[], queryText: string, options: SearchOptions
): DocumentationSearchResult[] {
  if (options.locale !== 'en' && options.locale !== 'hi') {
    throw new TypeError('Unsupported documentation locale')
  }
  const query = parseDocumentationQuery(queryText)
  // Exclusion-only and empty queries return no results to avoid accidentally
  // revealing the entire corpus for '-' or '-something'.
  if (query.positive === 0) return []
  const requested = options.limit ?? DEFAULT_LIMIT
  const limit = Number.isFinite(requested)
    ? Math.max(0, Math.min(MAX_RESULTS, Math.trunc(requested))) : DEFAULT_LIMIT
  if (limit === 0) return []
  const found: DocumentationSearchResult[] = []
  for (const page of indexedPages(entries)) {
    if (page.entry.locale !== options.locale) continue
    const match = scorePage(page, query)
    if (!match) continue
    const preview = searchPreview(page.entry.excerpt, queryText, options.previewLength)
    found.push({entry:page.entry, score:match.score,
      titleHit:match.titleHit, preview})
  }
  // Routes form a stable tie breaker independent of source ordering.
  found.sort((a,b)=>b.score-a.score ||
    (a.entry.route < b.entry.route ? -1 : a.entry.route > b.entry.route ? 1 : 0))
  return found.slice(0, limit)
}
