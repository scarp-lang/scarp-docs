import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateAstGuide, type AstGuidePages } from './lib/alpha6-ast-policy.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
const pages:AstGuidePages={
  en:read('docs/tooling/inspect-ast-alpha6.md'),
  hi:read('docs/hi/tooling/inspect-ast-alpha6.md'),
  config:read('docs/.vitepress/config.mts'),
  cliEn:read('docs/tooling/cli-alpha6.md'),
  cliHi:read('docs/hi/tooling/cli-alpha6.md'),
  troubleshootEn:read('docs/tooling/troubleshooting.md'),
  troubleshootHi:read('docs/hi/tooling/troubleshooting.md'),
  releaseEn:read('docs/releases/v0.0.6-alpha.1.md'),
  releaseHi:read('docs/hi/releases/v0.0.6-alpha.1.md'),
  readme:read('README.md')
}
assert.deepEqual(validateAstGuide(pages),[])
const mutations:Array<[string,keyof AstGuidePages,string,string]> = [
 ['incorrect tagged compiler','en','aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8','0'.repeat(40)],
 ['wrong published release','hi','v0.0.6-alpha.1','v0.0.6-alpha.2'],
 ['wrong successful AST command','en','scarp inspect ast examples/hello.srp','scarp ast examples/hello.srp'],
 ['lost published source','hi','print("Hello from Scarp!");','print("Wrong output");'],
 ['changed invalid parser fixture','en','print(1 + );','print(1 + 2);'],
 ['changed parser error command','hi','scarp inspect ast --diagnostic-format=json broken.srp','scarp inspect ast --json broken.srp'],
 ['removed symbols comparison','en','scarp inspect symbols --json FILE.srp','scarp inspect symbols FILE.srp'],
 ['lost original CLI navigation','cliEn','/tooling/inspect-ast-alpha6','/tooling/missing-ast'],
 ['lost translated CLI navigation','cliHi','/hi/tooling/inspect-ast-alpha6','/hi/tooling/missing-ast'],
 ['lost English sidebar','config',"link: '/tooling/inspect-ast-alpha6'","link: '/tooling/nonexistent'"],
 ['lost Hindi sidebar','config',"link: '/hi/tooling/inspect-ast-alpha6'","link: '/hi/tooling/nonexistent'"],
 ['lost English troubleshooting','troubleshootEn','/tooling/inspect-ast-alpha6','/tooling/missing-ast'],
 ['lost Hindi troubleshooting','troubleshootHi','/hi/tooling/inspect-ast-alpha6','/hi/tooling/missing-ast'],
 ['lost English release link','releaseEn','/tooling/inspect-ast-alpha6','/tooling/missing-ast'],
 ['lost Hindi release link','releaseHi','/hi/tooling/inspect-ast-alpha6','/hi/tooling/missing-ast'],
 ['lost README link','readme','docs/tooling/inspect-ast-alpha6.md','docs/tooling/missing-ast.md']
]
for(const [name,field,before,after] of mutations) {
  const changed=pages[field].replaceAll(before,after)
  assert.notEqual(changed,pages[field],name+' did not mutate fixture')
  const errors=validateAstGuide({...pages,[field]:changed})
  assert.ok(errors.length>0,name+' was not rejected')
}
assert.ok(validateAstGuide({...pages,hi:pages.hi.replace(/[\u0900-\u097f]/gu,'')}).length,
  'lost Hindi text must not pass')
console.log('PASS: bilingual AST guide source, commands, navigation and 17 negative drift regressions')
