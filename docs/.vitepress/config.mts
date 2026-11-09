import { defineConfig } from 'vitepress'
import { pageSeoHead } from '../../scripts/scarp-site/seo'
import { localSearchOptions } from './local-search'

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
    { name: 'storage.type.scarp', match: '\\b(?:integer|float|boolean|string|vector|integers|tile|unit)\\b' },
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
        // Accessible labels on mobile, theme switcher and language navigation.
        sidebarMenuLabel: 'मेनू',
        returnToTopLabel: 'ऊपर लौटें',
        langMenuLabel: 'भाषा बदलें',
        skipToContentLabel: 'मुख्य सामग्री पर जाएँ',
        darkModeSwitchLabel: 'रंग योजना',
        lightModeSwitchTitle: 'हल्के रंगों में बदलें',
        darkModeSwitchTitle: 'गहरे रंगों में बदलें',
        outline: { label: 'इस पृष्ठ पर' },
        docFooter: { prev: 'पिछला', next: 'अगला' },
        lastUpdated: { text: 'अंतिम अपडेट' },
        // Keep the top bar narrow enough for the language, search and theme controls.
        // Historic releases, CLI reference and the remaining guides live in sidebar.
        nav: [
          { text: 'सीखें', link: '/hi/guide/learning-path' },
          { text: 'इंस्टॉल', link: '/hi/guide/installation-alpha6' },
          { text: 'उदाहरण', link: '/hi/examples/' },
          { text: 'रिलीज़', items: [
            { text: 'नवीनतम: v0.0.6-alpha.4', link: '/hi/releases/v0.0.6-alpha.4' },
            { text: 'पुरानी v0.0.6-alpha.1 रिलीज़', link: '/hi/releases/v0.0.6-alpha.1' },
            { text: 'CLI (alpha.6)', link: '/hi/tooling/cli-alpha6' },
            { text: 'CLI (alpha.5)', link: '/hi/tooling/cli-alpha5' },
            { text: 'CLI (alpha.4)', link: '/hi/tooling/cli-alpha4' },
            { text: 'पिछला: v0.0.5-alpha.5', link: '/hi/releases/v0.0.5-alpha.5' },
            { text: 'Alpha.4 project workflow', link: '/hi/releases/v0.0.5-alpha.4' },
            { text: 'Alpha.3 CLI', link: '/hi/releases/v0.0.5-alpha.3' },
            { text: 'Alpha.2 examples', link: '/hi/releases/v0.0.5-alpha.2' },
            { text: 'प्रकाशित features', link: '/hi/reference/status' },
            { text: 'मुख्य reference: v0.0.5-alpha.1', link: '/hi/reference/status' },
            { text: 'अपग्रेड जाँच: alpha.1 → alpha.2', link: '/hi/reference/upgrade-readiness' }
          ] },
          { text: 'समुदाय', items: [
            { text: 'आधिकारिक लिंक', link: '/hi/community/social' },
            { text: 'योगदान', link: '/hi/community/contributing' },
            { text: 'DEV Community', link: 'https://dev.to/scarplang' },
            { text: 'Facebook', link: 'https://facebook.com/ScarpLang' },
            { text: 'LinkedIn', link: 'https://linkedin.com/company/ScarpLang' },
            { text: 'Discord #welcome', link: 'https://discord.com/channels/1566388621085253663/1566389853531152454' },
            { text: 'Discord #language-development', link: 'https://discord.com/channels/1566388621085253663/1566388870826827856' },
            { text: 'Reddit', link: 'https://www.reddit.com/r/ScarpLang/' }
          ] }
        ],
        sidebar: [
          { text: 'स्वागत', items: [
            { text: 'परिचय', link: '/hi/guide/introduction' },
            { text: 'दस्तावेज़ खोजें', link: '/hi/guide/search-and-navigation' },
            { text: 'Offline डाउनलोड', link: '/hi/guide/offline-docs' },
            { text: 'इंस्टॉलेशन (alpha.6)', link: '/hi/guide/installation-alpha6' },
            { text: 'सात चरणों वाला Learning Path', link: '/hi/guide/learning-path' },
            { text: 'पहला Alpha.6 project और symbols', link: '/hi/tutorials/project-symbol-navigation-alpha6' },
            { text: 'Alpha.4 project शुरुआत', link: '/hi/guide/quickstart-alpha4' },
            { text: 'Alpha.3 file शुरुआत', link: '/hi/guide/quickstart-alpha3' },
            { text: 'Alpha.3 से alpha.4 माइग्रेशन', link: '/hi/guide/migrate-alpha3-to-alpha4' },
            { text: 'पुराना इंस्टॉलेशन (alpha.5)', link: '/hi/guide/installation-alpha5' },
            { text: 'इंस्टॉलेशन (alpha.4)', link: '/hi/guide/installation' },
            { text: 'पहला प्रोग्राम (v0.0.6-alpha.4)', link: '/hi/guide/first-program-alpha4' },
            { text: 'पहला प्रोग्राम (पुराना v0.0.5-alpha.1)', link: '/hi/guide/first-program' },
            { text: 'सरल शब्दावली', link: '/hi/guide/glossary' },
            { text: 'फ़ंक्शन अभ्यास (सत्यापित)', link: '/hi/tutorials/verified-functions' },
            { text: 'लूप ट्यूटोरियल', link: '/hi/tutorials/repeat-and-loops' },
            { text: 'आउटपुट और नई लाइन', link: '/hi/tutorials/verified-output' },
            { text: 'न्यूमेरिकल वैक्टर अभ्यास', link: '/hi/tutorials/verified-vectors' },
            { text: 'सत्यापित टाइल अभ्यास', link: '/hi/tutorials/verified-tiles' },
            { text: 'वर्गीकरण और संभावनाएँ', link: '/hi/tutorials/verified-classification' },
            { text: 'Alpha.2 collections और learning', link: '/hi/tutorials/alpha2-collections-and-learning' },
            { text: 'Alpha.2 module constants और JSON', link: '/hi/tutorials/alpha2-module-constants-and-inspection' },
            { text: 'Alpha.2 त्रुटियाँ और सुधार', link: '/hi/tutorials/alpha2-diagnostics-and-repairs' },
            { text: 'मॉड्यूल ट्यूटोरियल', link: '/hi/tutorials/modules-walkthrough' }
          ] },
          { text: 'भाषा संदर्भ', items: [
            { text: 'अवलोकन', link: '/hi/language/overview' },
            { text: 'वेरिएबल और स्कोप', link: '/hi/language/variables' },
            { text: 'Typed bindings और conversions (alpha.2)', link: '/hi/language/typed-bindings-alpha2' },
            { text: 'डेटा प्रकार', link: '/hi/language/types' },
            { text: 'Unicode text (alpha.2–alpha.3)', link: '/hi/language/unicode-text' },
            { text: 'ऑपरेटर', link: '/hi/language/operators' },
            { text: 'Bitwise ऑपरेटर (alpha.2)', link: '/hi/language/bitwise-operators-alpha2' },
            { text: 'कंट्रोल फ्लो', link: '/hi/language/control-flow' },
            { text: 'फ़ंक्शन', link: '/hi/language/functions' },
            { text: 'मॉड्यूल', link: '/hi/language/modules' },
            { text: 'Modules और public API (alpha.1–alpha.2)', link: '/hi/language/modules-and-visibility' },
            { text: 'आउटपुट', link: '/hi/language/output' },
            { text: 'मेमोरी', link: '/hi/language/memory' },
            { text: 'वैक्टर और टाइल', link: '/hi/language/numerics' },
            { text: 'प्रकाशित वैज्ञानिक फ़ंक्शन (alpha.4)', link: '/hi/language/scientific-kernels-alpha4' },
            { text: 'RMS (alpha.6)', link: '/hi/language/rms-alpha6' }
          ] },
          { text: 'टूलिंग और संदर्भ', items: [
            { text: 'CLI (alpha.6) — symbols', link: '/hi/tooling/cli-alpha6' },
            { text: 'CLI Command Finder', link: '/hi/tooling/command-finder' },
            { text: 'Compiler diagnose (alpha.6)', link: '/hi/tooling/diagnose-alpha6' },
            { text: 'AST debugging (alpha.6)', link: '/hi/tooling/inspect-ast-alpha6' },
            { text: 'CLI संदर्भ (alpha.5)', link: '/hi/tooling/cli-alpha5' },
            { text: 'CLI संदर्भ (alpha.4)', link: '/hi/tooling/cli-alpha4' },
            { text: 'ऐतिहासिक CLI (alpha.3)', link: '/hi/tooling/cli' },
            { text: 'पुराना CLI (alpha.1)', link: '/hi/tooling/cli-alpha1' },
            { text: 'Alpha.2 modules और explain', link: '/hi/tooling/alpha2-inspection' },
            { text: 'समस्या निवारण', link: '/hi/tooling/troubleshooting' },
            { text: 'प्रकाशित फीचर और रिलीज़ स्थिति', link: '/hi/reference/status' },
            { text: 'सत्यापन', link: '/hi/reference/evidence' },
            { text: 'रनटाइम बजट', link: '/hi/reference/budgets' },
            { text: 'त्रुटि कोड', link: '/hi/reference/diagnostics' },
            { text: 'Built-ins', link: '/hi/reference/library' },
            { text: 'सोर्स सुरक्षा', link: '/hi/reference/source-loading' },
            { text: 'Rust embedding', link: '/hi/reference/rust-embedding' },
            { text: 'C11 API (alpha.5)', link: '/hi/reference/c11-backend-alpha5' },
            { text: 'Compatibility', link: '/hi/reference/compatibility' },
            { text: 'Alpha.2 अपग्रेड परीक्षण', link: '/hi/reference/upgrade-readiness' }
          ] },
          { text: 'उदाहरण और समुदाय', items: [
            { text: 'उदाहरण', link: '/hi/examples/' },
            { text: 'सोशल लिंक', link: '/hi/community/social' },
            { text: 'योगदान करें', link: '/hi/community/contributing' },
            { text: 'Alpha.6 symbols और RMS', link: '/hi/releases/v0.0.6-alpha.1' },
            { text: 'Alpha.5 प्रकाशित बदलाव', link: '/hi/releases/v0.0.5-alpha.5' },
            { text: 'Alpha.4 project workflow', link: '/hi/releases/v0.0.5-alpha.4' },
            { text: 'Alpha.3 रिलीज़ और CLI', link: '/hi/releases/v0.0.5-alpha.3' },
            { text: 'Alpha.2 रिलीज़ और प्रमाण', link: '/hi/releases/v0.0.5-alpha.2' },
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
    search: { provider: 'local', options: localSearchOptions },
    outline: { level: [2, 3], label: 'On this page' },
    docFooter: { prev: 'Previous', next: 'Next' },
    editLink: { pattern: `${docsRepo}/edit/main/docs/:path`, text: 'Improve this page on GitHub' },
    // Official project accounts confirmed through public profiles or maintainer-provided URLs.
    // Add other platforms only after confirming their exact official URLs.
    // Prominent icons stay short; all official accounts remain linked from
    // Community menus and /community/social in both locales.
    socialLinks: [
      { icon: 'github', link: 'https://github.com/scarp-lang', ariaLabel: 'Scarp on GitHub' },
      { icon: 'x', link: 'https://x.com/ScarpLang', ariaLabel: 'Scarp on X' },
      { icon: 'discord', link: 'https://discord.com/channels/1566388621085253663/1566389853531152454', ariaLabel: 'Scarp Discord welcome channel (server membership may be required)' }
    ],
    // Five short top-level entries leave room for responsive locale and search.
    // Every long-form guide and historical reference stays in the sidebar.
    nav: [
      { text: 'Learn', link: '/guide/learning-path' },
      { text: 'Install', link: '/guide/installation-alpha6' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Releases', items: [
        { text: 'Latest: v0.0.6-alpha.4', link: '/releases/v0.0.6-alpha.4' },
        { text: 'Historical v0.0.6-alpha.1', link: '/releases/v0.0.6-alpha.1' },
        { text: 'CLI (alpha.6)', link: '/tooling/cli-alpha6' },
        { text: 'CLI (alpha.5)', link: '/tooling/cli-alpha5' },
        { text: 'CLI (alpha.4)', link: '/tooling/cli-alpha4' },
        { text: 'Numerical RMS', link: '/language/rms-alpha6' },
        { text: 'Published alpha.5 changes', link: '/releases/v0.0.5-alpha.5' },
        { text: 'Experimental C11 Rust API', link: '/reference/c11-backend-alpha5' },
        { text: 'Historical alpha.4 project workflow', link: '/releases/v0.0.5-alpha.4' },
        { text: 'Published alpha.3 and Scarp-first CLI', link: '/releases/v0.0.5-alpha.3' },
        { text: 'Published alpha.2 examples', link: '/releases/v0.0.5-alpha.2' },
        { text: 'Shipped feature matrix (alpha.1–alpha.6)', link: '/reference/status' },
        { text: 'Core reference: v0.0.5-alpha.1', link: '/reference/status' },
        { text: 'Compiler releases', link: `${sourceRepo}/releases` }
      ] },
      { text: 'Community', items: [
        { text: 'DEV Community', link: 'https://dev.to/scarplang' },
        { text: 'Scarp on Facebook', link: 'https://facebook.com/ScarpLang' },
        { text: 'Scarp on LinkedIn', link: 'https://linkedin.com/company/ScarpLang' },
        { text: 'Discord #welcome', link: 'https://discord.com/channels/1566388621085253663/1566389853531152454' },
        { text: 'Discord #language-development', link: 'https://discord.com/channels/1566388621085253663/1566388870826827856' },
        { text: 'Scarp on Reddit', link: 'https://www.reddit.com/r/ScarpLang/' },
        { text: 'Official channels', link: '/community/social' },
        { text: 'Contributing', link: '/community/contributing' }
      ] }
    ],
    sidebar: [
      { text: 'Welcome', items: [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Search and navigation', link: '/guide/search-and-navigation' },
        { text: 'Download offline docs', link: '/guide/offline-docs' },
        { text: 'Install the current alpha.6 release', link: '/guide/installation-alpha6' },
        { text: 'Learn Scarp: seven stages', link: '/guide/learning-path' },
        { text: 'First alpha.6 project and symbols', link: '/tutorials/project-symbol-navigation-alpha6' },
        { text: 'Quickstart: projects (alpha.4)', link: '/guide/quickstart-alpha4' },
        { text: 'Quickstart: individual files (alpha.3)', link: '/guide/quickstart-alpha3' },
        { text: 'Upgrade: alpha.3 to alpha.4', link: '/guide/migrate-alpha3-to-alpha4' },
        { text: 'Historical installation (alpha.5)', link: '/guide/installation-alpha5' },
        { text: 'Installation (alpha.4)', link: '/guide/installation' },
        { text: 'First program (v0.0.6-alpha.4)', link: '/guide/first-program-alpha4' },
        { text: 'First program (historical v0.0.5-alpha.1)', link: '/guide/first-program' },
        { text: 'Glossary for beginners', link: '/guide/glossary' },
        { text: 'Verified functions tutorial', link: '/tutorials/verified-functions' },
        { text: 'Repeat and while tutorial', link: '/tutorials/repeat-and-loops' },
        { text: 'Verified output tutorial', link: '/tutorials/verified-output' },
        { text: 'Verified vectors tutorial', link: '/tutorials/verified-vectors' },
        { text: 'Verified tiles tutorial', link: '/tutorials/verified-tiles' },
        { text: 'Verified classification tutorial', link: '/tutorials/verified-classification' },
        { text: 'Alpha.2 collections and probabilities', link: '/tutorials/alpha2-collections-and-learning' },
        { text: 'Alpha.2 module constants and JSON', link: '/tutorials/alpha2-module-constants-and-inspection' },
        { text: 'Alpha.2 diagnostics and repairs', link: '/tutorials/alpha2-diagnostics-and-repairs' },
        { text: 'Source modules tutorial', link: '/tutorials/modules-walkthrough' }
      ] },
      { text: 'Language', items: [
        { text: 'Overview', link: '/language/overview' },
        { text: 'Variables and scopes', link: '/language/variables' },
        { text: 'Typed bindings and conversions (alpha.2)', link: '/language/typed-bindings-alpha2' },
        { text: 'Types and values', link: '/language/types' },
        { text: 'Unicode text (alpha.2–alpha.3)', link: '/language/unicode-text' },
        { text: 'Operators', link: '/language/operators' },
        { text: 'Bitwise operators (alpha.2)', link: '/language/bitwise-operators-alpha2' },
        { text: 'Control flow', link: '/language/control-flow' },
        { text: 'Functions', link: '/language/functions' },
        { text: 'Source modules', link: '/language/modules' },
        { text: 'Modules, visibility and inspection (alpha.1–alpha.2)', link: '/language/modules-and-visibility' },
        { text: 'Output streams', link: '/language/output' },
        { text: 'Memory and lifetimes', link: '/language/memory' },
        { text: 'Vectors and tiles', link: '/language/numerics' },
            { text: 'Published scientific kernels (alpha.4)', link: '/language/scientific-kernels-alpha4' },
        { text: 'RMS numerics (alpha.6)', link: '/language/rms-alpha6' }
      ] },
      { text: 'Tools and reference', items: [
        { text: 'Command-line interface (alpha.6)', link: '/tooling/cli-alpha6' },
        { text: 'Version-aware Command Finder', link: '/tooling/command-finder' },
        { text: 'Compiler host & capabilities (alpha.6)', link: '/tooling/diagnose-alpha6' },
        { text: 'AST source inspection (alpha.6)', link: '/tooling/inspect-ast-alpha6' },
        { text: 'Command-line interface (alpha.5)', link: '/tooling/cli-alpha5' },
        { text: 'Command-line interface (alpha.4)', link: '/tooling/cli-alpha4' },
        { text: 'Historical CLI (alpha.3)', link: '/tooling/cli' },
        { text: 'Historical CLI (alpha.1)', link: '/tooling/cli-alpha1' },
        { text: 'Alpha.2 module and diagnostic inspection', link: '/tooling/alpha2-inspection' },
        { text: 'Troubleshooting', link: '/tooling/troubleshooting' },
        { text: 'Published feature status', link: '/reference/status' },
        { text: 'Evidence and testing', link: '/reference/evidence' },
        { text: 'Runtime budgets', link: '/reference/budgets' },
        { text: 'Diagnostics', link: '/reference/diagnostics' },
        { text: 'Built-ins and standard library', link: '/reference/library' },
        { text: 'Module loading and security', link: '/reference/source-loading' },
        { text: 'Embed in Rust', link: '/reference/rust-embedding' },
        { text: 'Experimental C11 API (alpha.5)', link: '/reference/c11-backend-alpha5' },
        { text: 'Compatibility', link: '/reference/compatibility' },
        { text: 'Alpha.2 upgrade readiness', link: '/reference/upgrade-readiness' }
      ] },
      { text: 'Learn and contribute', items: [
        { text: 'Verified examples', link: '/examples/' },
        { text: 'Official social channels', link: '/community/social' },
        { text: 'Contributing', link: '/community/contributing' },
        { text: 'Current alpha.6 release and symbols', link: '/releases/v0.0.6-alpha.1' },
        { text: 'Historical alpha.4 project workflow', link: '/releases/v0.0.5-alpha.4' },
        { text: 'Published alpha.3 CLI', link: '/releases/v0.0.5-alpha.3' },
        { text: 'Alpha.2 release evidence', link: '/releases/v0.0.5-alpha.2' },
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
