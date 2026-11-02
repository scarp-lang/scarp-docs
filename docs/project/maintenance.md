# Documentation maintenance and release checks

This is the contributor-maintainer process for Scarp Docs. Documentation must describe the **published compiler**, not design proposals or unmerged work. The current baseline is [v0.0.5-alpha.1](/reference/status).

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
2. Update `data/compiler-baseline.json` with the new tag, publication date, and **published** source commit. Update the version label in `.vitepress/config.mts` and the [status matrix](/reference/status).
3. Review all statements of feature availability. Distinguish shipped experimental behavior from development-only branches and unavailable proposals.
4. Re-copy executable example sources and `.stdout` files from the new compiler tag; update `conformance/manifest.json` and the pinned checkout commit in `.github/workflows/ci.yml` **in the same PR**.
5. Run `check:docs`, `check:fixtures`, the compiler-evidence path checks, a production VitePress build, and compiler conformance. Fix broken anchors, source links and changed output.
6. Confirm that GitHub Pages serves the correct subpath, search loads, and dark/light navigation works on mobile and desktop.

## GitHub Actions and Pages

The `Documentation CI` workflow validates docs and runs compiler conformance for pull requests and main pushes. The `Deploy official documentation` workflow builds the static site on main, uploads `docs/.vitepress/dist`, and requests a Pages deployment with `pages: write` and `id-token: write`. Repository administrators must select **Settings → Pages → Build and deployment → GitHub Actions** once. A successful workflow is needed before calling the site deployed.

## Scope and safety notes

The current `scarp` CLI is an interpreter, not a native-code backend. Scarp's numerical and source-module budgets are deterministic counters, not comprehensive memory or time isolation. Source imports assume a trusted root. Document this accurately and link claims to matching tagged compiler tests.

Do not add dead links, speculative syntax, fake screenshots, or user-specific email addresses. Contributor issue reports should include Scarp version, exact command and file, expected versus actual output, and evidence.
