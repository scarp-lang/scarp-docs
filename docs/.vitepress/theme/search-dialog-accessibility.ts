/**
 * VitePress 1.6 local-search popup currently renders its outer container with
 * role="button", aria-haspopup="listbox" and focusable nested search/results.
 * That produces nested-interactive and label-in-name WCAG axe violations.
 *
 * Expose the popup as a modal dialog with a translated name instead. The
 * internal input, result links and original VitePress keyboard handlers remain
 * unchanged. This targets VitePress 1.6.4 and should be rechecked on upgrades.
 */
let installed = false

export function installAccessibleSearchDialog(): void {
  if (installed || typeof document === 'undefined' || !document.body) return
  installed = true

  const synchronize = (): void => {
    const name = document.documentElement.lang.startsWith('hi')
      ? 'दस्तावेज़ खोजें'
      : 'Search documentation'

    for (const dialog of document.querySelectorAll<HTMLElement>('.VPLocalSearchBox')) {
      if (dialog.getAttribute('role') !== 'dialog') dialog.setAttribute('role', 'dialog')
      if (dialog.getAttribute('aria-modal') !== 'true') dialog.setAttribute('aria-modal', 'true')
      if (dialog.getAttribute('aria-label') !== name) dialog.setAttribute('aria-label', name)

      // These belong on expandable widgets, not on a modal dialog.
      if (dialog.hasAttribute('aria-expanded')) dialog.removeAttribute('aria-expanded')
      if (dialog.hasAttribute('aria-haspopup')) dialog.removeAttribute('aria-haspopup')
      if (dialog.hasAttribute('aria-labelledby')) dialog.removeAttribute('aria-labelledby')

      // VitePress applies aria-label to <kbd> arrow/Enter key glyphs.
      // A bare kbd has a generic role where aria-label is prohibited;
      // expose each pictogram as an explicitly labelled image instead.
      for (const key of dialog.querySelectorAll<HTMLElement>('kbd[aria-label]')) {
        if (key.getAttribute('role') !== 'img') key.setAttribute('role', 'img')
      }
    }
  }

  const observer = new MutationObserver(synchronize)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['role', 'aria-modal', 'aria-label', 'aria-expanded', 'aria-haspopup', 'aria-labelledby']
  })
  synchronize()
}
