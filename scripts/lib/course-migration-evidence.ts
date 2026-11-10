/** Guard public Docs against stale compiler status and draft-only external lesson links. */
export interface CourseMigrationStatus {
  courseRepository: string
  pullRequest: number
  state: 'draft' | 'published'
  ref: string
  compilerPins: Record<string, string>
  alpha4Lessons: string[]
  alpha5Lessons: string[]
}

export interface CourseMigrationPages {
  examplesEnglish: string
  examplesHindi: string
  introEnglish: string
  introHindi: string
  scientificEnglish: string
  scientificHindi: string
  quickEnglish: string
  quickHindi: string
  kernelsEnglish: string
  kernelsHindi: string
  alpha5English: string
  alpha5Hindi: string
}

const alpha4Lessons=[
  "examples/06-ai-foundations/12-temperature-softmax.srp",
  "examples/06-ai-foundations/13-cosine-similarity.srp",
  "examples/06-ai-foundations/14-sample-cumulative-area.srp",
  "examples/04-collections/13-sampled-calculus.srp",
  "examples/06-ai-foundations/15-topk-ranking.srp"
] as const
const alpha5Lessons=[
  "examples/04-collections/14-pearson-correlation.srp",
  "examples/06-ai-foundations/16-nucleus-selection.srp"
] as const
const courseRoot='https://github.com/scarp-lang/scarp-by-example'
const compilerPins={
  'v0.0.6-alpha.4':'f04be0758cbce405ddcdb229699b0ff83c09d207',
  'v0.0.6-alpha.5':'205e92f166f186c3905e5880d41c31717b697b8e'
} as const

export function validateCourseMigrationDocs(
  pages: CourseMigrationPages, manifest: CourseMigrationStatus, latest: string
): string[] {
  const errors:string[]=[]
  const fail=(message:string):void=>{errors.push(message)}
  if(manifest.courseRepository!=='scarp-lang/scarp-by-example'||
    manifest.pullRequest!==57||
    !['draft','published'].includes(manifest.state)||
    (manifest.state==='published'&&manifest.ref!=='main')||
    (manifest.state==='draft'&&manifest.ref!=='content-migration-alpha4-20261109')){
    fail('Unknown external course source, state or migration ref')
  }
  if(JSON.stringify(manifest.compilerPins)!==JSON.stringify(compilerPins)){
    fail('Historical compiler source commitments drifted')
  }
  for(const [name,actual,expected] of [
    ['alpha.4',manifest.alpha4Lessons,alpha4Lessons],
    ['alpha.5',manifest.alpha5Lessons,alpha5Lessons]
  ] as const){
    if(JSON.stringify(actual)!==JSON.stringify(expected)){
      fail(name+' lesson inventory or order has changed without review')
    }
  }
  if(!/^v\\d+\\.\\d+\\.\\d+-(?:alpha|beta|rc)\\.\\d+$/.test(latest)){
    fail('Latest compiler release is not a published prerelease tag')
  }
  for(const [locale,intro,scientific,quick,prefix] of [
    ['English',pages.introEnglish,pages.scientificEnglish,pages.quickEnglish,''],
    ['Hindi',pages.introHindi,pages.scientificHindi,pages.quickHindi,'/hi']
  ] as const) {
    if(!intro.includes('scarp/releases/tag/'+latest)){
      fail(locale+': introduction points to an obsolete latest compiler')
    }
    if(!scientific.includes('scarp/releases/tag/'+latest)){
      fail(locale+': scientific project guide calls an old compiler latest')
    }
    if(!quick.includes(']('+prefix+'/releases/'+latest+')')){
      fail(locale+': historical quickstart sends new installs to an old release')
    }
    if(!quick.includes('<!-- scarp-project-release: v0.0.5-alpha.4 -->')){
      fail(locale+': historical project baseline was lost')
    }
    if(/(?:unpublished|अप्रकाशित)[^\\n]{0,160}v0\\.0\\.6-alpha\\.5/i.test(scientific)||
       /v0\\.0\\.6-alpha\\.5[^\\n]{0,160}(?:unpublished|अप्रकाशित)/i.test(scientific)){
      fail(locale+': already-published alpha.5 kernels are called unpublished')
    }
    if(!scientific.includes(prefix+'/language/scientific-kernels-alpha5')){
      fail(locale+': published alpha.5 scientific reference is missing')
    }
  }
  for(const [locale,page] of [
    ['English',pages.examplesEnglish],
    ['Hindi',pages.examplesHindi]
  ] as const){
    for(const path of alpha4Lessons){
      const expected=courseRoot+'/blob/'+manifest.ref+'/'+path
      if(!page.includes(expected)){
        fail(locale+': missing release-linked course lesson '+path)
      }
      if(manifest.state==='draft'&&page.includes(courseRoot+'/blob/main/'+path)){
        fail(locale+': draft-only course lesson misrepresented as published main '+path)
      }
    }
    if(manifest.state==='draft'&&!page.includes(courseRoot+'/pull/57')){
      fail(locale+': draft lesson URLs need visible PR #57 caveat')
    }
  }
  for(const [locale,guide] of [
    ['English',pages.alpha5English],
    ['Hindi',pages.alpha5Hindi]
  ] as const){
    if(!guide.includes(compilerPins['v0.0.6-alpha.5'])||
      !guide.includes(courseRoot+'/pull/57')){
      fail(locale+': alpha.5 pinned kernel source and course dependency are missing')
    }
  }
  if(manifest.state==='draft'){
    for(const [locale,doc] of [
      ['English',pages.kernelsEnglish],
      ['Hindi',pages.kernelsHindi]
    ] as const){
      for(const path of alpha4Lessons.slice(0,3)){
        if(!doc.includes(courseRoot+'/blob/'+manifest.ref+'/'+path)){
          fail(locale+': published-looking lesson link hides draft course ref '+path)
        }
      }
    }
  }
  return errors
}
