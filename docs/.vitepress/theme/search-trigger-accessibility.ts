/**
 * VitePress 1.6 renders local-search button text and the visible "K" keycap
 * without an actual separating space (textContent is "SearchK"). Its separate
 * aria-label can violate WCAG "Label in Name" even when it says "Search K".
 *
 * When the button's visible placeholder is rendered, derive the accessible
 * name from its DOM text instead of overriding it with aria-label. At narrow
 * mobile sizes where the placeholder is visually hidden, keep a translated
 * aria-label from that same placeholder, so an icon-only button is named.
 *
 * No extra network, CSS hacks, or fork of VitePress is needed.
 */
let installed = false

export function installAccessibleSearchTrigger(): void {
  if (installed || typeof document === 'undefined' || !document.body) return
  installed = true

  const synchronizeLabels = (): void => {
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      'button.DocSearch-Button'
    )) {
      const placeholder = button.querySelector<HTMLElement>(
        '.DocSearch-Button-Placeholder'
      )
      if (!placeholder) continue
      const text = placeholder.textContent?.trim()
      if (!text) continue

      const visible = placeholder.getClientRects().length > 0 &&
        getComputedStyle(placeholder).display !== 'none' &&
        getComputedStyle(placeholder).visibility !== 'hidden'

      if (visible) {
        // The button's child text is now the true accessible name,
        // preserving the visible shortcut keycap verbatim.
        if (button.hasAttribute('aria-label')) button.removeAttribute('aria-label')
      } else if (button.getAttribute('aria-label') !== text) {
        // On mobile, Search/Hindi text is visually hidden and must be announced.
        button.setAttribute('aria-label', text)
      }
    }
  }

  // Vue renders/updates the search button after hydration and locale changes.
  // Observe relevant changes; the no-op checks above prevent mutation loops.
  const observer = new MutationObserver(synchronizeLabels)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-label']
  })
  window.addEventListener('resize', synchronizeLabels, { passive: true })
  synchronizeLabels()
}
