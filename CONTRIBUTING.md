# Contributing to Scarp documentation

Thanks for helping readers understand what the Scarp compiler actually implements.

## Before editing

1. Check the [compiler repository](https://github.com/scarp-lang/scarp), especially `src/`, `tests/`, and `docs/`.
2. Find a source, test, or published tag that backs any behavior you describe. Prefer v0.0.5-alpha.1 for current guides.
3. Classify new claims as **available in prerelease**, **experimental implementation**, or **planned/unavailable**. Do not call experimental code stable.
4. File an issue for broad new sections before substantially changing the navigation.

## Make a change

~~~sh
git clone https://github.com/scarp-lang/scarp-docs.git
cd scarp-docs
npm install
npm run docs:dev
npm run check:docs
npm run docs:build
~~~

Use Markdown for prose and TypeScript for VitePress configuration. Avoid custom HTML, complex client-side components, or large CSS frameworks. Link to tested Scarp examples. Keep each page focused and descriptive. Fix navigation and cross-page links when moving documents.

## Pull requests

- Explain the user-facing change and the exact compiler source/tag used to validate it.
- Include a Scarp `.srp` example plus expected output only when you can establish its behavior from the compiler or test fixtures.
- Make sure CI is green, including link validation and static build.
- Do not paste secrets, private data, or unreviewed third-party logos.
- The documentation is MIT licensed; the compiler's separate Apache-2.0 license is unaffected.

Small, coherent PRs are easier to review than arbitrarily split changes. Issues can track deferred language documentation as compiler releases land.

## Keep language examples executable

Before adding a runnable snippet, verify it against the **release**, not an open compiler PR. Whenever practical, reuse a source/expected-output fixture in `conformance/`. Keep `conformance/manifest.json`, `data/compiler-baseline.json`, and the pinned compiler commit in `.github/workflows/ci.yml` consistent.

After the compiler releases a new prerelease, review grammar, syntax, fixtures, migration guidance, feature status, and links together. Do not silently promote development-only implementations into the shipped reference. The [release checklist](docs/project/maintenance.md) describes the process.
