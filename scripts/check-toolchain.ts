import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateToolchain, type ToolchainPackage } from './lib/toolchain-policy.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as ToolchainPackage
const dependabot = readFileSync(resolve(root, '.github/dependabot.yml'), 'utf8')
const errors = validateToolchain(pkg, dependabot)
if (errors.length) {
  for (const error of errors) console.error('FAIL toolchain: ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: TypeScript 6, Vue SFC checker and Dependabot major-update guard')
}
