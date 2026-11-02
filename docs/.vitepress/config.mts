import { defineConfig } from 'vitepress'
import { pageSeoHead } from './site-meta'

/** Scarp source-language grammar; deliberately limited to implemented syntax. */
const scarpGrammar = {
  name: 'scarp',
  scopeName: 'source.scarp',
  repository: {}, // required by Shiki's typed TextMate grammar registration
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
  locales: {
    root: { label: 'English', lang: 'en-US' },
    hi: {
      label: 'हिन्दी',
      lang: 'hi-IN',
      link: '/hi/',
      title: 'Scarp दस्तावेज़',
      description: 'Scarp प्रोग्रामिंग लैंग्वेज के आधिकारिक हिन्दी दस्तावेज़',
      themeConfig: {
        outline: { label: 'इस पृष्ठ पर' },
        docFooter: { prev: 'पिछला', next: 'अगला' },
        lastUpdated: { text: 'अंतिम अपडेट' },
        nav: [
          { text: 'शुरुआत', link: '/hi/guide/installation' },
          { text: 'भाषा', link: '/hi/language/overview' },
          { text: 'CLI', link: '/hi/tooling/cli' },
          { text: 'उदाहरण', link: '/hi/examples/' },
          { text: 'समुदाय', items: [
            { text: 'आधिकारिक लिंक', link: '/hi/community/social' },
            { text: 'योगदान', link: '/hi/community/contributing' },
            { text: 'DEV Community', link: 'https://dev.to/scarplang' },
            { text: 'Facebook', link: 'https://facebook.com/ScarpLang' },
            { text: 'LinkedIn', link: 'https://linkedin.com/company/ScarpLang' },
            { text: 'Reddit', link: 'https://www.reddit.com/r/ScarpLang/' }
          ] },
          { text: 'v0.0.5-alpha.1', link: '/hi/reference/status' }
        ],
        sidebar: [
          { text: 'स्वागत', items: [
            { text: 'परिचय', link: '/hi/guide/introduction' },
            { text: 'इंस्टॉलेशन', link: '/hi/guide/installation' },
            { text: 'पहला प्रोग्राम', link: '/hi/guide/first-program' },
            { text: 'सरल शब्दावली', link: '/hi/guide/glossary' },
            { text: 'फ़ंक्शन अभ्यास (सत्यापित)', link: '/hi/tutorials/verified-functions' },
            { text: 'लूप ट्यूटोरियल', link: '/hi/tutorials/repeat-and-loops' },
            { text: 'आउटपुट और नई लाइन', link: '/hi/tutorials/verified-output' },
            { text: 'न्यूमेरिकल वैक्टर अभ्यास', link: '/hi/tutorials/verified-vectors' },
            { text: 'सत्यापित टाइल अभ्यास', link: '/hi/tutorials/verified-tiles' },
            { text: 'वर्गीकरण और संभावनाएँ', link: '/hi/tutorials/verified-classification' },
            { text: 'मॉड्यूल ट्यूटोरियल', link: '/hi/tutorials/modules-walkthrough' }
          ] },
          { text: 'भाषा संदर्भ', items: [
            { text: 'अवलोकन', link: '/hi/language/overview' },
            { text: 'वेरिएबल और स्कोप', link: '/hi/language/variables' },
            { text: 'डेटा प्रकार', link: '/hi/language/types' },
            { text: 'ऑपरेटर', link: '/hi/language/operators' },
            { text: 'कंट्रोल फ्लो', link: '/hi/language/control-flow' },
            { text: 'फ़ंक्शन', link: '/hi/language/functions' },
            { text: 'मॉड्यूल', link: '/hi/language/modules' },
            { text: 'आउटपुट', link: '/hi/language/output' },
            { text: 'मेमोरी', link: '/hi/language/memory' },
            { text: 'वैक्टर और टाइल', link: '/hi/language/numerics' }
          ] },
          { text: 'टूलिंग और संदर्भ', items: [
            { text: 'CLI', link: '/hi/tooling/cli' },
            { text: 'समस्या निवारण', link: '/hi/tooling/troubleshooting' },
            { text: 'फीचर स्थिति', link: '/hi/reference/status' },
            { text: 'सत्यापन', link: '/hi/reference/evidence' },
            { text: 'रनटाइम बजट', link: '/hi/reference/budgets' },
            { text: 'त्रुटि कोड', link: '/hi/reference/diagnostics' },
            { text: 'Built-ins', link: '/hi/reference/library' },
            { text: 'सोर्स सुरक्षा', link: '/hi/reference/source-loading' },
            { text: 'Rust embedding', link: '/hi/reference/rust-embedding' },
            { text: 'Compatibility', link: '/hi/reference/compatibility' }
          ] },
          { text: 'उदाहरण और समुदाय', items: [
            { text: 'उदाहरण', link: '/hi/examples/' },
            { text: 'सोशल लिंक', link: '/hi/community/social' },
            { text: 'योगदान करें', link: '/hi/community/contributing' },
            { text: 'मेंटेनर सूची', link: '/hi/project/maintenance' },
            { text: 'डिप्लॉयमेंट गिनती', link: '/hi/project/deployments' }
          ] }
        ]
      }
    }
  },
  base: '/scarp-docs/',
  cleanUrls: true,
  appearance: true,
  sitemap: { hostname: 'https://scarp-lang.github.io/scarp-docs/' },
  // Absolute canonical and reciprocal language URLs for the static bilingual output.
  transformHead: ({ page }) => pageSeoHead(page),
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
    // Official project accounts confirmed through public profiles or maintainer-provided URLs.
    // Add other platforms only after confirming their exact official URLs.
    socialLinks: [
      { icon: 'github', link: 'https://github.com/scarp-lang', ariaLabel: 'Scarp on GitHub' },
      { icon: 'x', link: 'https://x.com/ScarpLang', ariaLabel: 'Scarp on X' },
      { icon: 'youtube', link: 'https://www.youtube.com/@ScarpLang', ariaLabel: 'Scarp on YouTube' },
      { icon: 'instagram', link: 'https://www.instagram.com/scarplang/', ariaLabel: 'Scarp on Instagram' },
      { icon: 'facebook', link: 'https://facebook.com/ScarpLang', ariaLabel: 'Scarp on Facebook' },
      { icon: 'linkedin', link: 'https://linkedin.com/company/ScarpLang', ariaLabel: 'Scarp on LinkedIn' },
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
        { text: 'Scarp on Facebook', link: 'https://facebook.com/ScarpLang' },
        { text: 'Scarp on LinkedIn', link: 'https://linkedin.com/company/ScarpLang' },
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
        { text: 'Glossary for beginners', link: '/guide/glossary' },
        { text: 'Verified functions tutorial', link: '/tutorials/verified-functions' },
        { text: 'Repeat and while tutorial', link: '/tutorials/repeat-and-loops' },
        { text: 'Verified output tutorial', link: '/tutorials/verified-output' },
        { text: 'Verified vectors tutorial', link: '/tutorials/verified-vectors' },
        { text: 'Verified tiles tutorial', link: '/tutorials/verified-tiles' },
        { text: 'Verified classification tutorial', link: '/tutorials/verified-classification' },
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
        { text: 'Docs maintainer checklist', link: '/project/maintenance' },
        { text: 'Pages deployments', link: '/project/deployments' }
      ] }
    ],
    footer: {
      message: `Documentation source is MIT licensed · Compiler source: ${sourceRepo}`,
      copyright: 'Copyright © 2026 Scarp contributors'
    }
  }
})
