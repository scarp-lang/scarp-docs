import { verifyLiveSite } from './lib/live-site.ts'

// GitHub Pages can take a short time to serve a newly published artifact.
// Retry the full check, but fail the job if the deployed site stays inconsistent.
const attempts = 8
const retryDelayMs = 12000
let passed = false

for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    const result = await verifyLiveSite(url =>
      fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
    )
    console.log('PASS: ' + result.pages + ' public English/Hindi pages, ' +
      result.assets + ' JS/CSS assets and ' + result.sitemap)
    passed = true
    break
  } catch (error) {
    console.error('Live Pages check ' + attempt + '/' + attempts + ' failed:',
      error instanceof Error ? error.message : String(error))
    if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, retryDelayMs))
  }
}

if (!passed) {
  console.error('FAIL: public Scarp Docs deployment did not pass the smoke test')
  process.exitCode = 1
}
