import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateCompilerEvidence } from './lib/compiler-release-drift.ts'
import { extractCodeFences } from './lib/code-fences.ts'

/** Pinned published evidence, not moving compiler main. */
const root=fileURLToPath(new URL('..',import.meta.url))
const read=(path:string)=>readFileSync(join(root,path),'utf8')
const tag='v0.0.7-alpha.4'
const commit='e620bdcb512fbe909b08f1b4cc625865e4cdf339'
const evidence=JSON.parse(read('data/compiler-v007-alpha4-release.json'))
assert.equal(evidence.compilerRef,tag)
assert.equal(evidence.compilerCommit,commit)
assert.equal(evidence.releasedAt,'2026-11-28T02:52:45Z')
assert.deepEqual(validateCompilerEvidence(evidence),[])
const current=JSON.parse(read('data/compiler-latest-release.json'))
if(current.compilerRef===tag)assert.deepEqual(current,evidence)

interface Fixture{name:string;upstream:string;blob:string}
const manifest=JSON.parse(read('conformance/v007-alpha4/manifest.json')) as {
  compilerCommit:string;files:Fixture[]
}
const names=['bigint_wide_exponents.srp','bigint_wide_exponents.stdout',
  'native_nested_aggregate_locals.srp','native_nested_aggregate_locals.stdout',
  'native_recursive_entry.srp','native_recursive_entry.stdout']
assert.equal(manifest.compilerCommit,commit)
assert.deepEqual(manifest.files.map(f=>f.name),names)
for(const file of manifest.files){
  assert.equal(file.upstream,'examples/'+file.name)
  const bytes=readFileSync(join(root,'conformance/v007-alpha4',file.name))
  const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
  assert.equal(actual,file.blob,'Exact tagged Git blob: '+file.name)
  if(process.argv[3])assert.deepEqual(bytes,
    readFileSync(join(resolve(process.argv[3]),file.upstream)),
    'Fixture changed from tagged source: '+file.name)
}

for(const config of [
  {guide:'v007-alpha4-bigint',stems:['bigint_wide_exponents'],langs:['scarp','text','sh']},
  {guide:'v007-alpha4-systems',stems:['native_nested_aggregate_locals',
    'native_recursive_entry'],langs:['scarp','text','scarp','text','sh']}
]){
  const fences=['','hi/'].map(prefix=>
    extractCodeFences(read('docs/'+prefix+'guide/'+config.guide+'.md'))
      .map(({language,code})=>({language,code})))
  assert.deepEqual(fences[0],fences[1],'Bilingual code differs: '+config.guide)
  assert.deepEqual(fences[0].map(f=>f.language),config.langs)
  for(const [index,stem] of config.stems.entries()){
    assert.equal(fences[0][2*index].code,
      read('conformance/v007-alpha4/'+stem+'.srp').trimEnd())
    assert.equal(fences[0][2*index+1].code,
      read('conformance/v007-alpha4/'+stem+'.stdout').trimEnd())
  }
  for(const prefix of ['','hi/']){
    const page=read('docs/'+prefix+'guide/'+config.guide+'.md')
    assert.ok(page.includes('<!-- scarp-cli-release: '+tag+' -->'))
    assert.ok(page.includes('<!-- scarp-current-source: '+commit+' -->'))
  }
}
for(const prefix of ['','hi/']){
  const page=read('docs/'+prefix+'releases/'+tag+'.md')
  assert.ok(page.includes('<!-- scarp-current-release: '+tag+' -->'))
  assert.ok(page.includes(commit))
  for(const archive of evidence.assets as string[]){
    if(archive==='SHA256SUMS'||archive.endsWith('.sha256'))continue
    assert.ok(page.includes(archive),'Published artifact not documented: '+archive)
    assert.ok(page.includes(evidence.assetDigests[archive].slice(7)),
      'Artifact SHA-256 not documented: '+archive)
  }
}

if(process.argv[2]){
  const binary=resolve(process.argv[2])
  const work=mkdtempSync(join(tmpdir(),'scarp-docs-alpha4-'))
  try{
    function run(args:string[],shouldPass=true):string{
      const result=spawnSync(binary,args,{cwd:work,encoding:'utf8',timeout:45000})
      assert.equal(result.error,undefined)
      if(shouldPass){
        assert.equal(result.status,0,args.join(' ')+'\n'+result.stderr)
        assert.equal(result.stderr,'')
      }else{
        assert.notEqual(result.status,0,'Expected failure: '+args.join(' '))
        assert.notEqual(result.status,null)
      }
      return result.stdout
    }
    assert.equal(run(['version']),'scarp 0.0.7-alpha.4\n')
    for(const stem of ['bigint_wide_exponents','native_nested_aggregate_locals',
      'native_recursive_entry']){
      const name=stem+'.srp'
      writeFileSync(join(work,name),read('conformance/v007-alpha4/'+name))
      assert.equal(run(['verify',name]),'')
      assert.equal(run(['exec',name]),
        read('conformance/v007-alpha4/'+stem+'.stdout'))
    }
    // Only declarations, without interpreter print statements, are accepted
    // as the source for bounded native-entry emission.
    for(const [stem,entry] of [
      ['native_nested_aggregate_locals','entry'],
      ['native_recursive_entry','gcd']
    ] as const){
      const original=read('conformance/v007-alpha4/'+stem+'.srp')
      const stripped=original.replace(/^print\(.*\);\s*$/gm,'').trim()+'\n'
      assert.ok(!/^\s*print\(/m.test(stripped))
      const source=stem+'-definitions.srp'
      const destination=stem+'.o'
      writeFileSync(join(work,source),stripped)
      assert.equal(run(['verify',source]),'')
      if(entry==='gcd'){
        // The published alpha.4 Rust API supports bounded recursion, while
        // the shipped CLI deliberately rejects recursive call graphs.
        const result=spawnSync(binary,['native-object','--json','x86_64-none',
          'bounded-entry',entry,'4000','8192',source,'-o',destination],{
          cwd:work,encoding:'utf8',timeout:45000
        })
        assert.equal(result.status,1)
        assert.match(result.stderr,/E0049/)
        assert.match(result.stderr,/nonrecursive/)
        assert.equal(existsSync(join(work,destination)),false)
        continue
      }
      const report=JSON.parse(run(['native-object','--json','x86_64-none',
        'bounded-entry',entry,'4000','8192',source,'-o',destination]))
      assert.equal(report.mode,'bounded-entry')
      assert.equal(report.max_stack_bytes,8192)
      assert.ok(report.peak_stack_bytes>0&&report.peak_stack_bytes<=8192)
      const object=readFileSync(join(work,destination))
      assert.equal(object.subarray(0,4).toString('hex'),'7f454c46')
      assert.equal(object[4],2,'ELF64')
      assert.equal(object.readUInt16LE(16),1,'ET_REL')
      assert.equal(object.readUInt16LE(18),62,'EM_X86_64')
      run(['native-object','x86_64-none','bounded-entry',entry,'4000',
        '8192',source,'-o',destination],false)
    }
    writeFileSync(join(work,'left.txt'),'-100')
    writeFileSync(join(work,'right.txt'),'9')
    assert.equal(run(['bigint','add','left.txt','right.txt','sum.txt']),'')
    assert.equal(readFileSync(join(work,'sum.txt'),'utf8'),'-91')
    assert.equal(run(['bigint','div','left.txt','right.txt','quotient.txt']),'-1\n')
    assert.equal(readFileSync(join(work,'quotient.txt'),'utf8'),'-11')
    assert.equal(run(['bigint','div-wide','left.txt','right.txt','wide.txt']),'-1\n')
    assert.equal(readFileSync(join(work,'wide.txt'),'utf8'),'-11')
    run(['bigint','add','left.txt','right.txt','sum.txt'],false)
  }finally{rmSync(work,{recursive:true,force:true})}
}
console.log('PASS: published alpha.4 release, bilingual parity and exact source'+
  (process.argv[2]?' (executed)':' (static)'))
