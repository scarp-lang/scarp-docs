import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyTutorialExamples, type ExecutableExample, type SupportingSource } from './lib/tutorial-evidence.ts'

interface CompilerBaseline { repository: string; release: string; releaseSourceCommit: string }
interface ConformanceCase { name: string; source: string; expected: string }
interface FixtureManifest { compilerRepository: string; compilerRef: string; compilerCommit: string; cases: ConformanceCase[]; upstreamGitBlobs: Record<string, string> }
interface TutorialManifest {
  compilerRepository: string
  compilerRelease: string
  compilerCommit: string
  tutorials: Array<{ page: string; cases: string[]; supportFiles?: string[] }>
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docs = resolve(root, 'docs')
const programs = resolve(root, 'conformance/programs')
const baseline = JSON.parse(readFileSync(resolve(root, 'data/compiler-baseline.json'), 'utf8')) as CompilerBaseline
const fixtureManifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as FixtureManifest
const mapping = JSON.parse(readFileSync(resolve(root, 'data/tutorial-evidence.json'), 'utf8')) as TutorialManifest
const fail = (message: string): never => { throw new Error(`Tutorial evidence: ${message}`) }

if (mapping.compilerRepository !== baseline.repository ||
    mapping.compilerRelease !== baseline.release ||
    mapping.compilerCommit !== baseline.releaseSourceCommit ||
    mapping.compilerRepository !== fixtureManifest.compilerRepository ||
    mapping.compilerRelease !== fixtureManifest.compilerRef ||
    mapping.compilerCommit !== fixtureManifest.compilerCommit) {
  fail('compiler identity does not match the pinned baseline and executable fixture manifest')
}
if (!Array.isArray(mapping.tutorials) || mapping.tutorials.length < 1) fail('no verified tutorials configured')

const cases = new Map(fixtureManifest.cases.map(item => [item.name, item]))
if (cases.size !== fixtureManifest.cases.length) fail('duplicate conformance case names')
const seenPages = new Set<string>()
let verifiedCases = 0
const failures: string[] = []

for (const entry of mapping.tutorials) {
  if (typeof entry.page !== 'string' || !/^tutorials\/[a-z0-9-]+\.md$/.test(entry.page)) {
    fail(`invalid tutorial page: ${String(entry.page)}`)
  }
  if (seenPages.has(entry.page)) fail(`duplicate tutorial page: ${entry.page}`)
  seenPages.add(entry.page)
  if (!Array.isArray(entry.cases) || !entry.cases.length) fail(`missing fixture cases for ${entry.page}`)
  if (new Set(entry.cases).size !== entry.cases.length) fail(`duplicate fixture cases for ${entry.page}`)

  const supportPaths = entry.supportFiles ?? []
  if (!Array.isArray(supportPaths) || new Set(supportPaths).size !== supportPaths.length) {
    fail(`duplicate/invalid supporting files in ${entry.page}`)
  }
  if (supportPaths.length && (entry.cases.length !== 1 || entry.cases[0] !== 'modules')) {
    fail(`supporting source files currently require the pinned modules case in ${entry.page}`)
  }
  const supportingSources: SupportingSource[] = supportPaths.map(name => {
    if (typeof name !== 'string' || !/^modules\/[a-z0-9_-]+\.srp$/.test(name)) {
      return fail(`invalid module source path ${String(name)}`)
    }
    if (!fixtureManifest.upstreamGitBlobs?.[name]) {
      return fail(`unverified source file ${name} is absent from the pinned compiler manifest`)
    }
    return { name, source: readFileSync(join(programs, name), 'utf8') }
  })

  const evidence: ExecutableExample[] = entry.cases.map(name => {
    const item = cases.get(name)
    if (!item) return fail(`unknown conformance case ${name} in ${entry.page}`)
    if (!/^[a-z0-9_-]+\.srp$/.test(item.source) || !/^[a-z0-9_-]+\.stdout$/.test(item.expected)) {
      return fail(`invalid fixture paths for ${name}`)
    }
    return {
      name,
      source: readFileSync(join(programs, item.source), 'utf8'),
      expected: readFileSync(join(programs, item.expected), 'utf8'),
      supportingSources
    }
  })
  for (const locale of ['en', 'hi'] as const) {
    const page = resolve(docs, locale === 'hi' ? `hi/${entry.page}` : entry.page)
    if (!existsSync(page)) { failures.push(`${locale}: missing ${entry.page}`); continue }
    try {
      const problems = verifyTutorialExamples(readFileSync(page, 'utf8'), evidence)
      failures.push(...problems.map(problem => `${locale}/${entry.page}: ${problem}`))
    } catch (error) {
      failures.push(`${locale}/${entry.page}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  verifiedCases += evidence.length
}

if (failures.length) {
  console.error(`FAIL: ${failures.length} tutorial evidence problems:\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`PASS: ${mapping.tutorials.length} bilingual tutorial(s), ${verifiedCases} pinned compiler source/output fixture pairs in each language`)
}
