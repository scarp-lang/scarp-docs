import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLearningPath, type LearningPathPages } from './lib/learning-path-policy.ts'
import type { Alpha6Manifest } from './lib/alpha6-evidence.ts'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string):string=>readFileSync(resolve(root,p),'utf8')
const pages:LearningPathPages = {
  english:read('docs/guide/learning-path.md'),
  hindi:read('docs/hi/guide/learning-path.md'),
  config:read('docs/.vitepress/config.mts'),
  homeEnglish:read('docs/index.md'),
  homeHindi:read('docs/hi/index.md'),
  introEnglish:read('docs/guide/introduction.md'),
  introHindi:read('docs/hi/guide/introduction.md'),
  firstEnglish:read('docs/guide/first-program.md'),
  firstHindi:read('docs/hi/guide/first-program.md'),
  quickEnglish:read('docs/guide/quickstart-alpha4.md'),
  quickHindi:read('docs/hi/guide/quickstart-alpha4.md'),
  compatibilityEnglish:read('docs/reference/compatibility.md'),
  compatibilityHindi:read('docs/hi/reference/compatibility.md'),
  examplesEnglish:read('docs/examples/index.md'),
  examplesHindi:read('docs/hi/examples/index.md'),
  readme:read('README.md')
}
const release=JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const errors=validateLearningPath(pages,release)
if(errors.length){
  for(const error of errors)console.error('FAIL learning path: '+error)
  process.exitCode=1
}else console.log('PASS: seven pinned learning stages, bilingual examples, compatibility and navigation')
