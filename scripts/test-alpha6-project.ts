import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Project, type Alpha6ProjectSources,
  type Alpha6ProjectPages } from './lib/alpha6-project-evidence.ts'
import type { Alpha6Manifest } from './lib/alpha6-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
const manifest = JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const sources: Alpha6ProjectSources = {
  manifest: read('conformance/alpha6-project/Scarp.project'),
  main: read('conformance/alpha6-project/src/main.srp'),
  module: read('conformance/alpha6-project/src/modules/navigation_values.srp'),
  stdout: read('conformance/alpha6-project/expected.stdout'),
  taggedMain: read('conformance/alpha6/symbol_navigation.srp'),
  taggedModule: read('conformance/alpha6/modules/navigation_values.srp'),
  taggedStdout: read('conformance/alpha6/symbol_navigation.stdout')
}
const pages: Alpha6ProjectPages = {
  english: read('docs/tutorials/project-symbol-navigation-alpha6.md'),
  hindi: read('docs/hi/tutorials/project-symbol-navigation-alpha6.md'),
  config: read('docs/.vitepress/config.mts'),
  examplesEn: read('docs/examples/index.md'),
  examplesHi: read('docs/hi/examples/index.md'),
  homeEn: read('docs/index.md'),
  homeHi: read('docs/hi/index.md'),
  readme: read('README.md')
}
const check = (p=pages,s=sources,m=manifest) => validateAlpha6Project(p,s,m)
assert.deepEqual(check(),[])
const pageMutation = (key: keyof Alpha6ProjectPages,find: string,replacement: string): void => {
  const changed = pages[key].replaceAll(find,replacement)
  assert.notEqual(changed,pages[key],'missing test mutation target: '+key+' '+find)
  assert.ok(check({...pages,[key]:changed}).length>0,key+' drift not detected')
}
pageMutation('english','scarp inspect references --json navigation-lab',
  'scarp inspect references --json wrong-project')
pageMutation('hindi','scarp inspect symbols --json navigation-lab',
  'scarp inspect symbols --json wrong-project')
pageMutation('english','pub pure funcra adjust','pure funcra adjust')
pageMutation('hindi','scarp-project: 1','scarp-project: 2')
pageMutation('english','30\n~~~','31\n~~~')
pageMutation('hindi','<!-- scarp-alpha6-project-lab: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->',
  '<!-- invalid project compiler source -->')
pageMutation('config','/tutorials/project-symbol-navigation-alpha6','/tutorials/removed-guide')
pageMutation('examplesHi','/hi/tutorials/project-symbol-navigation-alpha6','/hi/tutorials/missing')
pageMutation('homeEn','/tutorials/project-symbol-navigation-alpha6','/tutorials/missing')
pageMutation('readme','docs/tutorials/project-symbol-navigation-alpha6.md','docs/tutorials/removed.md')
assert.ok(check(pages,{...sources,manifest:sources.manifest.replace('entry: src/main.srp','entry: ../outside.srp')}).length)
assert.ok(check(pages,{...sources,main:sources.main.replace('var total = 0','var total = 1')}).length)
assert.ok(check(pages,{...sources,module:sources.module.replace('pub bind offset','bind offset')}).length)
assert.ok(check(pages,{...sources,stdout:'31\n'}).length)
assert.ok(check(pages,sources,{...manifest,compilerRef:'v0.0.5-alpha.5'}).length)
console.log('PASS: bilingual alpha.6 project guard rejects wrong commands, source, output, manifest, translation and navigation')
