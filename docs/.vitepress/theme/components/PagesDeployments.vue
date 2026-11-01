<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Public, read-only GitHub Actions API. No secret token, browser tracking, or
// fabricated static counter; failures leave a link to GitHub's source of truth.
const count = ref<number | null>(null)
const pending = ref(true)
const error = ref(false)
const historyUrl = 'https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml'
const endpoint = 'https://api.github.com/repos/scarp-lang/scarp-docs/actions/workflows/pages.yml/runs?status=success&per_page=1'

onMounted(async () => {
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/vnd.github+json' } })
    if (!response.ok) throw new Error(`GitHub API response: ${response.status}`)
    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null || !('total_count' in data)) throw new Error('Missing count')
    const total = (data as { total_count: unknown }).total_count
    if (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0) throw new Error('Invalid count')
    count.value = total
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
})
</script>

<template>
  <div class="pages-deployments">
    <p class="heading">Successful GitHub Pages workflow runs</p>
    <p class="value" aria-live="polite">
      <span v-if="pending">Loading from GitHub… / GitHub से जानकारी मिल रही है…</span>
      <strong v-else-if="count !== null">{{ count }}</strong>
      <span v-else-if="error">Count unavailable / संख्या उपलब्ध नहीं</span>
    </p>
    <p class="detail">Live count from the public GitHub Actions API; not a manual counter.</p>
    <p><a :href="historyUrl" target="_blank" rel="noopener noreferrer">View run history / सभी deployments देखें</a></p>
  </div>
</template>

<style scoped>
.pages-deployments { border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 1rem 1.25rem; }
.heading { font-weight: 600; margin: 0; }
.value { margin: .5rem 0; font-size: 1.75rem; }
.detail { color: var(--vp-c-text-2); font-size: .875rem; }
</style>
