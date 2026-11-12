# Introduction to Scarp

**Latest published compiler: [v0.0.6-alpha.8](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.8).** This experimental prerelease ships declarative `scarp.project`, project `init/run/verify`, `scarp test`, per-test `.stdin` fixtures, read-only `scarp project info`, and native `assert` statements. Use the [official packages and checksums](/releases/v0.0.6-alpha.8), [published calculator tutorial](/tutorials/calculator-alpha8), [project CLI reference](/tooling/project-alpha8) and [learning path](/guide/learning-path). The earlier [alpha.7 conditional and Unicode features](/releases/v0.0.6-alpha.7) remain version-pinned. No general native compiler, BigInt, package registry or stable ABI is shipped.

Scarp is an **experimental**, Rust-implemented, interpreted programming language. An **earlier published compiler** is [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5). This general-language overview remains based on the separately verified **alpha.1 reference**; the historical [alpha.4 tagged release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [alpha.4 installation](/guide/installation), [alpha.4 project quickstart](/guide/quickstart-alpha4), and [alpha.3 CLI reference](/tooling/cli) remain historical version-scoped guides. The language is not yet a stable general-purpose alternative to Rust, C++, or Python.

Scarp uses UTF-8 `.srp` source files, a lexer, a parser, a resolver, and an interpreter. Its implementation emphasizes checked numerical operations, explicit output, bounded evaluation, and increasingly capable numerical utilities. The compiler repository contains runnable `.srp` examples and expected-output fixtures.

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~

The program prints `Hello, Scarp!` followed by a newline. `bind` creates an immutable binding, and `print` writes to stdout. See [variables](/language/variables) and [output](/language/output).

## Current scope

The interpreter supports checked `integer`, finite `float`, `string`, `boolean`, numerical vectors, tiles, typed `funcra` functions, loops, and source modules. It does **not** have a general-purpose standard library, user-defined types, a package manager, native code generation, or a stable language specification. Review the [feature status](/reference/status) before relying on a capability.

For quick topic discovery, open [search and navigation](/guide/search-and-navigation); the search works within English/Hindi locale documents and keeps release-specific tutorials distinguishable.

## How to use these docs

For new projects, choose the [learning path](/guide/learning-path) and the [published alpha.8 calculator tutorial](/tutorials/calculator-alpha8). The [historical v0.0.6-alpha.1 project lab](/tutorials/project-symbol-navigation-alpha6) and [first-program reference](/guide/first-program) retain their exact release baselines. The [language reference](/language/overview), [CLI guide](/tooling/cli) and [compiler repository](https://github.com/scarp-lang/scarp) describe their separately verified scopes.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md).
