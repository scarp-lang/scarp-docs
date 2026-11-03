import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = process.argv[2] ? resolve(process.argv[2]) : null
if (!cli) { console.error('Usage: npm run test:alpha4-compiler -- /absolute/path/to/scarp'); process.exit(2) }
const read = (p: string) => readFileSync(resolve(root, p))
const expectedManifest = read('conformance/alpha4/Scarp.project')
const expectedSource = read('conformance/alpha4/starter.srp')
const expectedOutput = read('conformance/alpha4/starter.stdout')
const folder = mkdtempSync(join(tmpdir(), 'scarp-docs-alpha4-'))
let failures = 0
const check = (condition: boolean, note: string) => {
  if (!condition) { failures++; console.error('FAIL alpha.4 compiler: ' + note) }
  else console.log('PASS alpha.4 compiler: ' + note)
}
const invoke = (args: string[]) => spawnSync(cli, args, {
  cwd: folder, encoding: null, timeout: 30000, maxBuffer: 1024 * 1024
})
const success = (result: ReturnType<typeof invoke>, expected = '') =>
  !result.error && result.status === 0 && !result.stderr?.length &&
  (result.stdout?.toString('utf8') ?? '') === expected
const failure = (result: ReturnType<typeof invoke>, code = 1) =>
  !result.error && result.status === code && !result.stdout?.length && Boolean(result.stderr?.length)

try {
  const v = invoke(['version'])
  check(success(v, v.stdout?.toString('utf8') ?? '') &&
    v.stdout?.toString('utf8').includes('0.0.5-alpha.4') === true,
    'published alpha.4 compiler executable version')

  const project = join(folder, 'hello-world')
  const created = invoke(['create', project])
  check(!created.error && created.status === 0 && !created.stderr?.length,
    'create project without overwriting existing paths (may report created path on stdout)')
  const manifest = join(project, 'Scarp.project')
  const entry = join(project, 'src', 'main.srp')
  check(readFileSync(manifest).equals(expectedManifest), 'generated manifest matches pinned exact bytes')
  check(readFileSync(entry).equals(expectedSource), 'generated program matches pinned exact bytes')
  check(readdirSync(project).sort().join(',') === 'Scarp.project,src', 'created only expected top-level artifacts')
  check(success(invoke(['verify', project])), 'project directory verifies statically without program output')
  check(success(invoke(['verify', entry])), 'individual file verification remains supported')
  check(success(invoke(['launch', project]), expectedOutput.toString('utf8')),
    'project launch executes interpreter with byte-exact stdout')
  check(success(invoke(['exec', entry]), expectedOutput.toString('utf8')),
    'project launch and file exec agree on starter output')
  check(failure(invoke(['create', project])) &&
    readFileSync(manifest).equals(expectedManifest) && readFileSync(entry).equals(expectedSource),
    'repeated create cannot overwrite the existing project')
  const existing = join(folder, 'already-empty')
  mkdirSync(existing)
  check(failure(invoke(['create', existing])) && readdirSync(existing).length === 0,
    'create rejects existing even empty destinations')

  const alt = join(project, 'src', 'other.srp')
  writeFileSync(alt, 'print(6 * 7);\n', 'utf8')
  const altManifest = 'scarp-project: 1\nname: hello-world\nentry: src/other.srp\n'
  writeFileSync(manifest, altManifest, 'utf8')
  check(success(invoke(['verify', project])), 'verify follows declared alternate entrypoint')
  check(success(invoke(['launch', project]), '42\n'), 'launch executes alternate entrypoint instead of default')

  writeFileSync(alt, 'print(1 / 0);\n', 'utf8')
  check(success(invoke(['verify', project])), 'static verify does not evaluate runtime division by zero')
  check(failure(invoke(['launch', project])), 'launch detects runtime failure with empty program stdout')

  for (const invalid of [
    'scarp-project: 2\nname: hello-world\nentry: src/main.srp\n',
    'scarp-project: 1\nname: hello-world\nentry: ../escape.srp\n',
    'scarp-project: 1\nname: hello-world\nentry: src/main.srp\nextra: no\n',
    'scarp-project: 1\nname: hello-world\nentry: src/main.srp\n'.repeat(120)
  ]) {
    writeFileSync(manifest, invalid, 'utf8')
    const e = invoke(['verify', '--diagnostic-format=json', project])
    let valid = failure(e)
    if (valid) {
      try {
        const value = JSON.parse(e.stderr!.toString('utf8')) as { schema_version?: number }
        valid = value.schema_version === 1
      } catch { valid = false }
    }
    check(valid, 'reject invalid, traversal or oversized manifest with status 1 and schema-v1 JSON')
  }
  check(failure(invoke(['verify', '--max-steps', '0', project]), 2),
    'static project verify rejects runtime-budget flags with usage error')
} finally {
  rmSync(folder, { recursive: true, force: true })
}
if (failures) process.exit(1)
console.log('PASS: alpha.4 real compiler generated project, static verify, launch, safe creation, manifest and runtime diagnostics')
