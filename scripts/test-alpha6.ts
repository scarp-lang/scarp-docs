import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAlpha6Docs, type Alpha6Manifest, type Alpha6Pages } from './lib/alpha6-evidence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root,path),'utf8')
const manifest = JSON.parse(read('conformance/alpha6-manifest.json')) as Alpha6Manifest
const pages: Alpha6Pages = {
  releaseEn: read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHi: read('docs/hi/releases/v0.0.6-alpha.1.md'),
  cliEn: read('docs/tooling/cli-alpha6.md'),
  cliHi: read('docs/hi/tooling/cli-alpha6.md'),
  rmsEn: read('docs/language/rms-alpha6.md'),
  rmsHi: read('docs/hi/language/rms-alpha6.md'),
  statusEn: read('docs/reference/status.md'),
  statusHi: read('docs/hi/reference/status.md'),
  homeEn: read('docs/index.md'),
  homeHi: read('docs/hi/index.md'),
  config: read('docs/.vitepress/config.mts'),
  readme: read('README.md')
}
const fixtures = Object.fromEntries(Object.entries(manifest.fixtures)
  .map(([name,record]) => [name,read(record.path)]))
const validate = (p=pages,m=manifest,f=fixtures) => validateAlpha6Docs(p,m,f)
assert.deepEqual(validate(),[])
const change = (key: keyof Alpha6Pages,from: string,to: string): void => {
  const edited = pages[key].replaceAll(from,to)
  assert.notEqual(edited,pages[key],key+' mutation must change its target')
  assert.ok(validate({...pages,[key]:edited}).length > 0,key+' drift must fail')
}
change('releaseEn','scarp inspect symbols --json examples/symbol_navigation.srp','scarp inspect wrong-topic --json examples/symbol_navigation.srp')
change('releaseHi','true true\n2.0','false true\n2.0')
change('cliEn','E0050','E9999')
change('cliHi','scarp.references','scarp.wrong')
change('rmsEn','4n','3n')
change('rmsHi','E0034','E0035')
change('statusEn','aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8','0'.repeat(40))
change('statusHi','/hi/releases/v0.0.6-alpha.1','/hi/releases/v0.0.6-alpha.2')
change('homeEn','v0.0.6-alpha.1','v0.0.6-alpha.2')
change('homeHi','v0.0.6-alpha.1','v0.0.6-alpha.2')
change('config',"{ text: 'CLI (alpha.6)', link: '/tooling/cli-alpha6' }",
  "{ text: 'CLI (alpha.6)', link: '/tooling/cli-alpha5' }")
change('readme','docs/releases/v0.0.6-alpha.1.md','docs/releases/v0.0.5-alpha.5.md')
assert.ok(validate(pages,{...manifest,compilerRef:'v0.0.5-alpha.5'},fixtures).length)
assert.ok(validate(pages,manifest,{...fixtures,
  'root_mean_square.srp':fixtures['root_mean_square.srp']+'// changed\n'}).length)
assert.ok(validate(pages,manifest,{...fixtures,
  'symbol_navigation.references.json':'{"schema_version":2}'}).length)
console.log('PASS: alpha.6 negative drift regressions cover English, Hindi, identity, JSON and sources')
