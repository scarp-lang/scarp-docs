import { extractCodeFences } from './code-fences.ts'

// The only CLI reference in this suite is the *published* alpha.4 tag,
// deliberately separate from the alpha.3 historical CLI contract.
export const publishedAlpha4Cli = {
  tag: 'v0.0.5-alpha.4',
  sourceCommit: '79141329176f5dce51457e90a6652902f6432135',
  shell: [
    'scarp version',
    'scarp guide',
    'scarp diagnose --json',
    'scarp create hello-world',
    'scarp verify hello-world',
    'scarp launch hello-world',
    'scarp verify hello-world/src/main.srp',
    'scarp exec hello-world/src/main.srp',
    'scarp launch --max-steps 500000 hello-world',
    'scarp verify --diagnostic-format=json hello-world',
    'scarp launch --diagnostic-format=json hello-world',
    'scarp inspect modules --json hello-world/src/main.srp'
  ]
} as const

export function validatePublishedAlpha4Cli(
  english: string, hindi: string, manifest: string, source: string,
  output: string, config: string
): string[] {
  const errors: string[] = []
  const enFences = extractCodeFences(english)
  const hiFences = extractCodeFences(hindi)
  if (JSON.stringify(enFences.map(f => [f.language, f.code])) !==
      JSON.stringify(hiFences.map(f => [f.language, f.code]))) {
    errors.push('English/Hindi CLI code fence drift')
  }
  const tag = publishedAlpha4Cli.tag
  const sha = publishedAlpha4Cli.sourceCommit
  for (const [label, page, fences, prefix] of [
    ['English', english, enFences, ''],
    ['Hindi', hindi, hiFences, '/hi']
  ] as const) {
    for (const expected of [
      '<!-- scarp-cli-release: ' + tag + ' -->',
      '<!-- scarp-project-release: ' + tag + ' -->',
      '<!-- scarp-alpha4-cli-reference: ' + sha + ' -->',
      'https://github.com/scarp-lang/scarp/releases/tag/' + tag,
      'https://github.com/scarp-lang/scarp/commit/' + sha,
      'https://github.com/scarp-lang/scarp/blob/' + tag + '/src/main.rs',
      'https://github.com/scarp-lang/scarp/blob/' + tag + '/src/project.rs',
      '](' + prefix + '/tooling/cli)',
      '](' + prefix + '/tooling/cli-alpha1)',
      '](' + prefix + '/guide/quickstart-alpha4)',
      '](' + prefix + '/guide/installation)',
      '](' + prefix + '/reference/compatibility)',
      '4096',
      '--max-steps',
      '--max-prints',
      '--max-call-depth',
      '--max-calls',
      '--max-live-slots',
      '--max-capture-bytes',
      '--max-vector-bytes',
      '--max-text-bytes',
      'inspect modules --json DIRECTORY',
      'project_workflow',
      'native_executable'
    ]) {
      if (!page.includes(expected)) errors.push(label + ': missing published alpha.4 CLI evidence ' + expected)
    }
    // A later evidence footnote cannot compensate for a stale current-release
    // link at the very top of a beginner-facing command reference.
    const introduction = page.split(/^## /m, 1)[0]
    if (!introduction.includes('https://github.com/scarp-lang/scarp/releases/tag/' + tag) ||
        !introduction.includes('https://github.com/scarp-lang/scarp/commit/' + sha)) {
      errors.push(label + ': primary release reference is stale')
    }
    const commands = fences.filter(f => f.language === 'sh')
      .flatMap(f => f.code.split(/\r?\n/).map(x => x.trim()))
    for (const command of publishedAlpha4Cli.shell) {
      if (!commands.includes(command)) errors.push(label + ': missing documented alpha.4 command ' + command)
    }
    if (commands.some(line => /^scarp (?:build|compile|install|polish)\b/.test(line) ||
        /^scarp inspect modules --json (?:hello-world|DIRECTORY)$/.test(line))) {
      errors.push(label + ': unshipped alpha.4 command appears in runnable shell code')
    }
    if (!fences.some(f => f.language === 'text' && f.code === manifest.trim()) ||
        !fences.some(f => f.language === 'scarp' && f.code === source.trim()) ||
        !fences.some(f => f.language === 'text' && f.code === output.trim())) {
      errors.push(label + ': release-pinned manifest, source or stdout changed')
    }
    if (label === 'Hindi' && (page.match(/[\u0900-\u097f]/gu)?.length ?? 0) < 300) {
      errors.push('Hindi: CLI guide requires substantial translated prose')
    }
  }
  for (const nav of [
    "{ text: 'CLI (alpha.4)', link: '/tooling/cli-alpha4' }",
    "{ text: 'CLI (alpha.4)', link: '/hi/tooling/cli-alpha4' }",
    "{ text: 'Command-line interface (alpha.4)', link: '/tooling/cli-alpha4' }",
    "{ text: 'CLI संदर्भ (alpha.4)', link: '/hi/tooling/cli-alpha4' }"
  ]) {
    if (!config.includes(nav)) errors.push('VitePress navigation missing current CLI reference: ' + nav)
  }
  return errors
}
