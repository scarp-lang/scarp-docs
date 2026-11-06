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
const errors=validateDiagnoseDocs(pages)
if(errors.length) {
 for(const error of errors) console.error('FAIL alpha.6 diagnose: '+error)
 process.exitCode=1
} else {
 console.log('PASS: published alpha.6 bilingual diagnose/host JSON reference, literal commands and locale navigation')
}
