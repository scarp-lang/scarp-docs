import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLearningPath, learningStages, type LearningPathPages } from './lib/learning-path-policy.ts'
import type { Alpha6Manifest } from './lib/alpha6-evidence.ts'
import { LATEST_RELEASE } from './lib/command-finder.ts'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string):string=>readFileSync(resolve(root,p),'utf8')
const pages:LearningPathPages={
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
const manifest=JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const check=(p:LearningPathPages=pages,m:Alpha6Manifest=manifest)=>validateLearningPath(p,m)
assert.equal(learningStages.length,7)
assert.deepEqual(check(),[])
function mutate(key:keyof LearningPathPages,before:string,after:string):void {
  const updated=pages[key].replace(before,after)
  assert.notEqual(updated,pages[key],'bad test target: '+key+' '+before)
  assert.ok(check({...pages,[key]:updated}).length>0,'undetected '+key+' mutation '+before)
}
mutate('english','<!-- scarp-learning-stage: static-cli v0.0.5-alpha.3 -->',
  '<!-- scarp-learning-stage: static-cli v0.0.5-alpha.2 -->')
mutate('hindi','<!-- scarp-learning-stage: projects v0.0.5-alpha.4 -->',
  '<!-- scarp-learning-stage: projects v0.0.5-alpha.3 -->')
mutate('english','](/tutorials/verified-vectors)','](/tutorials/unknown-example)')
mutate('hindi','](/hi/tutorials/alpha2-collections-and-learning)','](/hi/tutorials/unknown-example)')
mutate('english','scarp inspect symbols --json navigation-lab',
  'scarp inspect symbols --json wrong-folder')
mutate('hindi','scarp launch navigation-lab','scarp launch wrong-folder')
mutate('hindi','~~~sh\nscarp version','~~~sh\nscarp --unsupported-version')
mutate('english','v0.0.6-alpha.1 -->','v0.0.5-alpha.5 -->')
mutate('config',"link: '/hi/guide/learning-path'","link: '/hi/guide/removed'")
mutate('homeEnglish','link: /guide/learning-path','link: /guide/removed')
mutate('homeHindi','link: /hi/guide/learning-path','link: /hi/guide/removed')
mutate('introEnglish','](/guide/learning-path)','](/guide/removed)')
mutate('introHindi','](/hi/guide/learning-path)','](/hi/guide/removed)')
mutate('firstEnglish','v0.0.6-alpha.1','v0.0.5-alpha.5')
mutate('quickEnglish','[published '+LATEST_RELEASE+' release and checksums]',
  '[published v0.0.6-alpha.1 release and checksums]')
mutate('quickHindi','[प्रकाशित '+LATEST_RELEASE+' release और checksum]',
  '[प्रकाशित v0.0.6-alpha.1 release और checksum]')
mutate('compatibilityEnglish','aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8','wrong-release-sha')
mutate('introEnglish','tag/'+LATEST_RELEASE,'tag/v0.0.6-alpha.3')
mutate('introHindi','tag/'+LATEST_RELEASE,'tag/v0.0.6-alpha.3')

mutate('compatibilityHindi','[v0.0.6-alpha.3](/hi/releases/v0.0.6-alpha.3)',
  '[v0.0.6-alpha.1](/hi/releases/v0.0.6-alpha.1)')
mutate('examplesEnglish','](/guide/learning-path)','](/guide/removed)')
mutate('examplesHindi','](/hi/guide/learning-path)','](/hi/guide/removed)')
mutate('readme','](docs/guide/learning-path.md)','](docs/guide/removed.md)')
assert.ok(check(pages,{...manifest,compilerRef:'v0.0.5-alpha.5'}).length>0)
console.log('PASS: learning-path mutations rejected for stages, releases, links, CLI, translation and outdated onboarding')
