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
let negative=0
function mustFail(name:string,modified:ToolchainPackage,config=yaml,contains?:string):void{
  const errors=validateToolchain(modified,config)
  assert.ok(errors.length>0,name+' must fail source/toolchain policy')
  if(contains)assert.ok(errors.some(error=>error.includes(contains)),
    name+' must fail the expected policy')
  negative++
}
for (const [name, changed] of [
  ['unreviewed TypeScript 7', {typescript:'7.0.2'}],
  ['unsupported TypeScript prerelease', {typescript:'6.1.0-rc.1'}],
  ['reintroduced VitePress', {vitepress:'1.6.4'}],
  ['reintroduced vue-tsc', {'vue-tsc':'3.3.13'}],
  ['unreviewed Markdown parser', {'markdown-it':'latest'}],
  ['unreviewed YAML parser', {yaml:'latest'}]
] as const) {
  mustFail(name,mutatePackage({devDependencies:changed}))
}
mustFail('missing Markdown parser',mutatePackage({
  devDependencies:{'markdown-it':undefined}
}),yaml,'markdown-it')
mustFail('Vue typechecker in main script',mutatePackage({
  scripts:{typecheck:'vue-tsc --noEmit -p tsconfig.json'}
}),yaml,'tsc')
mustFail('VitePress production build',mutatePackage({
  scripts:{'docs:build':'vitepress build docs'}
}),yaml,'Scarp-owned')
mustFail('VitePress local developer server',mutatePackage({
  scripts:{'docs:dev':'vitepress dev docs'}
}),yaml,'Scarp-owned')
mustFail('incorrect Dependabot scope',pkg,
  yaml.replace('dependency-name: "typescript"','dependency-name: "vitepress"'),'Dependabot')
mustFail('disabled major-upgrade review',pkg,
  yaml.replace('version-update:semver-major','version-update:semver-patch'),'Dependabot')
mustFail('obsolete VitePress ignore rule',pkg,
  yaml.replace('ignore:\n','ignore:\n      - dependency-name: "vitepress"\n        versions: ["1.6.4"]\n'),
  'obsolete')
console.log('PASS: Scarp-owned TypeScript toolchain, source-parser locks, VitePress removal and '+
  negative+' negative policy regressions')
