import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8'))
const programs = resolve(root, 'conformance/programs')
const names = new Set()

function fail(message) { throw Error(`Conformance fixtures: ${message}`) }
function safeFile(file) {
  if (typeof file !== 'string' || !file || isAbsolute(file)) fail(`invalid path ${file}`)
  const full = resolve(programs, file)
  const rel = relative(programs, full)
  if (rel === '..' || rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(rel)) fail(`path leaves fixture directory: ${file}`)
  if (!existsSync(full)) fail(`missing ${file}`)
  return full
}

if (manifest.compilerRepository !== baseline.repository ||
    manifest.compilerRef !== baseline.release ||
    manifest.compilerCommit !== baseline.releaseSourceCommit) {
  fail('manifest compiler identity differs from the documentation baseline')
}
if (!Array.isArray(manifest.cases) || manifest.cases.length < 7) fail('expected seven conformance cases')
for (const entry of manifest.cases) {
  if (!entry.name || names.has(entry.name)) fail(`duplicate/missing case name: ${entry.name}`)
  names.add(entry.name)
  if (!entry.source.endsWith('.srp') || !entry.expected.endsWith('.stdout')) fail(`invalid case paths: ${entry.name}`)
  safeFile(entry.source)
  safeFile(entry.expected)
}
// Git blob IDs were read from the published release tree. This keeps the
// provenance check offline, even on machines without the Rust toolchain.
const expectedBlobs = manifest.upstreamGitBlobs
if (!expectedBlobs || Object.keys(expectedBlobs).length < 16) fail('missing pinned upstream Git blob identifiers')
const recordedFiles = new Set()
function verifyBlobs(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, item.name)
    if (item.isDirectory()) { verifyBlobs(full); continue }
    if (!item.isFile()) fail(`nonregular fixture: ${full}`)
    const rel = relative(programs, full).replaceAll('\\', '/')
    const buffer = readFileSync(full)
    const sha = createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex')
    if (expectedBlobs[rel] !== sha) fail(`fixture differs from pinned release Git blob: ${rel}`)
    recordedFiles.add(rel)
  }
}
verifyBlobs(programs)
if (recordedFiles.size !== Object.keys(expectedBlobs).length) fail('manifest has missing or extra pinned file entries')
console.log(`PASS: ${names.size} fixtures and ${recordedFiles.size} files match pinned published Git blobs`)

// Optional compiler checkout: compare every mirrored fixture with its published
// upstream source/output, including imported module files. No HTTP required.
if (process.argv[2]) {
  const upstream = resolve(process.argv[2])
  if (!existsSync(upstream) || !statSync(upstream).isDirectory()) fail(`missing compiler examples directory: ${upstream}`)
  let compared = 0
  function compareDirectory(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const local = resolve(dir, item.name)
      if (item.isDirectory()) { compareDirectory(local); continue }
      if (!item.isFile()) fail(`nonregular fixture: ${local}`)
      const rel = relative(programs, local)
      const remote = resolve(upstream, rel)
      if (!existsSync(remote) || !statSync(remote).isFile()) fail(`missing upstream example: ${rel}`)
      if (!readFileSync(local).equals(readFileSync(remote))) fail(`source/output drift from pinned release: ${rel}`)
      compared++
    }
  }
  compareDirectory(programs)
  console.log(`PASS: ${compared} fixture files byte-match compiler examples in ${upstream}`)
}
