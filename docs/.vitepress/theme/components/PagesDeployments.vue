<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { deploymentLabels, getSuccessfulRunCount, PAGES_HISTORY_URL } from '../lib/pages-api.ts'

// Work only in the browser after mount: the static build never contacts GitHub.
const { lang } = useData()
const labels = computed(() => deploymentLabels(lang.value))
const count = ref<number | null>(null)
const pending = ref(true)
const failed = ref(false)

async function loadCount(): Promise<void> {
  if (pending.value && count.value !== null) return
  pending.value = true
  failed.value = false
  count.value = null
  try {
    count.value = await getSuccessfulRunCount()
  } catch {
    // No fabricated number on API failure or rate limit; visitors can view GitHub.
    failed.value = true
  } finally {
    pending.value = false
  }
}

onMounted(() => { void loadCount() })
</script>

<template>
  <section class="pages-deployments" :aria-label="labels.heading">
    <p class="heading">{{ labels.heading }}</p>
    <p class="value" aria-live="polite" aria-atomic="true">
      <span v-if="pending && count === null">{{ labels.loading }}</span>
      <strong v-else-if="count !== null">{{ count }}</strong>
      <span v-else>{{ labels.unavailable }}</span>
    </p>
    <p v-if="failed" class="notice" role="status">{{ labels.unavailable }}</p>
    <p class="detail">{{ labels.explanation }}</p>
    <div class="actions">
      <button type="button" :disabled="pending" @click="loadCount">
        {{ failed ? labels.retry : labels.refresh }}
      </button>
      <a :href="PAGES_HISTORY_URL" target="_blank" rel="noopener noreferrer">{{ labels.history }}</a>
    </div>
  </section>
</template>

<style scoped>
.pages-deployments { border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 1rem 1.25rem; }
.heading { font-weight: 600; margin: 0; }
.value { margin: .5rem 0; font-size: 1.75rem; }
.detail, .notice { color: var(--vp-c-text-2); font-size: .875rem; }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
.actions button { padding: .35rem .65rem; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.actions button:hover:not(:disabled) { background: var(--vp-c-bg-soft); }
.actions button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.actions button:disabled { opacity: .55; cursor: wait; }
.actions a { font-weight: 500; }
</style>
