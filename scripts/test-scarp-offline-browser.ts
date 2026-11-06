import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Browser test the distribution users actually download, not only a preview.
 * Previous releases used a VitePress-specific browser suite. This stage uses
 * Scarp's own browser suite and preserves the standalone package checks.
 */
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const archive=join(root,'artifacts/scarp-docs-offline.tar.gz')
assert.ok(existsSync(archive),'Run docs:build and package:offline before browser tests')
const extract=mkdtempSync(join(tmpdir(),'scarp-browser-distribution-'))
try{
  execFileSync('tar',['-xzf',archive,'-C',extract],{cwd:root})
  const site=join(extract,'scarp-docs')
  assert.ok(existsSync(join(site,'index.html')),'Offline archive missing English homepage')
  assert.ok(existsSync(join(site,'hi/index.html')),'Offline archive missing Hindi homepage')
  execFileSync(process.execPath,[
    '--import','tsx','scripts/scarp-site/browser-test.ts',site
  ],{
    cwd:root,stdio:'inherit',env:{...process.env,SCARP_BROWSER_FROM_ARCHIVE:'1'},
    maxBuffer:16*1024*1024,timeout:180_000
  })
  console.log('PASS: extracted offline archive passed Scarp-owned bilingual Chromium and axe browser suite')
}finally{
  rmSync(extract,{recursive:true,force:true})
}
