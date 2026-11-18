import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
if (!process.argv[2]) throw new Error('Usage: npm run test:alpha14-compiler -- /absolute/path/to/scarp')
const compiler=resolve(process.argv[2])
for (const name of ['structured_pattern_coverage','map_string_projection_snapshots']) {
  const base=resolve(root,'conformance/alpha14',name)
  for (const verb of ['verify','exec']) {
    const result=spawnSync(compiler,[verb,base+'.srp'],
      {cwd:root,encoding:'utf8',timeout:90000,maxBuffer:2*1024*1024})
    assert.equal(result.error,undefined,name+' compiler spawn error')
    assert.equal(result.status,0,name+' '+verb+': '+result.stderr)
    assert.equal(result.stderr,'',name+' unexpected stderr')
    assert.equal(result.stdout,verb==='verify'?'':readFileSync(base+'.stdout','utf8'),
      name+' byte-exact stdout')
  }
}
console.log('PASS: published alpha.14 interpreter executes both tagged fixtures')
