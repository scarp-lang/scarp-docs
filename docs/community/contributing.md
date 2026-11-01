# Contributing to the Scarp ecosystem

There are two distinct repositories:

- [**scarp-lang/scarp**](https://github.com/scarp-lang/scarp) — the Rust interpreter, source-language implementation, compiler tests, and release artifacts.
- [**scarp-lang/scarp-docs**](https://github.com/scarp-lang/scarp-docs) — this VitePress documentation website, which is MIT licensed.

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

A good documentation pull request adds a focused explanation, one source-backed example, a compiler evidence link, and updated navigation or links when appropriate. Responsive design, local search, and theme switching are provided by VitePress; minimal custom CSS keeps the site maintainable.

## Compiler contributions

Read the compiler's [CONTRIBUTING.md](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/CONTRIBUTING.md), run its Rust formatting/lint/test gates, and report implementation bugs in the compiler repository. **Documentation fixes cannot themselves introduce language features.**

## Licensing

The Scarp docs repository uses **MIT**. The compiler repository uses **Apache-2.0**. These are separate licenses and should not be conflated.
