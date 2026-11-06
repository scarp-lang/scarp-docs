import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AxeResults } from 'axe-core'
import type { Page } from 'playwright'

/**
 * Automated WCAG A/AA signals only. axe-core cannot replace manual testing
 * with screen readers, keyboard-only users, platform zoom or assistive tech.
 *
 * Bundles axe locally from devDependencies and injects it into the *extracted*
 * offline documentation browser session. No CDN or remote API is used.
 */
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const axeBundle = join(root, 'node_modules', 'axe-core', 'axe.min.js')
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

type AccessibilityViolation = Pick<AxeResults['violations'][number],
  'id' | 'impact' | 'description' | 'help' | 'helpUrl' | 'nodes'>

export interface AuditReport {
  label: string
  url: string
  violations: AccessibilityViolation[]
  incomplete: number
  passes: number
}

export async function auditOfflineAccessibility(
  page: Page, label: string, output: string
): Promise<{ passes: number; violations: number }> {
  // Script injection via Playwright avoids network access and runs the
  // exact pinned axe-core package shipped in our repository's CI installs.
  await page.addScriptTag({ path: axeBundle })
  const results: AxeResults = await page.evaluate(async (requiredTags) => {
    const axe = (window as unknown as {
      axe: {
        run: (
          root: Document,
          options: { runOnly: { type: 'tag'; values: string[] } }
        ) => Promise<AxeResults>
      }
    }).axe
    return axe.run(document, { runOnly: { type: 'tag', values: requiredTags } })
  }, tags)

  const summary: AuditReport = {
    label,
    url: page.url(),
    violations: results.violations.map(({ id, impact, description, help, helpUrl, nodes }) => ({
      id, impact, description, help, helpUrl,
      nodes: nodes.map(({ target, html, failureSummary, impact: nodeImpact }) => ({
        target, html, failureSummary, impact: nodeImpact
      })) as AxeResults['violations'][number]['nodes']
    })),
    incomplete: results.incomplete.length,
    passes: results.passes.length
  }
  mkdirSync(output, { recursive: true })
  writeFileSync(join(output, label + '.json'), JSON.stringify(summary, null, 2) + '\n')
  if (results.violations.length) {
    // Keep detailed browser evidence in CI even when the downloadable JSON
    // artifact needs a GitHub sign-in. Helps diagnose visible-label mismatches.
    const searchTrigger = page.locator('button.DocSearch-Button').first()
    if (await searchTrigger.count()) {
      const evidence = await searchTrigger.evaluate(button => ({
        outerHTML: button.outerHTML.slice(0, 1700),
        textContent: button.textContent,
        innerText: (button as HTMLElement).innerText,
        accessibleLabel: button.getAttribute('aria-label'),
        placeholder: (button.querySelector('.DocSearch-Button-Placeholder') as HTMLElement | null)?.innerText,
        keycaps: (button.querySelector('.DocSearch-Button-Keys') as HTMLElement | null)?.innerText
      }))
      console.error('A11Y_SEARCH_TRIGGER '+label+' '+JSON.stringify(evidence))
    }
    const descriptions = results.violations.map(v =>
      v.id + ' (' + (v.impact ?? 'unspecified') + '): ' +
      v.nodes.slice(0, 3).map(n =>
        n.target.join(' ') + ' [' +
        (n.failureSummary ?? 'No failure summary').replace(/\\s+/g, ' ').slice(0, 450) +
        '] ' + n.html.slice(0, 400)
      ).join(', ')
    )
    throw new Error('Accessibility audit failed for ' + label +
      ': ' + descriptions.join(' | ') + '. See artifacts/browser-a11y/' + label + '.json')
  }
  return { passes: results.passes.length, violations: results.violations.length }
}
