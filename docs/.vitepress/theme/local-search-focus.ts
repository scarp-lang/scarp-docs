/**
 * VitePress 1.6's built-in local search unmounts its dialog on Escape without
 * explicitly returning focus. Restore it to the trigger (or original focused
 * element) only if the browser otherwise leaves focus on the document body.
 *
 * Installed once in the browser through the default theme's enhanceApp hook.
 * Does not replace VitePress search, change the search index, or fetch anything.
 */
let installed = false

export function installLocalSearchFocusReturn(): void {
  if (installed || typeof document === 'undefined' || !document.body) return
  installed = true

  let previousFocus: HTMLElement | null = null
  let returnFocus: HTMLElement | null = null
  let dialogOpen = Boolean(document.querySelector('.VPLocalSearchBox'))

  // Capture the element that invoked the search before its input takes focus.
  document.addEventListener('focusin', event => {
    const target = event.target
    if (target instanceof HTMLElement &&
      !target.closest('.VPLocalSearchBox') &&
      target !== document.body &&
      target !== document.documentElement) {
      previousFocus = target
    }
  })

  const observer = new MutationObserver(() => {
    const nowOpen = Boolean(document.querySelector('.VPLocalSearchBox'))
    if (nowOpen === dialogOpen) return
    dialogOpen = nowOpen
    if (nowOpen) {
      const focused = document.activeElement
      returnFocus = focused instanceof HTMLElement && !focused.closest('.VPLocalSearchBox') &&
        focused !== document.body
        ? focused
        : previousFocus
      return
    }

    const initialTarget = returnFocus
    returnFocus = null
    requestAnimationFrame(() => {
      // Search reopened or route navigation explicitly moved focus: do not steal it.
      if (document.querySelector('.VPLocalSearchBox')) return
      const focused = document.activeElement
      if (focused instanceof HTMLElement && focused !== document.body &&
        focused !== document.documentElement && focused.isConnected) return

      const target = initialTarget?.isConnected
        ? initialTarget
        : document.querySelector<HTMLElement>('.VPNavBarSearch button.DocSearch-Button')
      target?.focus({ preventScroll: true })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
