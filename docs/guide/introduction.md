# Introduction to Scarp

Scarp is an **experimental**, Rust-implemented, interpreted programming language. The **latest published compiler** is [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3). This general-language overview remains based on the separately verified **alpha.1 reference**; use the [current CLI reference](/tooling/cli) and [alpha.3 quickstart](/guide/quickstart-alpha3) for new programs. The language is not yet a stable general-purpose alternative to Rust, C++, or Python.

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

Start with [installation](/guide/installation), then [your first program](/guide/first-program). The [language reference](/language/overview) explains implemented syntax; the [CLI guide](/tooling/cli) explains how to run and validate files. The [compiler repository](https://github.com/scarp-lang/scarp) remains the source of truth when experimental syntax changes.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md).
