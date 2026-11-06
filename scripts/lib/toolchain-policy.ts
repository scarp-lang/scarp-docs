/**
 * Prevent accidental adoption of TypeScript 7 before Vue's embedded-language
 * checker can use its native compiler API. This is a deliberate compatibility
 * hold, not an assertion that TypeScript 7 is generally unusable.
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
  const vue = deps['vue-tsc']
  // Stay on the supported TypeScript 6 line until Vue tooling supports TS7.
  if (typeof ts !== 'string' || !/^6\.0\.\d+$/.test(ts)) {
    errors.push('TypeScript must remain pinned to the supported 6.0.x line')
  }
  if (typeof vue !== 'string' || !/^3\.3\.\d+$/.test(vue)) {
    errors.push('Vue SFC type checking must use the reviewed vue-tsc 3.3.x line')
  }
  if (pkg.scripts?.typecheck !== 'vue-tsc --noEmit -p tsconfig.json') {
    errors.push('Vue and TypeScript sources must retain the vue-tsc typecheck gate')
  }
  const npm = npmDependabotBlock(dependabotYaml)
  if (!npm.includes('ignore:') ||
      !/dependency-name:\s*["']?typescript["']?/.test(npm) ||
      !npm.includes('version-update:semver-major')) {
    errors.push('Dependabot npm updates must ignore TypeScript major versions')
  }
  return errors
}
