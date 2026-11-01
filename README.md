# Scarp Documentation

Official VitePress documentation for the experimental [Scarp Programming Language](https://github.com/scarp-lang/scarp).

**Website (English):** https://scarp-lang.github.io/scarp-docs/

**हिन्दी दस्तावेज़:** https://scarp-lang.github.io/scarp-docs/hi/

**Compiler:** https://github.com/scarp-lang/scarp

**License:** [MIT](LICENSE)

## Development

Requires Node.js 20.19+ and npm. Documentation automation is written in **TypeScript** using `tsx`; the site is VitePress/Vue with Markdown source pages. From the root:

~~~sh
npm install
npm run docs:dev       # local VitePress server
npm run typecheck      # strict TypeScript / Vue static analysis
npm run check:tooling  # enforce TS-only authored tooling
npm run check:docs     # internal pages, links, content policy, navigation
npm run check:i18n     # all pages have Hindi equivalents and matching code snippets
npm run check          # typecheck, content, i18n, fixtures, production build
npm run docs:build     # static production build
npm run docs:preview   # preview the build
~~~

Pages are under `docs/` and are written in Markdown. Navigation, theme, code grammar, and canonical `/scarp-docs/` base path are configured in `docs/.vitepress/config.mts`. Small style overrides are in `docs/.vitepress/theme/`.

## TypeScript-first architecture

All project-maintained **executable tooling** under `scripts/` uses `.ts` files: navigation validation, Hindi parity, pinned compiler evidence, fixture checks, compiler smoke tests, and tooling rules. TypeScript is checked in CI with `vue-tsc`, including the VitePress config, Vue components and client scripts. This is a **TypeScript-first application**, not a claim that the whole repository can be 100% TS files: documentation stays in Markdown, Vue SFC templates and CSS remain for presentation, and `.srp` fixtures remain actual Scarp source. No authored `.js`/`.mjs` tooling is required.

## Source-of-truth policy

The compiler **repository is `scarp-lang/scarp`** (not `scarp-lang/scarp-lang`). Language facts are checked against compiler source, its executable tests, and its published documentation for v0.0.5-alpha.1. Each technical page links to the corresponding compiler reference. Status distinctions are described in [Feature status](docs/reference/status.md).

A syntax proposal is *not* evidence that a feature ships. A future feature should remain marked **planned** until verified in a published compiler version. Documentation examples should be copied from or checked against compiler fixtures whenever possible.

## Deployment

CI validates links/content and builds VitePress on pull requests. The Pages workflow runs on changes to `main` and on manual dispatch. In **Settings → Pages**, set **Source** to **GitHub Actions**. It publishes `docs/.vitepress/dist` using GitHub's official Pages actions. The site is served from `/scarp-docs/` rather than `/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please propose focused changes backed by compiler implementation or tests.

## Official community channels

The [community page](docs/community/social.md) lists Scarp's verified public GitHub, X, YouTube, Instagram, Threads, and Bluesky profiles, plus the public contact address. Navigation icons link directly to those channels. Do not add unverified social handles or link personal developer profiles as official Scarp accounts.

## Compiler-backed conformance checks

The `conformance/` directory contains seven pinned source/output pairs copied from the released Scarp compiler examples. To verify fixture integrity locally (does not require Rust):

```sh
npm run check:fixtures
```

To execute them, build the **exact** published Scarp source commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671` (tag `v0.0.5-alpha.1`), then run:

```sh
npm run test:compiler -- /absolute/path/to/scarp
```

On GitHub Actions, the Documentation CI workflow checks out that commit independently, first byte-compares all fixtures to the tagged compiler examples, builds the Rust interpreter offline, and finally compares actual output byte-for-byte. This is deliberately separate from Markdown/VitePress validation, which does not prove a language snippet executes.

## हिन्दी अनुवाद

VitePress के language selector से English/Hindi बदलें। सभी documentation sections का Hindi संस्करण `docs/hi/` में है। यह self-hosted, reviewed Markdown content है; external translation API की आवश्यकता नहीं। नई compiler सुविधाओं के साथ दोनों भाषाओं के pages अपडेट करें।

## GitHub Pages deployment history

[![Deploy official documentation](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml)

See [live successful deployment count](docs/project/deployments.md) and the [Hindi deployment view](docs/hi/project/deployments.md). The count comes from the public GitHub Actions API with a graceful fallback; it is not hardcoded.
