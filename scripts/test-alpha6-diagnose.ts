import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateDiagnoseDocs, type DiagnosePages } from './lib/alpha6-diagnose-policy.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path: string):string=>readFileSync(resolve(root,path),'utf8')
const pages:DiagnosePages={
 en:read('docs/tooling/diagnose-alpha6.md'),
 hi:read('docs/hi/tooling/diagnose-alpha6.md'),
 config:read('docs/.vitepress/config.mts'),
 cliEn:read('docs/tooling/cli-alpha6.md'),
 cliHi:read('docs/hi/tooling/cli-alpha6.md'),
 installEn:read('docs/guide/installation-alpha6.md'),
 installHi:read('docs/hi/guide/installation-alpha6.md'),
 troubleEn:read('docs/tooling/troubleshooting.md'),
 troubleHi:read('docs/hi/tooling/troubleshooting.md'),
 releaseEn:read('docs/releases/v0.0.6-alpha.1.md'),
 releaseHi:read('docs/hi/releases/v0.0.6-alpha.1.md'),
 readme:read('README.md')
}
assert.deepEqual(validateDiagnoseDocs(pages),[])

const mutations: Array<[keyof DiagnosePages,string,string,string]> = [
 ['en','v0.0.6-alpha.1','v0.0.6-alpha.2','compiler release'],
 ['hi','aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8','0'.repeat(40),'compiler SHA'],
 ['en','scarp diagnose --format=json','scarp diagnose --json-pretty','unsupported flag'],
 ['hi','scarp guide diagnose','scarp guide unknown','help command'],
 ['en','scarp diagnose --json','scarp diagnose --yaml','JSON command'],
 ['hi','.\\scarp.exe diagnose --json','.\\scarp.exe diagnose --text','PowerShell example'],
 ['en','`schema_version`','`schema_v2`','JSON schema'],
 ['hi','`native_executable`','`native_compiler`','unsupported capability key'],
 ['en','| `project_workflow` | boolean |','| `project_workflow` | string |','capability field type'],
 ['hi','| `host_arch` | string |','| `host_arch` | boolean |','architecture type'],
 ['config',"link: '/hi/tooling/diagnose-alpha6'","link: '/hi/tooling/diagnose-missing'",'Hindi sidebar'],
 ['config',"link: '/tooling/diagnose-alpha6'","link: '/tooling/diagnose-missing'",'English sidebar'],
 ['installEn','](/tooling/diagnose-alpha6)','](/tooling/missing)','English installation link'],
 ['installHi','](/hi/tooling/diagnose-alpha6)','](/hi/tooling/missing)','Hindi installation link'],
 ['cliEn','](/tooling/diagnose-alpha6)','](/tooling/missing)','English CLI link'],
 ['cliHi','](/hi/tooling/diagnose-alpha6)','](/hi/tooling/missing)','Hindi CLI link'],
 ['troubleEn','](/tooling/diagnose-alpha6)','](/tooling/missing)','English troubleshooting link'],
 ['troubleHi','](/hi/tooling/diagnose-alpha6)','](/hi/tooling/missing)','Hindi troubleshooting link'],
 ['releaseEn','](/tooling/diagnose-alpha6)','](/tooling/missing)','English release link'],
 ['releaseHi','](/hi/tooling/diagnose-alpha6)','](/hi/tooling/missing)','Hindi release link'],
 ['readme','docs/hi/tooling/diagnose-alpha6.md','docs/hi/tooling/missing.md','README locale']
]
for(const [key,find,replacement,name] of mutations){
 const changed=pages[key].replace(find,replacement)
 assert.notEqual(changed,pages[key],name+' test mutation target missing')
 const errors=validateDiagnoseDocs({...pages,[key]:changed})
 assert.ok(errors.length>0,name+' drift was not detected')
}
const stripped=pages.hi.replace(/[\u0900-\u097f]/gu,'')
assert.ok(validateDiagnoseDocs({...pages,hi:stripped}).length>0,
 'empty Hindi translation must be rejected')
console.log('PASS: 22 source, CLI, version, JSON field and bilingual navigation negative regressions')
