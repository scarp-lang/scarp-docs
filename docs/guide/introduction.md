# Introduction to Scarp

**Latest published compiler: [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5).** New capabilities include project-aware module inspection and an experimental C11 **Rust embedding API**, not a native compile CLI. Start with [alpha.5 installation](/guide/installation-alpha5), [alpha.5 CLI](/tooling/cli-alpha5) and the [release guide](/releases/v0.0.5-alpha.5).

Scarp is an **experimental**, Rust-implemented, interpreted programming language. The **previous published compiler** is [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), with an interpreter-backed project workflow. This general-language overview remains based on the separately verified **alpha.1 reference**; for new installs start with the [alpha.4 installation guide](/guide/installation) and [alpha.4 project quickstart](/guide/quickstart-alpha4). The [alpha.3 CLI reference](/tooling/cli) still describes individual-file commands. The language is not yet a stable general-purpose alternative to Rust, C++, or Python.

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

Start with the [published alpha.4 installation guide](/guide/installation), then the [alpha.4 project quickstart](/guide/quickstart-alpha4). The [historical first-program reference](/guide/first-program) remains pinned to alpha.1. The [language reference](/language/overview) explains implemented syntax; the [CLI guide](/tooling/cli) explains how to run and validate files. The [compiler repository](https://github.com/scarp-lang/scarp) remains the source of truth when experimental syntax changes.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md).
