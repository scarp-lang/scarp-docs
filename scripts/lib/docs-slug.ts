/**
 * Preserve Unicode combining marks, especially Devanagari matras and nukta,
 * when normalizing Markdown heading anchors. Removing marks breaks Hindi links.
 */
export function documentationHeadingSlug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[\x60*_~]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}
