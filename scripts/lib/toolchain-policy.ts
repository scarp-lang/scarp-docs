/**
 * Guard the standalone TypeScript documentation build after VitePress removal.
 * TS6 is pinned because the engine uses the programmatic transpileModule API;
 * review TypeScript 7 API changes before lifting the major-upgrade hold.
 */
export interface ToolchainPackage {
  devDependencies?: Record<string, unknown>
  scripts?: Record<string, unknown>
}

function npmDependabotBlock(yaml: string): string {
  const begin = yaml.indexOf('  - package-ecosystem: npm')
  if (begin < 0) return ''
  const end = yaml.indexOf('\n  - package-ecosystem:', begin + 1)
  return yaml.slice(begin, end === -1 ? undefined : end)
}

export function validateToolchain(pkg: ToolchainPackage, dependabotYaml: string): string[] {
  const errors: string[] = []
  const deps = pkg.devDependencies ?? {}
  const ts = deps.typescript
  if (typeof ts !== 'string' || !/^6\.0\.\d+$/.test(ts)) {
    errors.push('TypeScript must remain pinned to the supported 6.0.x transpilation line')
  }
  for (const dependency of ['markdown-it','yaml']) {
    const version=deps[dependency]
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
      errors.push(dependency + ' must be an explicitly pinned source-parsing dependency')
    }
  }
  // markdown-it 15+ ships its own declarations. Stale DefinitelyTyped 14.x
  // declarations would introduce duplicate, version-mismatched interfaces.
  const parser = deps['markdown-it']
  const parserMajor = typeof parser === 'string' ? Number.parseInt(parser.split('.')[0] ?? '', 10) : NaN
  if (parserMajor >= 15 && '@types/markdown-it' in deps) {
    errors.push('markdown-it 15+ bundles its own types: remove obsolete @types/markdown-it')
  }
  for (const removed of ['vitepress','vue-tsc']) {
    if (removed in deps) errors.push('Removed framework/checker dependency must not return: ' + removed)
  }

  const scripts = pkg.scripts ?? {}
  if (scripts.typecheck !== 'tsc --noEmit -p tsconfig.json') {
    errors.push('TypeScript-only source must be checked using tsc')
  }
  if (scripts['docs:build'] !== 'tsx scripts/scarp-site/build.ts --production') {
    errors.push('Production docs:build must use the Scarp-owned static site generator')
  }
  for (const script of ['docs:dev','docs:preview']) {
    const value=scripts[script]
    if (typeof value !== 'string' || !value.includes('scripts/scarp-site/serve-dev.ts')) {
      errors.push(script + ' must use the Scarp-owned local preview server')
    }
  }

  const npm = npmDependabotBlock(dependabotYaml)
  if (!npm.includes('ignore:') ||
      !/dependency-name:\s*["']?typescript["']?/.test(npm) ||
      !npm.includes('version-update:semver-major')) {
    errors.push('Dependabot must retain the TypeScript major-upgrade review gate')
  }
  if (/dependency-name:\s*["']?(?:vitepress|vue-tsc)["']?/.test(npm)) {
    errors.push('Dependabot must not retain obsolete VitePress or vue-tsc rules')
  }
  return errors
}
