# Introduction to Scarp

**Latest published compiler: [v0.0.7-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.7-alpha.4).** Generic functions, contextual type inference, generic Option/Result, bounded string operators and experimental native integer specialization with private aggregate locals; no general native executable compiler. [Current release](/releases/v0.0.7-alpha.4) · [Historical alpha.18](/releases/v0.0.6-alpha.18) · [Historical alpha.17](/releases/v0.0.6-alpha.17) · [Learning path](/guide/learning-path).

**Install the current compiler:** [Official Scarp Downloads](https://scarp-lang.github.io/downloads/) · [Current installation guide](/guide/install-latest). This is the recommended path for new installations; older examples retain their original release-specific evidence.

[Previous alpha.15 release](/releases/v0.0.6-alpha.15) retains its separately verified source and CLI boundaries.

Scarp is an **experimental**, Rust-implemented, interpreted programming language. An **earlier published compiler** is [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5). This general-language overview remains based on the separately verified **alpha.1 reference**; the historical [alpha.4 tagged release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [alpha.4 installation](/guide/installation), [alpha.4 project quickstart](/guide/quickstart-alpha4), and [alpha.3 CLI reference](/tooling/cli) remain historical version-scoped guides. The language is not yet a stable general-purpose alternative to Rust, C++, or Python.

Scarp uses UTF-8 `.srp` source files, a lexer, a parser, a resolver, and an interpreter. Its implementation emphasizes checked numerical operations, explicit output, bounded evaluation, and increasingly capable numerical utilities. The compiler repository contains runnable `.srp` examples and expected-output fixtures.

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~

The program prints `Hello, Scarp!` followed by a newline. `bind` creates an immutable binding, and `print` writes to stdout. See [variables](/language/variables) and [output](/language/output).

## Current scope

The interpreter supports checked `integer`, finite `float`, `string`, `boolean`, numerical vectors, tiles, typed `funcra` functions, loops, and source modules. Alpha.12 introduced typed source records and variants. It still has **no** general-purpose standard library, user-defined generics, package manager, general native executable compiler, or stable language specification. Review the [feature status](/reference/status) before relying on a capability.

For quick topic discovery, open [search and navigation](/guide/search-and-navigation); the search works within English/Hindi locale documents and keeps release-specific tutorials distinguishable.

## How to use these docs

For new projects, choose the [learning path](/guide/learning-path) and the [published alpha.8 calculator tutorial](/tutorials/calculator-alpha8). The [historical v0.0.6-alpha.1 project lab](/tutorials/project-symbol-navigation-alpha6) and [first-program reference](/guide/first-program) retain their exact release baselines. The [language reference](/language/overview), [CLI guide](/tooling/cli) and [compiler repository](https://github.com/scarp-lang/scarp) describe their separately verified scopes.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md).

[Previous alpha.14 release](/releases/v0.0.6-alpha.14) retains its own historical validation.

The [historical alpha.16 release](/releases/v0.0.6-alpha.16) preserves separate statistics and Unicode conformance evidence.
