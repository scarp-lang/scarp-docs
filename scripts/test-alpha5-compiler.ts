import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const compiler = process.argv[2] ? resolve(process.argv[2]) : null
if (!compiler) {
  console.error('Usage: npm run test:alpha5-compiler -- /absolute/path/to/scarp')
  process.exit(2)
}
const read = (file: string): string => readFileSync(resolve(root, file), 'utf8')
const example = resolve(root, 'conformance/alpha5/native_scalar_repeat.srp')
const output = read('conformance/alpha5/native_scalar_repeat.stdout')
const tmp = mkdtempSync(join(tmpdir(), 'scarp-docs-alpha5-'))
const run = (args: string[]) => spawnSync(compiler, args, {
  cwd: tmp, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024
})
const errors: string[] = []
function check(ok: boolean, message: string) {
  if (!ok) { errors.push(message); console.error('FAIL: alpha.5 ' + message) }
  else console.log('PASS: alpha.5 ' + message)
}
const succeeds = (args: string[], expected?: string): boolean => {
  const r = run(args)
  return !r.error && r.status === 0 && r.stderr === '' &&
    (expected === undefined || r.stdout === expected)
}
const fails = (args: string[], code: number): boolean => {
  const r = run(args)
  return !r.error && r.status === code && r.stdout === '' && r.stderr.length > 0
}
try {
  const version = run(['version'])
  check(version.status === 0 && version.stdout.includes('0.0.5-alpha.5'),
    'published tagged binary version')

  check(succeeds(['verify', example], ''), 'scalar-repeat example statically verifies')
  check(succeeds(['exec', example], output), 'tagged interpreter stdout matches published bytes')

  const project = join(tmp, 'hello-scarp')
  const entry = join(project, 'src', 'main.srp')
  check(succeeds(['create', project]), 'create fresh manifest project without errors')
  check(succeeds(['verify', project], ''), 'verify project without running source')
  check(succeeds(['launch', project], 'Hello from Scarp!\n'), 'launch reads declared entrypoint')

  const byDir = run(['inspect', 'modules', '--json', project])
  const byFile = run(['inspect', 'modules', '--json', entry])
  const legacy = run(['modules', '--json', project])
  let inventory: { schema_version?: number } | null = null
  try { inventory = JSON.parse(byDir.stdout) as { schema_version?: number } } catch { /* see check */ }
  check(byDir.status === 0 && byDir.stderr === '' && inventory?.schema_version === 1,
    'project directory inspection returns successful schema-v1 JSON')
  check(byDir.status === 0 && byFile.status === 0 && byDir.stdout === byFile.stdout &&
      byFile.stderr === '', 'directory and single-file inventory bytes are identical')
  check(byDir.status === 0 && legacy.status === 0 && legacy.stdout === byDir.stdout &&
      legacy.stderr === '', 'legacy module inspection project alias matches canonical route')

  check(fails(['inspect', 'modules', '--max-steps', '1', project], 2),
    'static module inspection rejects execution budgets with usage error')

  writeFileSync(join(project, 'Scarp.project'),
    'scarp-project: 1\nname: hello-scarp\nentry: ../escape.srp\n', 'utf8')
  const invalid = run(['inspect', 'modules', '--diagnostic-format=json', '--json', project])
  let diagnostic: { schema_version?: number } | null = null
  try { diagnostic = JSON.parse(invalid.stderr) as { schema_version?: number } } catch { /* see check */ }
  check(invalid.status === 1 && invalid.stdout === '' && diagnostic?.schema_version === 1,
    'unsafe project manifest fails with schema-v1 error and no partial inventory')

  check(fails(['create', project], 1), 'project create refuses existing user directory')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
if (errors.length) process.exitCode = 1
else console.log('PASS: published alpha.5 binary, scalar repeat, project inspection parity, safe manifests and JSON diagnostics')
