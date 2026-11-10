import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCourseMigrationDocs, type CourseMigrationStatus, type CourseMigrationPages } from './lib/course-migration-evidence.ts'

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
const failures=validateCourseMigrationDocs(pages,manifest,latest)
if(failures.length){
  for(const problem of failures)console.error('FAIL course migration: '+problem)
  process.exitCode=1
}else{
  console.log('PASS: seven tag-pinned course lessons, English/Hindi provenance, accurate latest compiler, and draft publication gate')
}
