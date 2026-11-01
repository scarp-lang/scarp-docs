# Scarp Documentation

Official VitePress documentation for the experimental [Scarp Programming Language](https://github.com/scarp-lang/scarp).

**Website:** https://scarp-lang.github.io/scarp-docs/

**Compiler:** https://github.com/scarp-lang/scarp

**License:** [MIT](LICENSE)

## Development

Requires Node.js 20.19+ and npm. From the root:

~~~sh
npm install
npm run docs:dev       # local VitePress server
npm run check:docs     # internal pages, links, content policy, navigation
npm run docs:build     # static production build
npm run docs:preview   # preview the build
~~~

Pages are under `docs/` and are written in Markdown. Navigation, theme, code grammar, and canonical `/scarp-docs/` base path are configured in `docs/.vitepress/config.mts`. Small style overrides are in `docs/.vitepress/theme/`.

## Source-of-truth policy

The compiler **repository is `scarp-lang/scarp`** (not `scarp-lang/scarp-lang`). Language facts are checked against compiler source, its executable tests, and its published documentation for v0.0.5-alpha.1. Each technical page links to the corresponding compiler reference. Status distinctions are described in [Feature status](docs/reference/status.md).

A syntax proposal is *not* evidence that a feature ships. A future feature should remain marked **planned** until verified in a published compiler version. Documentation examples should be copied from or checked against compiler fixtures whenever possible.

## Deployment

CI validates links/content and builds VitePress on pull requests. The Pages workflow runs on changes to `main` and on manual dispatch. In **Settings → Pages**, set **Source** to **GitHub Actions**. It publishes `docs/.vitepress/dist` using GitHub's official Pages actions. The site is served from `/scarp-docs/` rather than `/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please propose focused changes backed by compiler implementation or tests.

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
