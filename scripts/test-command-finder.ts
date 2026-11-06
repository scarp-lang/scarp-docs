import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  commandAdvice, FINDER_TEXT, LATEST_RELEASE, RELEASES, TASKS,
  type CommandTask, type ReleaseTag
} from './lib/command-finder.ts'
import { validateCommandFinder, type FinderLabels, type FinderSources } from './lib/command-finder-evidence.ts'

import * as legacyCommandFinder from '../docs/.vitepress/theme/lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const sources: FinderSources = {
  english: read('docs/tooling/command-finder.md'),
  hindi: read('docs/hi/tooling/command-finder.md'),
  component: read('docs/.vitepress/theme/components/ScarpCommandFinder.vue'),
  theme: read('docs/.vitepress/theme/index.ts'),
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md'),
  learnEn: read('docs/guide/learning-path.md'),
  learnHi: read('docs/hi/guide/learning-path.md'),
  compatEn: read('docs/reference/compatibility.md'),
  compatHi: read('docs/hi/reference/compatibility.md')
}
assert.strictEqual(legacyCommandFinder.RELEASES, RELEASES,
  'Legacy Vue compatibility export must reuse the single framework-neutral release table')
assert.strictEqual(legacyCommandFinder.commandAdvice, commandAdvice,
  'Legacy Vue compatibility export must reuse the single framework-neutral selector')
assert.deepEqual(validateCommandFinder(sources), [])
assert.equal(LATEST_RELEASE, RELEASES[6]?.tag)
const expected = new Map<CommandTask,number>([
  ['run-file',0], ['static-verify',2], ['create-project',3],
  ['inspect-project',4], ['inspect-symbols',5], ['diagnose-host',2], ['inspect-ast',2]
])
let combinations = 0
let unavailable = 0
for (const [index,release] of RELEASES.entries()) {
  for (const task of TASKS) {
    const selected = commandAdvice(release.tag,task.id)
    combinations++
    const firstIndex = expected.get(task.id)
    assert.notEqual(firstIndex,undefined,'unknown command task')
    assert.equal(selected.task,task.id)
    assert.equal(selected.release,release.tag)
    assert.equal(selected.firstRelease,RELEASES[firstIndex!]!.tag)
    assert.equal(selected.supported,index >= firstIndex!)
    assert.ok(selected.reference.startsWith('/'))
    assert.ok(!selected.reference.includes('/hi/'),'locale must be added by view')
    if (!selected.supported) {
      unavailable++
      assert.deepEqual(selected.commands,[],'unavailable command must never be suggested')
      continue
    }
    assert.ok(selected.commands.length>0)
    for(const command of selected.commands) {
      assert.ok(command.startsWith('scarp '),'only a Scarp CLI command can be copied')
      assert.ok(!/\b(?:compile|build|publish|polish)\b/.test(command),
        'never recommend unpublished native compiler commands')
    }
  }
}
assert.equal(combinations,49)
assert.equal(unavailable,18,'release-sensitive unsupported capabilities must stay explicit')
assert.deepEqual(commandAdvice('v0.0.5-alpha.1','run-file').commands,['scarp run FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.5-alpha.2','run-file').commands,['scarp run FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.5-alpha.3','run-file').commands,['scarp exec FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.5-alpha.3','static-verify').commands,['scarp verify FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.5-alpha.4','create-project').commands,
  ['scarp create demo','scarp verify demo','scarp launch demo'])
assert.deepEqual(commandAdvice('v0.0.5-alpha.5','inspect-project').commands,
  ['scarp inspect modules --json PROJECT_DIRECTORY'])
assert.deepEqual(commandAdvice('v0.0.6-alpha.1','inspect-symbols').commands,
  ['scarp inspect symbols --json FILE.srp','scarp inspect references --json FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.6-alpha.1','diagnose-host').commands,
  ['scarp diagnose --json'])
assert.deepEqual(commandAdvice('v0.0.6-alpha.1','inspect-ast').commands,
  ['scarp inspect ast FILE.srp'])
assert.deepEqual(commandAdvice('v0.0.6-alpha.2','inspect-symbols').commands,
  ['scarp inspect symbols --json FILE.srp','scarp inspect references --json FILE.srp'])
assert.throws(()=>commandAdvice('v0.0.7-alpha.1' as ReleaseTag,'run-file'),TypeError)
assert.throws(()=>commandAdvice(LATEST_RELEASE,'native-compile' as CommandTask),TypeError)

const mutations: Array<[keyof FinderSources,string,string]> = [
  ['english','<ScarpCommandFinder />','<OutdatedSelector />'],
  ['hindi','<ScarpCommandFinder />','<OutdatedSelector />'],
  ['english','scarp --version','scarp diagnose'],
  ['hindi','v0.0.5-alpha.5','v0.0.5-beta.5'],
  ['component','aria-live="polite"','aria-live="off"'],
  ['component','navigator.clipboard.writeText','console.log'],
  ['component','v-if="current.supported"','v-if="true"'],
  ['component','<pre tabindex="0">','<pre>'],
  ['component','withBase(', 'notBased('],
  ['theme',"ctx.app.component('ScarpCommandFinder', ScarpCommandFinder)","// not registered"],
  ['config',"link: '/hi/tooling/command-finder'","link: '/hi/tooling/missing'"],
  ['config',"link: '/tooling/command-finder'","link: '/tooling/missing'"],
  ['readme','docs/tooling/command-finder.md','docs/tooling/missing.md'],
  ['learnEn','](/tooling/command-finder)','](/tooling/missing)'],
  ['learnHi','](/hi/tooling/command-finder)','](/hi/tooling/missing)'],
  ['compatEn','](/tooling/command-finder)','](/tooling/missing)'],
  ['compatHi','](/hi/tooling/command-finder)','](/hi/tooling/missing)']
]
for (const [key,needle,replacement] of mutations) {
  const changed=sources[key].replaceAll(needle,replacement)
  assert.notEqual(changed,sources[key],'mutation target missing: '+key+' '+needle)
  assert.ok(validateCommandFinder({...sources,[key]:changed}).length>0,
    'documentation drift escaped detector for '+key)
}

const released = JSON.parse(JSON.stringify(RELEASES)) as Array<{
  tag:string;source:string;label:string
}>
released[6]!.source='0'.repeat(40)
assert.ok(validateCommandFinder(sources,released).length>0,'wrong alpha.6 commit must fail')
const tasks = JSON.parse(JSON.stringify(TASKS)) as Array<{
  id:string;first:number;en:string;hi:string;reference:string
}>
tasks[4]!.first=4
assert.ok(validateCommandFinder(sources,RELEASES,tasks).length>0,
  'prematurely published symbol navigation must be rejected')
const languages = JSON.parse(JSON.stringify(FINDER_TEXT)) as {
  en: Record<string,unknown>; hi:Record<string,unknown>
}
languages.hi.unavailable='Not available'
assert.ok(validateCommandFinder(sources,RELEASES,TASKS,languages as unknown as FinderLabels).length>0,
  'English-only Hindi unavailable state must fail')
assert.ok(validateCommandFinder({...sources,hindi:sources.hindi.replace(/[\u0900-\u097f]/gu,'')}).length>0,
  'untranslated Hindi guide must not pass')

console.log('PASS: 49 release/task combinations, '+unavailable+
  ' unavailable states, exact commands, input validation and 21 negative regressions')
