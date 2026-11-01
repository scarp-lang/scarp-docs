import { defineConfig } from 'vitepress'

/** Scarp source-language grammar; deliberately limited to implemented syntax. */
const scarpGrammar = {
  name: 'scarp',
  scopeName: 'source.scarp',
  patterns: [
    { name: 'comment.line.double-slash.scarp', match: '//.*$' },
    { name: 'string.quoted.double.scarp', begin: '"', end: '"', patterns: [
      { name: 'constant.character.escape.scarp', match: '\\\\[\\\\"ntr]' }
    ] },
    { name: 'constant.numeric.scarp', match: '\\b(?:[0-9]+\\.[0-9]+(?:[eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+|[0-9]+)\\b' },
    { name: 'constant.language.boolean.scarp', match: '\\b(?:true|false)\\b' },
    { name: 'keyword.control.scarp', match: '\\b(?:if|elif|else|while|repeat|break|continue|return|needs|ensures|import|as|pub)\\b' },
    { name: 'storage.type.scarp', match: '\\b(?:integer|float|boolean|string|vector|tile|unit)\\b' },
    { name: 'storage.modifier.scarp', match: '\\b(?:bind|var|funcra|pure)\\b' },
    { name: 'support.function.output.scarp', match: '\\b(?:print|println|write|eprint|ewrite)\\b(?=\\s*\\()' },
    { name: 'keyword.operator.word.scarp', match: '\\b(?:and|or|not)\\b' }
  ]
}

const sourceRepo = 'https://github.com/scarp-lang/scarp'
const docsRepo = 'https://github.com/scarp-lang/scarp-docs'

export default defineConfig({
  title: 'Scarp',
  description: 'The official documentation for the experimental Scarp Programming Language',
  lang: 'en-US',
  base: '/scarp-docs/',
  cleanUrls: true,
  appearance: true,
  sitemap: { hostname: 'https://scarp-lang.github.io/scarp-docs/' },
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['link', { rel: 'icon', href: 'https://avatars.githubusercontent.com/u/350973173?v=4' }]
  ],
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    languages: [scarpGrammar]
  },
  themeConfig: {
    logo: 'https://avatars.githubusercontent.com/u/350973173?v=4',
    siteTitle: 'Scarp',
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    docFooter: { prev: 'Previous', next: 'Next' },
    editLink: { pattern: `${docsRepo}/edit/main/docs/:path`, text: 'Improve this page on GitHub' },
    // Public Scarp accounts verified against their published profile descriptions.
    // Add other platforms only after confirming their exact official URLs.
    socialLinks: [
      { icon: 'github', link: 'https://github.com/scarp-lang', ariaLabel: 'Scarp on GitHub' },
      { icon: 'x', link: 'https://x.com/ScarpLang', ariaLabel: 'Scarp on X' },
      { icon: 'youtube', link: 'https://www.youtube.com/@ScarpLang', ariaLabel: 'Scarp on YouTube' },
      { icon: 'instagram', link: 'https://www.instagram.com/scarplang/', ariaLabel: 'Scarp on Instagram' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/scarplang.bsky.social', ariaLabel: 'Scarp on Bluesky' },
      { icon: 'threads', link: 'https://www.threads.net/@scarplang', ariaLabel: 'Scarp on Threads' }
    ],
    nav: [
      { text: 'Guide', link: '/guide/installation' },
      { text: 'Language', link: '/language/overview' },
      { text: 'CLI', link: '/tooling/cli' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Community', items: [
        { text: 'DEV Community', link: 'https://dev.to/scarplang' },
        { text: 'Scarp on Reddit', link: 'https://www.reddit.com/r/ScarpLang/' },
        { text: 'Official channels', link: '/community/social' },
        { text: 'Contributing', link: '/community/contributing' }
      ] },
      { text: 'v0.0.5-alpha.1', items: [
        { text: 'Feature status', link: '/reference/status' },
        { text: 'Compiler releases', link: `${sourceRepo}/releases` }
      ] }
    ],
    sidebar: [
      { text: 'Welcome', items: [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Your first program', link: '/guide/first-program' },
        { text: 'Repeat and while tutorial', link: '/tutorials/repeat-and-loops' },
        { text: 'Source modules tutorial', link: '/tutorials/modules-walkthrough' }
      ] },
      { text: 'Language', items: [
        { text: 'Overview', link: '/language/overview' },
        { text: 'Variables and scopes', link: '/language/variables' },
        { text: 'Types and values', link: '/language/types' },
        { text: 'Operators', link: '/language/operators' },
        { text: 'Control flow', link: '/language/control-flow' },
        { text: 'Functions', link: '/language/functions' },
        { text: 'Source modules', link: '/language/modules' },
        { text: 'Output streams', link: '/language/output' },
        { text: 'Memory and lifetimes', link: '/language/memory' },
        { text: 'Vectors and tiles', link: '/language/numerics' }
      ] },
      { text: 'Tools and reference', items: [
        { text: 'Command-line interface', link: '/tooling/cli' },
        { text: 'Troubleshooting', link: '/tooling/troubleshooting' },
        { text: 'Feature status', link: '/reference/status' },
        { text: 'Evidence and testing', link: '/reference/evidence' },
        { text: 'Runtime budgets', link: '/reference/budgets' },
        { text: 'Diagnostics', link: '/reference/diagnostics' },
        { text: 'Built-ins and standard library', link: '/reference/library' },
        { text: 'Module loading and security', link: '/reference/source-loading' },
        { text: 'Embed in Rust', link: '/reference/rust-embedding' },
        { text: 'Compatibility', link: '/reference/compatibility' }
      ] },
      { text: 'Learn and contribute', items: [
        { text: 'Verified examples', link: '/examples/' },
        { text: 'Official social channels', link: '/community/social' },
        { text: 'Contributing', link: '/community/contributing' },
        { text: 'Docs maintainer checklist', link: '/project/maintenance' }
      ] }
    ],
    footer: {
      message: `Documentation source is MIT licensed · Compiler source: ${sourceRepo}`,
      copyright: 'Copyright © 2026 Scarp contributors'
    }
  }
})
