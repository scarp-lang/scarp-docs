import { urlForPage } from '../../docs/.vitepress/site-meta.ts'

/**
 * Validate the complete generated sitemap against all English/Hindi source
 * pages. This deliberately compares exact <url><loc> entries, not substring
 * matches, which can accidentally accept missing pages or extra suffixes.
 */
export interface SitemapValidation {
  expected: number
  actual: number
  errors: string[]
}

export function validateSitemap(xml: string, sources: readonly string[]): SitemapValidation {
  const errors: string[] = []
  if (!/<urlset\b[^>]*>/i.test(xml) || !/<\/urlset\s*>/i.test(xml)) {
    errors.push('Missing complete sitemap urlset XML element')
  }
  const entries = [...xml.matchAll(/<url(?:\s[^>]*)?>([\s\S]*?)<\/url\s*>/gi)]
  const found: string[] = []
  for (const [index, match] of entries.entries()) {
    const locs = [...match[1].matchAll(/<loc\b[^>]*>\s*([^<]*?)\s*<\/loc\s*>/gi)]
    if (locs.length !== 1 || !locs[0][1].trim()) {
      errors.push('Sitemap URL entry ' + (index + 1) + ' must have exactly one nonempty <loc>')
      continue
    }
    // Decode the XML encoding used for & in legitimate URLs. Other XML
    // entities are deliberately not needed for Scarp's static source routes.
    found.push(locs[0][1].trim().replaceAll('&amp;', '&'))
  }
  if (entries.length !== (xml.match(/<url(?:\s[^>]*)?>/gi)?.length ?? 0)) {
    errors.push('Malformed or unclosed sitemap URL entries')
  }
  const expected = sources.map(urlForPage)
  const expectedSet = new Set(expected)
  if (expectedSet.size !== expected.length) errors.push('Duplicate source pages map to the same public URL')
  const foundSet = new Set(found)
  for (const url of foundSet) {
    if (!expectedSet.has(url)) errors.push('Unexpected sitemap URL: ' + url)
  }
  for (const url of expectedSet) {
    if (!foundSet.has(url)) errors.push('Missing sitemap URL: ' + url)
  }
  if (foundSet.size !== found.length) errors.push('Duplicate URLs exist in sitemap')
  if (entries.length === 0) errors.push('Sitemap contains no URL entries')
  return { expected: expectedSet.size, actual: entries.length, errors }
}
