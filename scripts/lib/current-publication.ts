import assert from 'node:assert/strict'

/**
 * Source history is immutable evidence, not a menu of supported compilers.
 * Only explicitly reviewed current or clearly labeled development-preview pages enter public navigation/search/SEO.
 * Retired URLs retain noindex legacy pages so bookmarks do not become 404s.
 */
export function isActiveDocumentationSource(source: string, currentTag: string): boolean {
  assert.match(currentTag, /^v\d+\.\d+\.\d+-(?:alpha|beta|rc)\.\d+$/,
    'A published compiler prerelease is required for the current docs')
  const name = source.startsWith('hi/') ? source.slice(3) : source
  const active = new Set([
    'index.md',
    'guide/current.md',
    'guide/install-latest.md',
    'reference/current.md',
    'community/social.md',
    'community/contributing.md',
    'project/deployments.md',
    'releases/' + currentTag + '.md'
  ])
  if(currentTag==='v0.0.6-alpha.20') {
    active.add('guide/alpha20-language.md')
    active.add('guide/alpha20-systems.md')
    active.add('guide/alpha20-types.md')
  }
  // The focused lesson is only current while its exact compiler tag is current.
  if(currentTag==='v0.0.6-alpha.18') active.add('guide/exec-and-lifetime-alpha18.md')
  return active.has(name)
}

export function currentDocumentationSources(
  sources: readonly string[], currentTag: string): string[] {
  const pages = sources.filter(source=>isActiveDocumentationSource(source,currentTag))
  const en = pages.filter(source=>!source.startsWith('hi/'))
  const hi = new Set(pages.filter(source=>source.startsWith('hi/')))
  assert.ok(en.length >= 7,'Current compiler docs need a minimum useful English page set')
  assert.equal(en.length * 2,pages.length,'Every active English page must have a Hindi counterpart')
  for(const source of en) {
    assert.ok(hi.has('hi/'+source),'Missing live Hindi translation: '+source)
  }
  return pages
}
