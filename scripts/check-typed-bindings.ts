import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTypedBindingsLesson, typedLessonCases } from './lib/typed-bindings-evidence.ts'

type Case = { name: string; source: string; expected: string }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Case[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file: string): string => readFileSync(resolve(root, file), 'utf8')
const manifest = JSON.parse(read('conformance/alpha2-manifest.json')) as Manifest
const problems: string[] = []
if (manifest.compilerRepository !== 'scarp-lang/scarp' ||
    manifest.compilerRef !== 'v0.0.5-alpha.2' ||
    manifest.compilerCommit !== 'e4db8e191cd7ea623123cae7348450ca6c95b170') {
  problems.push('alpha.2 release manifest identity changed')
}
const cases = typedLessonCases.flatMap(name => {
  const item = manifest.cases.find(example => example.name === name)
  if (!item || !/^[a-z0-9_]+\.srp$/.test(item.source) || !/^[a-z0-9_]+\.stdout$/.test(item.expected)) {
    problems.push('missing or unsafe release fixture for ' + name)
    return []
  }
  return [{
    name: item.name,
    source: read('conformance/alpha2/' + item.source),
    expected: read('conformance/alpha2/' + item.expected)
  }]
})
problems.push(...verifyTypedBindingsLesson(
  read('docs/language/typed-bindings-alpha2.md'),
  read('docs/hi/language/typed-bindings-alpha2.md'),
  cases
))
if (problems.length) {
  for (const issue of problems) console.error('FAIL typed-binding lesson: ' + issue)
  process.exitCode = 1
} else {
  console.log('PASS: typed alpha.2 lesson source, stdout, English/Hindi parity and shipped CLI')
}
