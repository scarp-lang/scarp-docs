# Scarp Docs Engine — migration from VitePress

Scarp Docs is migrating to an independently authored **TypeScript static documentation system**, tracked in [Issue #70](https://github.com/scarp-lang/scarp-docs/issues/70). This changes the documentation website, not the Scarp compiler.

## Architecture

The new engine lives in scripts/scarp-site/ and loads no VitePress or Vue website runtime.

| Component | Role |
| --- | --- |
| routes.ts | Existing public URLs, English/Hindi pairs, safe internal links |
| markdown.ts | Markdown rendering, YAML frontmatter, Unicode heading anchors, safe code blocks, callouts and widgets |
| build.ts | Generates HTML, bilingual full-text search, reciprocal SEO tags, sitemap and local assets |
| site.css | Independent responsive typography, navigation, code/table scrolling, homepage and themes |
| client.ts | Independent TypeScript search, dark mode, menus, language switching, published-command selection and deployment history |
| test.ts | Static route, Unicode, SEO, markup, search and release-evidence tests |
| browser-test.ts | Real Chromium keyboard, mobile, search, Command Finder and axe WCAG A/AA tests |

The build uses focused Markdown (markdown-it) and YAML (yaml) parsers, not a website framework. The browser code is standalone TypeScript compiled with TypeScript itself, without a JavaScript UI framework or bundler. Release command data is temporarily reused from a pure TypeScript table stored in the old theme tree. It has no VitePress runtime dependency, but must move into a framework-neutral shared path before the old tree is removed.

## Commands

~~~sh
npm install --no-audit --no-fund
npm run scarp:build
npm run scarp:test
npx playwright install chromium
npm run scarp:browser-test
~~~

The engine's test build is generated under artifacts/scarp-engine-preview/scarp-docs/. Its assets use the existing /scarp-docs/ URL prefix; the browser test starts its own safe loopback HTTP server.

**Production build:** npm run docs:build now generates docs/.scarp/dist/ using the Scarp-owned renderer. npm run docs:dev starts its loopback-only watched Markdown server, and npm run docs:preview serves that production output. npm run scarp:build still creates an isolated comparison preview. Official GitHub Pages and the offline archive consume only the Scarp-owned output. Do not call the migration fully complete until deployment and the remaining legacy-tooling removal gates pass.

## Acceptance gates for replacing production

1. **138 pages**: preserve all 69 English and 69 Hindi source routes, local links, home features, heading anchors, code samples, callouts and both embedded interactive widgets.
2. **Search and releases**: use a full local index with no external provider; verify correct pinned compiler versions and do not invent unshipped commands.
3. **Accessible UI**: test keyboard, focus return, language switching, appearance persistence, 320px reflow, mobile navigation and code/table scrolling. Run axe WCAG A/AA on representative states. Automated tests are not manual screen-reader certification; see Issue #65.
4. **Deploy and offline**: change production build, archive generation, Pages upload, sitemap/live smoke and downloaded offline browser checks together. Confirm complete URL continuity.
5. **Remove VitePress**: only after actual production and offline verification, migrate pure release data out of the old theme, remove its Vue/VitePress files and dependencies, and update older conformance and toolchain tests without weakening them.
6. **Release policy**: no stable documentation version is created by this migration. Keep the existing prerelease release gates.

## Content security and provenance

The renderer escapes unreviewed raw Markdown HTML. It explicitly recognizes only the project's callouts and named widgets; future embedded content must be implemented and tested rather than bypassing HTML safety. The core language reference remains pinned to v0.0.5-alpha.1. The latest published compiler verified at migration start is v0.0.6-alpha.1, not the changing compiler main branch.

The Scarp-owned renderer is now the production-build candidate. The legacy VitePress/Vue dependencies, old theme/config and a few source-evidence checks remain temporarily for compatibility; they are no longer the website renderer or Pages build. Remove them after live Pages, offline archive, and release CI have independently confirmed the new output. Track completion in Issue #70.
