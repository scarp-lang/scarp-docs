import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const compiler = process.argv[2] ? resolve(process.argv[2]) : null
if (!compiler) {
  console.error('Usage: npm run test:alpha4-cli-compiler -- /absolute/path/to/scarp')
  process.exit(2)
}
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const output = read('conformance/alpha4/starter.stdout')
const sandbox = mkdtempSync(join(tmpdir(), 'scarp-docs-cli-alpha4-'))
const exec = (...args: string[]) => spawnSync(compiler, args, {
  cwd: sandbox, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024
})
const problems: string[] = []
function check(ok: boolean, note: string) {
  if (ok) console.log('PASS: alpha.4 CLI ' + note)
  else { problems.push(note); console.error('FAIL: alpha.4 CLI ' + note) }
}
function success(args: string[], expected?: string) {
  const result = exec(...args)
  return !result.error && result.status === 0 && result.stderr === '' &&
    (expected === undefined || result.stdout === expected)
}
function error(args: string[], code: number) {
  const result = exec(...args)
  return !result.error && result.status === code && result.stdout === '' &&
    result.stderr.length > 0
}

try {
  const version = exec('version')
  check(version.status === 0 && version.stdout.includes('0.0.5-alpha.4') &&
    version.stdout === exec('--version').stdout, 'exact published version and alias agree')
  for (const command of ['create', 'launch', 'verify']) {
    const help = exec('guide', command)
    check(help.status === 0 && help.stderr === '' &&
      help.stdout.includes('Usage: scarp ' + command),
      'tagged guidance for ' + command)
  }

  const diagnose = exec('diagnose', '--json')
  let capabilities: unknown = null
  try { capabilities = JSON.parse(diagnose.stdout) } catch { /* rejected below */ }
  const report = capabilities as {
    schema_version?: number; version?: string; project_workflow?: boolean
    native_executable?: boolean; package_manager?: boolean
  } | null
  check(diagnose.status === 0 && diagnose.stderr === '' &&
    report?.schema_version === 1 && report.version === '0.0.5-alpha.4' &&
    report.project_workflow === true && report.native_executable === false &&
    report.package_manager === false, 'real schema-1 offline capability report')

  check(success(['create', 'hello-world']), 'create new directory')
  const project = join(sandbox, 'hello-world')
  const source = join(project, 'src', 'main.srp')
  check(readFileSync(source, 'utf8') === read('conformance/alpha4/starter.srp'),
    'created entrypoint equals release-pinned source')
  check(success(['verify', 'hello-world'], ''), 'directory static verification silent')
  check(success(['verify', 'hello-world/src/main.srp'], ''), 'single-file static verification silent')
  check(success(['launch', 'hello-world'], output), 'project launch stdout equals release fixture')
  check(success(['exec', 'hello-world/src/main.srp'], output), 'file exec agrees with launch')
  check(success(['launch', '--max-steps', '500000', 'hello-world'], output),
    'project launch accepts runtime budget flags before directory')
  check(success(['launch', '--diagnostic-format=json', 'hello-world'], output),
    'diagnostic JSON flag leaves successful program stdout unchanged')
  check(success(['verify', '--diagnostic-format=json', 'hello-world'], ''),
    'diagnostic JSON flag leaves successful static verification silent')
  check(error(['verify', '--max-steps', '0', 'hello-world'], 2),
    'static directory verify rejects execution budgets as CLI usage failure')

  const inventory = exec('inspect', 'modules', '--json', 'hello-world/src/main.srp')
  let moduleJson: unknown = null
  try { moduleJson = JSON.parse(inventory.stdout) } catch { /* rejected below */ }
  check(inventory.status === 0 && inventory.stderr === '' &&
    (moduleJson as { schema_version?: number } | null)?.schema_version === 1,
    'published file module inspection returns schema-1 JSON inventory')

  // Mutate a fixture inside this disposable project, not the repository.
  writeFileSync(join(project, 'Scarp.project'),
    'scarp-project: 1\nname: hello-world\nentry: ../escape.srp\n', 'utf8')
  const broken = exec('verify', '--diagnostic-format=json', 'hello-world')
  let errorJson: unknown = null
  try { errorJson = JSON.parse(broken.stderr) } catch { /* rejected below */ }
  check(broken.status === 1 && broken.stdout === '' &&
    (errorJson as { schema_version?: number } | null)?.schema_version === 1,
    'invalid project manifest reports schema-1 error on stderr')
} finally {
  rmSync(sandbox, { recursive: true, force: true })
}
if (problems.length) {
  console.error('FAIL: ' + problems.length + ' alpha.4 CLI contract checks')
  process.exitCode = 1
} else {
  console.log('PASS: alpha.4 tagged compiler CLI, release boundaries, streams, budgets and JSON contracts')
}
