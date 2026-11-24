import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCodeFences } from './lib/code-fences.ts'
import { RELEASES, commandAdvice } from './lib/command-finder.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tag = 'v0.0.6-alpha.20'
const commit = 'b1a9347f93540fdf95b0ddecba4adc55a3b4bb98'
const read = (path: string) => readFileSync(join(root, path), 'utf8')
assert.equal(RELEASES.find(item => item.tag === tag)?.source, commit)
assert.deepEqual(commandAdvice(tag, 'exec-default').commands, ['scarp exec'])

function lesson(prefix: string) {
  const markdown = read('docs/' + prefix + 'guide/alpha20-language.md')
  assert.ok(markdown.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
  assert.ok(markdown.includes('https://github.com/scarp-lang/scarp/blob/' + commit + '/'))
  const blocks = extractCodeFences(markdown)
  assert.deepEqual(blocks.map(block => block.language),
    ['scarp', 'text', 'scarp', 'text', 'scarp', 'text', 'sh'])
  return blocks.map(({ language, code }) => ({ language, code }))
}
const english = lesson('')
const hindi = lesson('hi/')
assert.deepEqual(english, hindi, 'English and Hindi executable examples must match exactly')
const systems = ['', 'hi/'].map(prefix => {
  const page = read('docs/' + prefix + 'guide/alpha20-systems.md')
  assert.ok(page.includes('<!-- scarp-current-source: ' + commit + ' -->'))
  assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
  return extractCodeFences(page).map(({language, code}) => ({language, code}))
})
assert.deepEqual(systems[0], systems[1], 'Bilingual systems examples differ')
assert.deepEqual(systems[0].map(block => block.language), ['scarp', 'text', 'sh', 'rust', 'c'])
assert.equal(systems[0][1].code, '24\n-1')
const typeLessons = ['', 'hi/'].map(prefix => {
  const page = read('docs/' + prefix + 'guide/alpha20-types.md')
  assert.ok(page.includes('<!-- scarp-current-source: ' + commit + ' -->'))
  assert.ok(page.includes('<!-- scarp-cli-release: ' + tag + ' -->'))
  return extractCodeFences(page).map(({language, code}) => ({language, code}))
})
assert.deepEqual(typeLessons[0], typeLessons[1], 'Bilingual type examples differ')
assert.deepEqual(typeLessons[0].map(block => block.language), Array.from({length:5}, () => ['scarp','text']).flat())
const typeOutputs = [
  'Scarp true 12 2.4',
  '1000000000000000000000\n0.3\n0.30000000000000004',
  '7 9\n20 40',
  '1 2 8\n1 9\n-1',
  'true\nScarp\nNot found'
]
for (const [index, expected] of typeOutputs.entries()) {
  assert.equal(typeLessons[0][index * 2 + 1].code, expected, 'Type lesson stdout drift')
}
const outputs = [
  '0.3 true\n5.1\n0.30000000000000004',
  '(50, 100)\n(10, 20)',
  'true\ntrue\ntrue'
]
for (const [index, expected] of outputs.entries()) {
  assert.equal(english[index * 2 + 1].code, expected, 'Documented stdout drift')
}
const publishedEvidence = JSON.parse(read('data/compiler-latest-release.json')) as {
  compilerRef: string; assetDigests?: Record<string, string>
}
for (const prefix of ['', 'hi/']) {
  const release = read('docs/' + prefix + 'releases/' + tag + '.md')
  assert.ok(release.includes('<!-- scarp-current-source: ' + commit + ' -->'))
  assert.ok(release.includes('https://scarp-lang.github.io/downloads/'))
  if (publishedEvidence.compilerRef === tag && publishedEvidence.assetDigests) {
    for (const [name, digest] of Object.entries(publishedEvidence.assetDigests)) {
      if (!name.endsWith('.sha256') && name !== 'SHA256SUMS') {
        assert.ok(release.includes('`' + name + '` | `' + digest.slice(7) + '`'),
          prefix + ' archive checksum table differs from immutable evidence: ' + name)
      }
    }
  }
  for (const feature of ['scarp.project', '0.1d', 'scarp_checked_integer_function', 'SHA256SUMS']) {
    assert.ok(release.includes(feature), prefix + ' missing published feature: ' + feature)
  }
}

if (!process.argv[2]) {
  console.log('PASS: alpha.20 bilingual examples, expected stdout and immutable release evidence')
} else {
  const binary = resolve(process.argv[2])
  const compilerRoot = process.argv[3] ? resolve(process.argv[3]) : undefined
  const work = mkdtempSync(join(tmpdir(), 'scarp-docs-alpha20-'))
  function invoke(args: string[], cwd = work) {
    const result = spawnSync(binary, args, { cwd, encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024 })
    assert.equal(result.error, undefined, 'Cannot execute tagged compiler: ' + args.join(' '))
    return result
  }
  function run(args: string[], cwd = work) {
    const result = invoke(args, cwd)
    assert.equal(result.status, 0, args.join(' ') + ': ' + result.stderr)
    assert.equal(result.stderr, '', 'Unexpected stderr')
    return result.stdout
  }
  try {
    assert.equal(run(['version']), 'scarp 0.0.6-alpha.20\n')
    for (const [index, expected] of outputs.entries()) {
      const name = 'lesson-' + index + '.srp'
      writeFileSync(join(work, name), english[index * 2].code + '\n')
      assert.equal(run(['verify', name]), '')
      assert.equal(run(['exec', name]), expected + '\n', 'Lesson stdout differs: ' + name)
    }
    if (compilerRoot) {
      const rustExample = join(compilerRoot, 'examples', 'docs_alpha20_systems.rs')
      assert.ok(!existsSync(rustExample), 'Refusing to overwrite a compiler example')
      writeFileSync(rustExample, systems[0][3].code + '\n', { flag: 'wx' })
      try {
        const emitted = spawnSync('cargo', ['run', '--locked', '--offline', '--quiet',
          '--example', 'docs_alpha20_systems'], {
          cwd: compilerRoot, encoding: 'utf8', timeout: 120000, maxBuffer: 2 * 1024 * 1024
        })
        assert.equal(emitted.error, undefined)
        assert.equal(emitted.status, 0, emitted.stderr)
        assert.match(emitted.stdout, /^[1-9][0-9]*\n$/, 'Rust example must report emitted object length')
      } finally {
        rmSync(rustExample)
      }
    }
    writeFileSync(join(work, 'offset.srp'), systems[0][0].code + '\n')
    assert.equal(run(['verify', 'offset.srp']), '')
    assert.equal(run(['exec', 'offset.srp']), systems[0][1].code + '\n')
    for (const [index, expected] of typeOutputs.entries()) {
      const name = 'type-lesson-' + index + '.srp'
      writeFileSync(join(work, name), typeLessons[0][index * 2].code + '\n')
      assert.equal(run(['verify', name]), '')
      assert.equal(run(['exec', name]), expected + '\n', 'Type lesson stdout differs: ' + name)
    }
    for (const [index, source] of [
      'print(0.1d + 0.2);',
      'print(1d + 1);',
      'bind pair = (1, 2); pair[0] = 3;',
      'var pair = (1, 2); bind index = 0; pair[index] = 3;',
      'var pair = (1, 2); pair[0] = "wrong";',
      'var n: integer = 1; n = "wrong";',
      'bind wrong = [list: 1, true];',
      'bind wrong = [map: 1.5: 2];',
      'var values = [array: 1, 2]; values[0] = 3;',
      'variant V { Empty } bind x = new V::Empty;'
    ].entries()) {
      const name = 'invalid-' + index + '.srp'
      writeFileSync(join(work, name), source + '\n')
      const invalid = invoke(['exec', name])
      assert.notEqual(invalid.status, 0, 'Invalid example unexpectedly succeeded: ' + source)
      assert.equal(invalid.stdout, '', 'Invalid example emitted output')
      assert.ok(invalid.stderr.length > 0, 'Invalid example lacked a diagnostic')
    }
    run(['init', 'demo'])
    const project = join(work, 'demo')
    const manifest = join(project, 'scarp.project')
    assert.ok(existsSync(manifest), 'New project must create lowercase scarp.project')
    const expected = run(['exec'], project)
    // Rename through a distinct temporary name even on case-insensitive filesystems.
    const intermediate = join(project, 'manifest-migration.tmp')
    renameSync(manifest, intermediate)
    renameSync(intermediate, join(project, 'Scarp.project'))
    assert.equal(run(['exec'], project), expected, 'Legacy project filename must remain readable')
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
  console.log('PASS: alpha.20 actual lesson stdout, rejected source and lowercase/legacy project manifest')
}
