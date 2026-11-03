# Scarp Documentation

Official VitePress documentation for the experimental [Scarp Programming Language](https://github.com/scarp-lang/scarp).

**Website (English):** https://scarp-lang.github.io/scarp-docs/

**हिन्दी दस्तावेज़:** https://scarp-lang.github.io/scarp-docs/hi/

**Compiler:** https://github.com/scarp-lang/scarp

**Latest published prerelease:** [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3), November 2, 2026. The [current English CLI reference](docs/tooling/cli.md) and [हिन्दी CLI संदर्भ](docs/hi/tooling/cli.md) document the released Scarp-first commands with a compiler-backed check. [Historical alpha.1 CLI](docs/tooling/cli-alpha1.md) is retained for older scripts.

**Previous published prerelease:** [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2), November 2, 2026. [Alpha.2 release examples (English)](docs/releases/v0.0.5-alpha.2.md) and [हिन्दी संस्करण](docs/hi/releases/v0.0.5-alpha.2.md). The 11-program core documentation baseline remains intentionally pinned to v0.0.5-alpha.1; a separate **twelve-program** alpha.2 conformance suite checks newly published features across the [release guide](docs/releases/v0.0.5-alpha.2.md) and [verified collections and classification tutorial](docs/tutorials/alpha2-collections-and-learning.md), both translated into Hindi.

**License:** [MIT](LICENSE)

## Development

Requires Node.js 20.19+ and npm. Documentation automation is written in **TypeScript** using `tsx`; the site is VitePress/Vue with Markdown source pages. From the root:

~~~sh
npm install
npm run docs:dev       # local VitePress server
npm run typecheck      # strict TypeScript / Vue static analysis
npm run check:tooling  # enforce TS-only authored tooling
npm run check:alpha2    # verify published alpha.2 source hashes and bilingual release examples
npm run check:cli-reference # published alpha.3 CLI identity and bilingual command examples
npm run test:cli-reference  # regression tests for CLI documentation drift
npm run check:snippets # reject unsupported runnable Scarp/CLI syntax
npm run test:snippets # exercise current-version sample policy
npm run check:docs     # internal pages, links, content policy, navigation
npm run check:i18n     # all pages have Hindi equivalents and ordered matching code fences
npm run test:code-fences # unit-test the TypeScript Markdown fence scanner
npm run test:site-meta  # unit tests for bilingual canonical and hreflang URLs
npm run check:site-build # inspect generated English/Hindi HTML after docs:build
npm run check          # typecheck, content, i18n, fixtures, SEO and production build
npm run docs:build     # static production build
npm run docs:preview   # preview the build
~~~

For new contributors, the [English glossary](docs/guide/glossary.md) and [हिन्दी शब्दावली](docs/hi/guide/glossary.md) explain Scarp terminology before the language reference.

Pages are under `docs/` and are written in Markdown. Navigation, theme, code grammar, and canonical `/scarp-docs/` base path are configured in `docs/.vitepress/config.mts`. Small style overrides are in `docs/.vitepress/theme/`.

## Published feature status

The [English published-feature matrix](docs/reference/status.md) and [हिन्दी फीचर स्थिति](docs/hi/reference/status.md) distinguish the main alpha.1 reference baseline from all **12 alpha.2** and **4 alpha.3** release-backed examples. A TypeScript manifest checker prevents either locale from silently changing the version, compiler commit, example source, or evidence count. Run `npm run check:release-status` and `npm run test:release-status` before changing release status claims. These checks supplement—not replace—the tagged compiler execution jobs.

## TypeScript-first architecture

All project-maintained **executable tooling** under `scripts/` uses `.ts` files: navigation validation, Hindi parity, pinned compiler evidence, fixture checks, compiler smoke tests, and tooling rules. TypeScript is checked in CI with `vue-tsc`, including the VitePress config, Vue components and client scripts. This is a **TypeScript-first application**, not a claim that the whole repository can be 100% TS files: documentation stays in Markdown, Vue SFC templates and CSS remain for presentation, and `.srp` fixtures remain actual Scarp source. No authored `.js`/`.mjs` tooling is required.

## Source-of-truth policy

The compiler **repository is `scarp-lang/scarp`** (not `scarp-lang/scarp-lang`). Core language-reference facts are checked against compiler source, executable tests and published documentation for v0.0.5-alpha.1. Release-scoped alpha.2 and alpha.3 pages have separate compiler-pinned evidence and verification. Each technical page links to the corresponding compiler reference. Status distinctions are described in [Feature status](docs/reference/status.md).

A syntax proposal is *not* evidence that a feature ships. A future feature should remain marked **planned** until verified in a published compiler version. Documentation examples should be copied from or checked against compiler fixtures whenever possible.

The translation guard compares actual fenced-code blocks, including repeated snippets, in the original English order. Hindi pages may contain additional explanation, but no original example may be silently changed or dropped. The parser itself has standalone TypeScript unit tests.

## Published alpha.2 diagnostic regression tests

Six deliberately failing programs, including exact stderr snapshots and supporting module source, are pinned separately in `conformance/alpha2-errors-manifest.json` (**14 upstream Git blobs**). The [English repair tutorial](docs/tutorials/alpha2-diagnostics-and-repairs.md) and [हिन्दी त्रुटि गाइड](docs/hi/tutorials/alpha2-diagnostics-and-repairs.md) reproduce complete source/stderr examples. TypeScript `check:alpha2-errors` validates their provenance; the alpha.2 compiler CI runs `check` and `run` on each fixture, verifying that they fail as published. These six negative cases are not included in the twelve successful alpha.2 programs.

## Alpha.1-to-alpha.2 executable upgrade gate

A separate TypeScript test, `npm run test:alpha2-backcompat -- /path/to/alpha2/scarp`, builds on the existing manifests to run all **11 unchanged alpha.1 programs** against the published **alpha.2** interpreter, checking silent `check`, byte-exact `run` output and a `tokens` smoke test. The GitHub Actions `alpha2-conformance` job executes this gate using the exact tagged alpha.2 commit. Its [English migration-readiness guide](docs/reference/upgrade-readiness.md) and [हिन्दी अपग्रेड गाइड](docs/hi/reference/upgrade-readiness.md) explain the scope and limitations. This does not automatically repin the whole main reference or guarantee arbitrary backwards compatibility.

## Latest alpha.3 release evidence

**Latest published prerelease:** [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3), November 2, 2026 (source commit `7715c28df09c7703b39e14fddb963275b25df476`). The [English guide](docs/releases/v0.0.5-alpha.3.md) and [हिन्दी संस्करण](docs/hi/releases/v0.0.5-alpha.3.md) include four complete published compiler programs, a supporting module and a structured diagnostic example. `conformance/alpha3-manifest.json` pins **11 exact upstream Git blobs**. Use `npm run check:alpha3` for source/text provenance and `npm run test:alpha3 -- /path/to/alpha3/scarp` to verify `exec`, static `verify`, legacy `run`, module/AST inspection and offline JSON diagnostics. The CI job uses the exact published release commit. The main documentation baseline is still alpha.1 and retains separate alpha.2 evidence.

## Earlier published compiler release tracks

The core reference, status matrix and existing 11 compiler examples remain pinned to **v0.0.5-alpha.1** until a comprehensive and separately reviewed update migrates those pages. Scarp **v0.0.5-alpha.2 is now publicly released**, with an independent evidence manifest at `conformance/alpha2-manifest.json` (twelve newer programs, 28 exact upstream Git blobs, including imported source modules and a JSON snapshot). `scripts/check-alpha2.ts` verifies the English/Hindi release guides, collection tutorials and the [multi-file constants/JSON walkthrough](docs/tutorials/alpha2-module-constants-and-inspection.md), fixture provenance and optional byte-for-byte checkout comparison. A distinct `alpha2-conformance` GitHub Actions job checks out the exact alpha.2 release source `e4db8e191cd7ea623123cae7348450ca6c95b170`, builds the tagged Rust interpreter and executes the twelve programs plus full text/JSON module inspection and diagnostic explanation checks. This separation prevents newer compiler behavior from being silently claimed as an alpha.1 feature.

## Compiler-backed tutorial evidence

The [verified classification and probabilities tutorial](docs/tutorials/verified-classification.md) and [हिन्दी वर्गीकरण ट्यूटोरियल](docs/hi/tutorials/verified-classification.md) cover three additional compiler cases: class scores, cross-entropy and one-hot targets. The [verified tiles tutorial](docs/tutorials/verified-tiles.md) and [हिन्दी टाइल ट्यूटोरियल](docs/hi/tutorials/verified-tiles.md) provide the published matrix-forward compiler fixture alongside diagnostics and shape guidance. The [verified functions tutorial](docs/tutorials/verified-functions.md), [loops tutorial](docs/tutorials/repeat-and-loops.md), [output tutorial](docs/tutorials/verified-output.md), [numerical vectors tutorial](docs/tutorials/verified-vectors.md), and [three-file source modules walkthrough](docs/tutorials/modules-walkthrough.md) all have matching Hindi editions, including [हिन्दी फ़ंक्शन ट्यूटोरियल](docs/hi/tutorials/verified-functions.md), [हिन्दी लूप ट्यूटोरियल](docs/hi/tutorials/repeat-and-loops.md), [हिन्दी आउटपुट ट्यूटोरियल](docs/hi/tutorials/verified-output.md), [हिन्दी वैक्टर ट्यूटोरियल](docs/hi/tutorials/verified-vectors.md), and [हिन्दी मॉड्यूल ट्यूटोरियल](docs/hi/tutorials/modules-walkthrough.md). All examples reproduce source/output pairs from the pinned released interpreter. `data/tutorial-evidence.json` explicitly maps tutorial pages to the pinned `conformance/manifest.json` cases. `scripts/check-tutorial-evidence.ts` requires all 11 pinned examples to be covered exactly once and rejects missing, modified, misplaced or reordered examples in either language, including the two imported `.srp` source files needed by the module demo. Supporting files must exist in the pinned compiler fixture manifest. `scripts/test-tutorial-evidence.ts` regression-tests the matcher, including CLI command fences between a complete program and its expected stdout. `npm run check:tutorial-evidence` requires no network or Rust toolchain; actual program execution is still covered separately by the compiler-conformance GitHub Actions job.

The `output` program intentionally emits **no newline after the final word**: the Markdown output fence demonstrates visible text but does not encode this byte detail; the compiler-conformance job verifies actual stdout including trailing newline behavior. Tutorial evidence checks compare normalized visible fence contents; they are not substitutes for executing the compiler.

The TypeScript fixture-statistics gate (`npm run check:coverage-statistics`) reads the fixture manifest and detects stale English/Hindi claims about executable examples and mirrored source files. Its standalone unit tests (`npm run test:coverage-statistics`) also reject missing or duplicated claims. These are checked in PR CI and before Pages deployment.

The TypeScript snippet-policy gate checks all runnable `scarp` and shell Markdown fences for known legacy declarations and unavailable CLI commands. Historical syntax in prose and text fences is allowed; this is a narrow syntax smoke test, **not a full compiler/parser replacement**. The conformance job remains responsible for actually running the pinned source and verifying stdout.

A future version is not promoted automatically: change the pinned baseline only after reviewing a published release, updating the fixtures, and re-running compiler conformance.

## Bilingual SEO and production quality gates

The typed VitePress helper `docs/.vitepress/site-meta.ts` generates canonical URLs and reciprocal `hreflang` (`en`, `hi`, `x-default`) entries for each English/Hindi page. CI validates both the helpers and generated HTML **after** building VitePress. This catches wrong base paths, mismatched language metadata, missing output pages and incorrect Open Graph URLs rather than relying on source-text checks alone. A deployment is blocked when any source page is missing from the compiled site.

## Deployment

CI validates links/content and builds VitePress on pull requests. The Pages workflow runs on changes to `main` and on manual dispatch. In **Settings → Pages**, set **Source** to **GitHub Actions**. It publishes `docs/.vitepress/dist` using GitHub's official Pages actions. The site is served from `/scarp-docs/` rather than `/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please propose focused changes backed by compiler implementation or tests.

## Official community channels

The [community page](docs/community/social.md) lists Scarp's GitHub, X, Facebook, LinkedIn, YouTube, Instagram, Threads, Bluesky, DEV and Reddit profiles, plus the public contact address and maintainer-provided Discord channel links. Navigation icons link to official destinations. Use maintainer-provided or independently confirmed project URLs; never link personal developer profiles as Scarp accounts.

**Discord channels:** [#welcome](https://discord.com/channels/1566388621085253663/1566389853531152454) and [#language-development](https://discord.com/channels/1566388621085253663/1566388870826827856). These are **channel deep links**, not public server invitation URLs. Visitors may need to join the Discord server and obtain access before opening them.

## Compiler-backed conformance checks

The `conformance/` directory contains 11 pinned source/output pairs copied from the released Scarp compiler examples. To verify fixture integrity locally (does not require Rust):

```sh
npm run check:fixtures
npm run check:alpha2 # validate twelve alpha.2 examples across three bilingual page pairs
npm run check:tutorial-evidence # match bilingual tutorial code + stdout against published fixtures
npm run test:tutorial-evidence # unit-test source/output pairing and drift detection
```

To execute them, build the **exact** published Scarp source commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671` (tag `v0.0.5-alpha.1`), then run:

```sh
npm run test:compiler -- /absolute/path/to/scarp
```

On GitHub Actions, the Documentation CI workflow checks out that commit independently, first byte-compares all fixtures to the tagged compiler examples, builds the Rust interpreter offline, and finally compares actual output byte-for-byte. This is deliberately separate from Markdown/VitePress validation, which does not prove a language snippet executes.

## हिन्दी अनुवाद

VitePress के language selector से English/Hindi बदलें। सभी documentation sections का Hindi संस्करण `docs/hi/` में है। यह self-hosted, reviewed Markdown content है; external translation API की आवश्यकता नहीं। नई compiler सुविधाओं के साथ दोनों भाषाओं के pages अपडेट करें।

## Reliable TypeScript deployment indicator

`docs/.vitepress/theme/lib/pages-api.ts` implements the public GitHub Actions API parser, a bounded request timeout, validated success-count data, and English/Hindi labels. Unit tests are offline: `npm run test:pages-api`. The Vue indicator offers an accessible retry button, reports rate limiting without inventing a number, and always links to GitHub Actions. This is a public read-only counter; no user data or API token is sent to any additional service.

## GitHub Pages deployment history

[![Deploy official documentation](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml)

See [live successful deployment count](docs/project/deployments.md) and the [Hindi deployment view](docs/hi/project/deployments.md). The count comes from the public GitHub Actions API with a graceful fallback; it is not hardcoded.
