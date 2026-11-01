import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Guard the authored tooling against accidental regressions to JavaScript.
// Markdown, Vue SFC templates and CSS are intentionally retained for VitePress.
const scripts = resolve(fileURLToPath(new URL('.', import.meta.url)))
const files = readdirSync(scripts)
const nonTs = files.filter(name => /\.(?:c?js|mjs|jsx|mts|cts)$/.test(name))
if (nonTs.length > 0) {
  console.error(`Non-TypeScript authored script(s): ${nonTs.join(', ')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${files.filter(name => name.endsWith('.ts')).length} authored tooling scripts are TypeScript`)
}
