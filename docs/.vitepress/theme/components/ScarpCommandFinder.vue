<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import {
  commandAdvice, FINDER_TEXT, LATEST_RELEASE, RELEASES, TASKS,
  type CommandTask, type ReleaseTag
} from '../lib/command-finder.ts'

const { lang } = useData()
const locale = computed(() => lang.value.startsWith('hi') ? 'hi' : 'en')
const labels = computed(() => FINDER_TEXT[locale.value])
const selectedVersion = ref<ReleaseTag>(LATEST_RELEASE)
const selectedTask = ref<CommandTask>('run-file')
const current = computed(() => commandAdvice(selectedVersion.value, selectedTask.value))
const referenceUrl = computed(() =>
  withBase((locale.value === 'hi' ? '/hi' : '') + current.value.reference))
const copied = ref(false)
const copyError = ref(false)

watch([selectedVersion, selectedTask], () => {
  copied.value = false
  copyError.value = false
})

async function copyCommands(): Promise<void> {
  if (!current.value.supported || !current.value.commands.length) return
  copied.value = false
  copyError.value = false
  try {
    // Runs only in direct response to a click; the SSR build never needs navigator.
    await navigator.clipboard.writeText(current.value.commands.join('\n'))
    copied.value = true
  } catch {
    // Insecure contexts or missing clipboard permissions must not hide commands.
    copyError.value = true
  }
}
</script>

<template>
  <section class="scarp-command-finder" aria-labelledby="scarp-command-finder-heading">
    <h2 id="scarp-command-finder-heading">{{ labels.heading }}</h2>
    <p>{{ labels.intro }}</p>

    <div class="scarp-command-finder-controls">
      <div class="scarp-command-finder-control">
        <label for="scarp-release">{{ labels.version }}</label>
        <select id="scarp-release" v-model="selectedVersion">
          <option v-for="release in RELEASES" :key="release.tag" :value="release.tag">
            {{ release.label }}
          </option>
        </select>
      </div>
      <div class="scarp-command-finder-control">
        <label for="scarp-task">{{ labels.task }}</label>
        <select id="scarp-task" v-model="selectedTask">
          <option v-for="task in TASKS" :key="task.id" :value="task.id">
            {{ task[locale] }}
          </option>
        </select>
      </div>
    </div>

    <div class="scarp-command-finder-result" aria-live="polite" aria-atomic="true">
      <p class="scarp-command-finder-status">
        {{ current.supported ? labels.supported : labels.unavailable }}
      </p>
      <p>{{ labels.first }} <code>{{ current.firstRelease }}</code></p>
      <template v-if="current.supported">
        <p>{{ labels.notes[current.note] }}</p>
        <p class="scarp-command-finder-code-label">{{ labels.command }}</p>
        <pre tabindex="0"><code>{{ current.commands.join('\n') }}</code></pre>
        <button type="button" class="scarp-command-finder-copy" @click="copyCommands">
          {{ copied ? labels.copied : labels.copy }}
        </button>
        <p v-if="copyError" role="status">{{ labels.copyFailed }}</p>
      </template>
      <p v-else>{{ labels.missing }}</p>
      <p><a :href="referenceUrl">{{ labels.reference }}</a></p>
    </div>

    <p class="scarp-command-finder-note">{{ labels.warning }}</p>
  </section>
</template>

<style scoped>
.scarp-command-finder {
  margin: 1.5rem 0;
  padding: clamp(1rem, 2vw, 1.5rem);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.scarp-command-finder h2 { margin-top: 0; border: 0; padding-top: 0; }
.scarp-command-finder-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1rem;
  margin: 1rem 0;
}
.scarp-command-finder-control { display: flex; flex-direction: column; gap: .4rem; }
.scarp-command-finder-control label { font-weight: 600; }
.scarp-command-finder-control select {
  width: 100%;
  min-height: 2.75rem;
  padding: .5rem .75rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}
.scarp-command-finder-result {
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.scarp-command-finder-result p { margin: .5rem 0; }
.scarp-command-finder-status { font-weight: 700; }
.scarp-command-finder-code-label { font-weight: 600; }
.scarp-command-finder-result pre {
  padding: .875rem;
  overflow-x: auto;
  white-space: pre;
  border-radius: 6px;
  background: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
}
.scarp-command-finder-result pre:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.scarp-command-finder-copy {
  margin: .75rem 0 0;
  padding: .4rem .75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  cursor: pointer;
}
.scarp-command-finder-copy:hover { background: var(--vp-c-default-soft); }
.scarp-command-finder-control select:focus-visible,
.scarp-command-finder-copy:focus-visible,
.scarp-command-finder a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.scarp-command-finder-note { font-size: .875rem; color: var(--vp-c-text-2); }
@media (prefers-reduced-motion: reduce) {
  .scarp-command-finder * { scroll-behavior: auto; }
}
</style>
