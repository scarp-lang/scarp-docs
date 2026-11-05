# Introduction to Scarp

**Latest published compiler: [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1).** For new learners start with the [seven-stage learning path](/guide/learning-path) and the [latest alpha.6 release assets and checksums](/releases/v0.0.6-alpha.1); then follow the complete [alpha.6 project lab](/tutorials/project-symbol-navigation-alpha6).

Scarp is an **experimental**, Rust-implemented, interpreted programming language. The **previous published compiler** is [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5). This general-language overview remains based on the separately verified **alpha.1 reference**; the historical [alpha.4 tagged release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [alpha.4 installation](/guide/installation), [alpha.4 project quickstart](/guide/quickstart-alpha4), and [alpha.3 CLI reference](/tooling/cli) remain historical version-scoped guides. The language is not yet a stable general-purpose alternative to Rust, C++, or Python.

Scarp uses UTF-8 `.srp` source files, a lexer, a parser, a resolver, and an interpreter. Its implementation emphasizes checked numerical operations, explicit output, bounded evaluation, and increasingly capable numerical utilities. The compiler repository contains runnable `.srp` examples and expected-output fixtures.

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~

The program prints `Hello, Scarp!` followed by a newline. `bind` creates an immutable binding, and `print` writes to stdout. See [variables](/language/variables) and [output](/language/output).

## Current scope

The interpreter supports checked `integer`, finite `float`, `string`, `boolean`, numerical vectors, tiles, typed `funcra` functions, loops, and source modules. It does **not** have a general-purpose standard library, user-defined types, a package manager, native code generation, or a stable language specification. Review the [feature status](/reference/status) before relying on a capability.

## How to use these docs

For current onboarding, choose the [learning path](/guide/learning-path), [published alpha.6 release](/releases/v0.0.6-alpha.1), and [alpha.6 project tutorial](/tutorials/project-symbol-navigation-alpha6). The [historical first-program reference](/guide/first-program) remains pinned to alpha.1. The [language reference](/language/overview) explains implemented syntax; the [CLI guide](/tooling/cli) explains how to run and validate files. The [compiler repository](https://github.com/scarp-lang/scarp) remains the source of truth when experimental syntax changes.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md).
