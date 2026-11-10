import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateCourseMigrationDocs,type CourseMigrationStatus,type CourseMigrationPages
} from './lib/course-migration-evidence.ts'

const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=(path:string):string=>readFileSync(resolve(root,path),'utf8')
const pages:CourseMigrationPages={
  examplesEnglish:read('docs/examples/index.md'),
  examplesHindi:read('docs/hi/examples/index.md'),
  introEnglish:read('docs/guide/introduction.md'),
  introHindi:read('docs/hi/guide/introduction.md'),
  scientificEnglish:read('docs/project/scientific-computing.md'),
  scientificHindi:read('docs/hi/project/scientific-computing.md'),
  quickEnglish:read('docs/guide/quickstart-alpha4.md'),
  quickHindi:read('docs/hi/guide/quickstart-alpha4.md'),
  kernelsEnglish:read('docs/language/scientific-kernels-alpha4.md'),
  kernelsHindi:read('docs/hi/language/scientific-kernels-alpha4.md'),
  alpha5English:read('docs/language/scientific-kernels-alpha5.md'),
  alpha5Hindi:read('docs/hi/language/scientific-kernels-alpha5.md')
}
const manifest=JSON.parse(read('data/course-migration-status.json')) as CourseMigrationStatus
const latest=(JSON.parse(read('data/compiler-latest-release.json')) as {compilerRef:string}).compilerRef
const check=(p=pages,m=manifest,t=latest)=>validateCourseMigrationDocs(p,m,t)
assert.deepEqual(check(),[])
const mutate=(k:keyof CourseMigrationPages,from:string,to:string):void=>{
  const changed=pages[k].replace(from,to)
  assert.notEqual(changed,pages[k],'bad mutation fixture '+k)
  assert.ok(check({...pages,[k]:changed}).length>0,'mutation escaped: '+k)
}
mutate('introEnglish','scarp/releases/tag/'+latest,'scarp/releases/tag/v0.0.6-alpha.5')
mutate('scientificHindi','scarp/releases/tag/'+latest,'scarp/releases/tag/v0.0.6-alpha.4')
mutate('quickEnglish','/releases/'+latest,'/releases/v0.0.6-alpha.5')
mutate('scientificEnglish','## Published alpha.5','## Unpublished alpha.5')
mutate('examplesEnglish','blob/'+manifest.ref+'/examples/06-ai-foundations/12-temperature-softmax.srp','blob/main/examples/06-ai-foundations/12-temperature-softmax.srp')
mutate('examplesHindi','https://github.com/scarp-lang/scarp-by-example/pull/57','https://github.com/scarp-lang/scarp-by-example/pull/58')
mutate('alpha5English','205e92f166f186c3905e5880d41c31717b697b8e','0'.repeat(40))
assert.ok(check(pages,{...manifest,ref:'main'}).length>0)
assert.ok(check(pages,{...manifest,alpha4Lessons:manifest.alpha4Lessons.slice(0,4)}).length>0)
assert.ok(check(pages,{...manifest,compilerPins:{...manifest.compilerPins,'v0.0.6-alpha.5':'0'.repeat(40)}}).length>0)
assert.ok(check(pages,manifest,'v0.0.6-alpha.5').length>0)
console.log('PASS: course migration state, draft links, pinned sources and 11 negative tests')
