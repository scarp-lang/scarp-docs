# Contributing to the Scarp ecosystem

There are two distinct repositories:

- [**scarp-lang/scarp**](https://github.com/scarp-lang/scarp) — the Rust interpreter, source-language implementation, compiler tests, and release artifacts.
- [**scarp-lang/scarp-docs**](https://github.com/scarp-lang/scarp-docs) — the official, Scarp-owned TypeScript documentation website, licensed under MIT.

## Documentation contributions

Start with [CONTRIBUTING.md](https://github.com/scarp-lang/scarp-docs/blob/main/CONTRIBUTING.md). The essential rule is to support behavioral claims with compiler source, tests, or an exact release. A feature proposal should stay explicitly **planned** until it is implemented and released.

For local changes:

~~~sh
git clone https://github.com/scarp-lang/scarp-docs.git
cd scarp-docs
npm install
npm run docs:dev
npm run check:docs
npm run docs:build
~~~

A good documentation pull request adds a focused explanation, one source-backed example, a compiler evidence link, and updated navigation or links when appropriate. Responsive layout, search, theme switching and offline packaging are implemented by the Scarp-owned TypeScript renderer. VitePress configuration is retained only as historical migration evidence, not the active website engine.

## Current-compiler documentation policy

For new content, start from the [current compiler reference](/reference/current) and [current installation guide](/guide/install-latest). Never link a retired compiler release as the recommended download. The verified published compiler is recorded in `data/compiler-latest-release.json`; proposals and unreleased branches must not be presented as published behavior. Historical reference pages are retired from active search and navigation and remain in source only to support reproducibility.

## Compiler contributions

Read the compiler's [CONTRIBUTING.md](https://github.com/scarp-lang/scarp/blob/main/CONTRIBUTING.md), run its Rust formatting/lint/test gates, and report implementation bugs in the compiler repository. **Documentation fixes cannot themselves introduce language features.**

## Licensing

The Scarp docs repository uses **MIT**. The compiler repository uses **Apache-2.0**. These are separate licenses and should not be conflated.
