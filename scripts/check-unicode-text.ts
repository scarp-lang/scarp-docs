import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPublishedUnicodeLesson } from './lib/unicode-text-evidence.ts'

type Case = { name: string; source: string; expected: string }
type Manifest = { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: Case[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const manifest = (version: 2 | 3): Manifest =>
  JSON.parse(read('conformance/alpha' + version + '-manifest.json')) as Manifest
const errors: string[] = []
function entry(version: 2 | 3, name: string, expectedRef: string, expectedCommit: string) {
  const m = manifest(version)
  if (m.compilerRepository !== 'scarp-lang/scarp' || m.compilerRef !== expectedRef ||
      m.compilerCommit !== expectedCommit) errors.push('invalid alpha.' + version + ' release source identity')
  const item = m.cases.find(x => x.name === name)
  if (!item || !/^[a-z0-9_]+\.srp$/.test(item.source) || !/^[a-z0-9_]+\.stdout$/.test(item.expected)) {
    errors.push('missing or unsafe tagged example ' + name)
    return { name: 'invalid', source: '', expected: '' }
  }
  return {
    name: item.name,
    source: read('conformance/alpha' + version + '/' + item.source),
    expected: read('conformance/alpha' + version + '/' + item.expected)
  }
}
const examples = {
  alpha2: entry(2, 'unicode-text-queries', 'v0.0.5-alpha.2',
    'e4db8e191cd7ea623123cae7348450ca6c95b170'),
  alpha3: entry(3, 'unicode-text-construction', 'v0.0.5-alpha.3',
    '7715c28df09c7703b39e14fddb963275b25df476')
}
errors.push(...verifyPublishedUnicodeLesson(
  read('docs/language/unicode-text.md'),
  read('docs/hi/language/unicode-text.md'),
  examples
))
if (errors.length) {
  for (const error of errors) console.error('FAIL Unicode release evidence: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: bilingual Unicode lesson, exact alpha.2 query/alpha.3 construction fixtures and version-scoped commands')
}
