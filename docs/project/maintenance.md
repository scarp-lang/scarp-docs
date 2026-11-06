# Documentation maintenance and release checks

This is the contributor-maintainer process for Scarp Docs. Documentation must describe the **published compiler**, not design proposals or unmerged work. The core language-reference baseline remains intentionally pinned to [v0.0.5-alpha.1](/reference/status); the newest separately verified prerelease is [v0.0.6-alpha.1](/releases/v0.0.6-alpha.1). New installs should follow the [alpha.6 installation guide](/guide/installation-alpha6).

## Compiler failure fixtures

The [alpha.2 diagnostic repairs tutorial](/tutorials/alpha2-diagnostics-and-repairs) has six intentionally failing, release-tagged tests, distinct from the twelve passing alpha.2 examples. `npm run check:alpha2-errors` validates source/stderr Git blobs, both locale pages and supporting modules. In the pinned alpha.2 checkout, `npm run check:alpha2-errors -- /path/to/alpha2/tests/fixtures` compares source bytes; `npm run test:alpha2-errors -- /path/to/alpha2/scarp` executes both `run` and `check` and verifies failures. Error output is version-specific.

## Upgrade gate: alpha.1 to alpha.2

Before changing the main documentation baseline, run `npm run test:alpha2-backcompat -- /path/to/alpha2/scarp` with the exact published **alpha.2** binary. The separate CI step runs all 11 unchanged original alpha.1 fixtures, checks their byte-exact output and tests `tokens`. It does not replace the alpha.1 fixture provenance check or prove compatibility beyond this sample set. See [upgrade readiness](/reference/upgrade-readiness).

## Latest alpha.3 release evidence

The [English alpha.3 release guide](/releases/v0.0.5-alpha.3) and matching Hindi page reproduce **four complete published programs and 11 upstream source/output/JSON Git blobs**. Run `npm run check:alpha3` to validate bilingual examples, or `npm run check:alpha3 -- /path/to/tagged-alpha3/examples` to compare the exact files with the published source checkout. The `alpha3-conformance` CI job builds source commit `7715c28df09c7703b39e14fddb963275b25df476` and runs `npm run test:alpha3 -- /path/to/alpha3/scarp`, checking new `exec` and static `verify` separately from the legacy commands. Alpha.1 and alpha.2 evidence stays pinned independently.

## Offline Chromium browser acceptance

The dedicated `browser-offline` Documentation CI job installs pinned Playwright/Chromium, builds the VitePress site, packages the full English/Hindi offline archive and runs `npm run test:browser-offline` against the **extracted** standalone Node server. This validates release-aware Command Finder availability, keyboard-only version selection, copy-button success and denied-permission fallback, English/Hindi local search, a mobile-width menu, keyboard shortcuts and the restriction that no external resource is requested.

For a local repeat, install dependencies with `npm install`, install Chromium with `npx playwright install chromium` (CI uses the same browser install on GitHub-hosted Ubuntu, which has its required system libraries), run `npm run docs:build && npm run package:offline`, then `npm run test:browser-offline`. Failure screenshots, when possible, are saved under ignored `artifacts/browser-failures/` and uploaded on CI failure. The expanded suite also checks a keyboard-opened empty search state and focus restoration on close, translated-page switching, skip-to-content link and target, persisted appearance mode across reloads, and usable CLI controls under a reduced-motion viewport. These tests exercise selected interactive controls, not every screen-reader combination or a full WCAG conformance audit; track broader access testing in [Issue #65](https://github.com/scarp-lang/scarp-docs/issues/65). The offline distribution remains pinned to the tested docs commit, and the browser suite has no external-search backend.

## Supported TypeScript and Vue toolchain

The docs run strict Vue SFC checks through `vue-tsc`. The tested compatibility line is **TypeScript 6.0.x** with **vue-tsc 3.3.x**. TypeScript 7.0 removes the programmatic TypeScript API expected by Vue's checker, causing `ERR_PACKAGE_PATH_NOT_EXPORTED` before actual document diagnostics run. This is an **upstream integration limitation**, not evidence that the TypeScript 7 compiler itself is defective.

**Known patch regression:** `vue-tsc` **3.3.14** has a [reported URL-in-template code-generation bug](https://github.com/vuejs/language-tools/issues/6322) that can introduce false TS2339/TS7006 errors when a Vue template contains a literal URL. The project remains pinned to **3.3.13** and Dependabot ignores **3.3.14 specifically**; it can propose a later patch after an upstream fix. An existing passing CI run is not proof that every future Vue template pattern is safe.

Until Vue tooling supports TypeScript 7, the npm Dependabot configuration ignores TypeScript **major** upgrades. It still permits compatible fixes. `npm run check:toolchain` verifies the dependency and ignore-policy contract, `npm run test:toolchain` mutation-tests it, and `npm run typecheck` checks real .ts and .vue sources. Reconsider this hold only after a new Vue toolchain supports the relevant TypeScript API **and** all GitHub CI and Pages checks pass; do not merge a major dependency PR merely because its diff is small.

## Local quality gates

```sh
npm install --no-audit --no-fund
npm run check:docs
npm run check:fixtures
npm run docs:build
```

Node.js 22 or a runtime satisfying the declared `engines` entry is required. The docs use VitePress and Markdown; no application router or hand-written pages are needed. The conformance job additionally requires Rust/Cargo and the pinned compiler. It runs on GitHub Actions with an explicit upstream source commit.

## Separate release-track gates

The [newly published alpha.2 guide](/releases/v0.0.5-alpha.2) has twelve exact source/output program pairs across three bilingual pages, including multi-file module dependencies and a pinned JSON snapshot checked by `npm run check:alpha2` and the separate `alpha2-conformance` CI job. The main 11-program reference remains pinned to alpha.1. Maintain both released source commits and their own fixture Git blobs; do not re-label old tests as proof of alpha.2 behavior. When validating compiler source links locally, supply **both** source checkouts to `npm run check:evidence -- /path/to/alpha1 /path/to/alpha2`.

## Updating to a new compiler release

1. Confirm the release exists, and inspect the tagged code, tests, examples, CLI implementation, release notes and exact source commit.
2. Add or update a **release-specific** manifest with the new tag, publication date, source commit and verified capabilities. Update latest-release navigation and the [status matrix](/reference/status). **Do not automatically move `data/compiler-baseline.json`**: the core alpha.1 language-reference baseline changes only after every historic example, output and compatibility assumption is requalified.
3. Review all statements of feature availability. Distinguish shipped experimental behavior from development-only branches and unavailable proposals.
4. Copy the new compiler tag's executable examples and `.stdout` files into a separate release-specific conformance fixture set. Pin that **new** manifest and source SHA in `.github/workflows/ci.yml` in the same PR. Keep earlier manifests, source snapshots and CI jobs unchanged unless a separate, tested baseline migration is explicitly approved.
5. Run `check:docs`, `check:fixtures`, the compiler-evidence path checks, a production VitePress build, and compiler conformance. Fix broken anchors, source links and changed output.
6. Confirm that GitHub Pages serves the correct subpath, search loads, and dark/light navigation works on mobile and desktop.

## GitHub Actions and Pages

The `Documentation CI` workflow validates docs and runs compiler conformance for pull requests and main pushes. The `Deploy official documentation` workflow builds the static site on main, uploads `docs/.vitepress/dist`, and requests a Pages deployment with `pages: write` and `id-token: write`. Repository administrators must select **Settings → Pages → Build and deployment → GitHub Actions** once. A successful workflow is needed before calling the site deployed.

## Scope and safety notes

The current `scarp` CLI is an interpreter, not a native-code backend. Scarp's numerical and source-module budgets are deterministic counters, not comprehensive memory or time isolation. Source imports assume a trusted root. Document this accurately and link claims to matching tagged compiler tests.

Do not add dead links, speculative syntax, fake screenshots, or user-specific email addresses. Contributor issue reports should include Scarp version, exact command and file, expected versus actual output, and evidence.
