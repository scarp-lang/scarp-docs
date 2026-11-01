/**
 * Typed, read-only GitHub Actions client. This counts *successful* deployments,
 * never commits or workflow attempts that failed/cancelled.
 */
export const PAGES_HISTORY_URL = 'https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml' as const
export const SUCCESSFUL_RUNS_ENDPOINT = 'https://api.github.com/repos/scarp-lang/scarp-docs/actions/workflows/pages.yml/runs?status=success&per_page=1' as const

export type FetchResponse = Pick<Response, 'ok' | 'status' | 'json'>
export type Fetcher = (url: string, init: RequestInit) => Promise<FetchResponse>

/** Never trust an API response merely because HTTP status is 200. */
export function readSuccessfulRunCount(value: unknown): number {
  if (typeof value !== 'object' || value === null || !('total_count' in value)) {
    throw new TypeError('Missing GitHub workflow count')
  }
  const count = value.total_count
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new TypeError('Invalid GitHub workflow count')
  }
  return count
}

/**
 * Fetch the successful workflow total with a bounded lifetime; no API token,
 * fallback number, cookies or analytics are needed for a public count.
 * A caller can inject a mock Fetcher in offline tests.
 */
export async function getSuccessfulRunCount(
  fetcher: Fetcher = (url, options) => fetch(url, options),
  timeoutMs = 8000
): Promise<number> {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) {
    throw new RangeError('Timeout must be between 1 and 30000 milliseconds')
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(SUCCESSFUL_RUNS_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`)
    return readSuccessfulRunCount(await response.json())
  } finally {
    clearTimeout(timer)
  }
}

export type UiLocale = 'en' | 'hi'
export interface DeploymentLabels {
  heading: string
  loading: string
  unavailable: string
  explanation: string
  history: string
  retry: string
  refresh: string
}

const LABELS: Record<UiLocale, DeploymentLabels> = {
  en: {
    heading: 'Successful GitHub Pages deployments',
    loading: 'Loading deployment count from GitHub…',
    unavailable: 'Count currently unavailable',
    explanation: 'Live count of successful Pages workflow runs, not a manually entered number.',
    history: 'View complete deployment history',
    retry: 'Try again',
    refresh: 'Refresh count'
  },
  hi: {
    heading: 'सफल GitHub Pages डिप्लॉयमेंट',
    loading: 'GitHub से डिप्लॉयमेंट की संख्या लोड हो रही है…',
    unavailable: 'अभी संख्या उपलब्ध नहीं है',
    explanation: 'यह सफल Pages workflow runs की संख्या है, हाथ से दर्ज किया गया अंक नहीं।',
    history: 'पूरी डिप्लॉयमेंट सूची देखें',
    retry: 'दोबारा प्रयास करें',
    refresh: 'संख्या अपडेट करें'
  }
}
export function deploymentLabels(lang: string): DeploymentLabels {
  return LABELS[lang.toLowerCase().startsWith('hi') ? 'hi' : 'en']
}
