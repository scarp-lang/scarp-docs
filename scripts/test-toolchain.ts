import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateToolchain, type ToolchainPackage } from './lib/toolchain-policy.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as ToolchainPackage
const yaml = readFileSync(resolve(root, '.github/dependabot.yml'), 'utf8')
assert.deepEqual(validateToolchain(pkg, yaml), [])

function mutatePackage(changes: Partial<ToolchainPackage>): ToolchainPackage {
  return {
    ...pkg,
    ...changes,
    devDependencies: { ...pkg.devDependencies, ...changes.devDependencies },
    scripts: { ...pkg.scripts, ...changes.scripts }
  }
}

for (const [name, changed] of [
  ['TypeScript 7', { typescript: '7.0.2' }],
  ['unsupported TypeScript prerelease', { typescript: '6.1.0-rc.1' }],
  ['old Vue checker', { 'vue-tsc': '2.2.12' }]
] as const) {
  assert.ok(validateToolchain(mutatePackage({ devDependencies: changed }), yaml).length,
    name + ' must be rejected')
}
assert.ok(validateToolchain(mutatePackage({
  scripts: { typecheck: 'tsc --noEmit -p tsconfig.json' }
}), yaml).some(error => error.includes('vue-tsc')), 'cannot skip Vue SFC checking')
assert.ok(validateToolchain(pkg, yaml.replace('version-update:semver-major', 'version-update:semver-patch'))
  .some(error => error.includes('Dependabot')), 'major-upgrade guard must stay enabled')
assert.ok(validateToolchain(pkg, yaml.replace('dependency-name: "typescript"', 'dependency-name: "vitepress"'))
  .some(error => error.includes('Dependabot')), 'guard must target TypeScript')
console.log('PASS: supported TypeScript and Vue versions, SFC checks and Dependabot guard with six negative tests')
