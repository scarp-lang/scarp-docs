# Inspect the Scarp syntax tree — published alpha.6

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-ast-inspection: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

The **published [Scarp v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)** includes `scarp inspect ast`. This page is pinned to source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` and the actual [AST inspection CLI tests](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/tests/scarp_inspect_ast.rs). The feature is **experimental developer inspection**. It is not a stable language AST API, a code formatter, a type checker or a native compiler.

## 1. Inspect a real source file

Install the [published alpha.6 executable](/guide/installation-alpha6). From the root of its extracted release package or the tagged compiler repository (the folder containing `examples/`), run:

~~~sh
scarp version
scarp guide inspect ast
scarp inspect ast examples/hello.srp
scarp inspect tokens examples/hello.srp
scarp verify examples/hello.srp
~~~

The source used by the published example is [`examples/hello.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/hello.srp):

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

`scarp inspect ast` prints the parser's actual **human-readable Rust debug tree** to stdout, containing a `Program` node. The exact nested debug formatting is deliberately **not stable**: do not copy a displayed tree into an integration test or treat it as a versioned JSON schema.

## 2. Choose the correct inspection stage

| CLI command | What it checks | Executes program statements? |
| --- | --- | --- |
| `scarp inspect tokens FILE.srp` | Tokens and UTF-8 source locations, without parsing | No |
| `scarp inspect ast FILE.srp` | Parse **only this one entry file** into a syntax tree | No |
| `scarp verify FILE.srp` | Resolve imports, names and types; check compile-time constants | No ordinary runtime execution |
| `scarp inspect modules --json FILE.srp` | Checked module graph and versioned module metadata | No |
| `scarp inspect symbols --json FILE.srp` | Static definitions in a resolved source graph | No |
| `scarp inspect references --json FILE.srp` | Static uses of definitions in that graph | No |
| `scarp exec FILE.srp` | Run the program with the interpreter | **Yes** |

These commands are supported by the tagged [compiler CLI](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/src/main.rs). AST inspection can parse a file that imports a **missing module** and contains **runtime division by zero**: it does not try to resolve that module, evaluate expressions, execute contracts or execute statements. In contrast, `verify` can reject unresolved imports and typing errors. This means an AST success **never guarantees** that `verify` or `exec` will succeed.

## 3. Understand diagnostics and unsupported flags

Create a temporary file called `broken.srp` containing this **deliberately invalid** parser input:

~~~text
print(1 + );
~~~

Then run:

~~~sh
scarp inspect ast --diagnostic-format=json broken.srp
~~~

For parse/lexing errors, `--diagnostic-format=json` selects a **schema-version-1 error on stderr** and leaves stdout empty. Plain errors use stderr text. The compiler reports exit code **1** for the invalid source. Successful AST inspection emits a *debug tree*, **not JSON**, even when you request JSON-formatted error diagnostics.

The following are **not supported** for successful AST output: `scarp inspect ast --json FILE.srp`, `scarp ast FILE.srp`, and runtime budget flags such as `--max-steps`. Unsupported commands or flags exit **2**. `scarp inspect ast` accepts a **file path**, not a `Scarp.project` directory. If your filename begins with a dash, supply the normal `--` separator (for example `scarp inspect ast -- -source.srp`). Filenames with spaces and Unicode are supported.

## 4. What to try next

If the AST succeeds but imports fail, run `scarp verify FILE.srp` and review [module-loading rules](/reference/source-loading). For resolved cross-file definitions and references, follow the [published alpha.6 symbol navigation guide](/tooling/cli-alpha6) and [two-file project tutorial](/tutorials/project-symbol-navigation-alpha6). If you need a diagnostic explanation, use `scarp explain E####` with an actual reported error code.

**Limitations:** the AST debug output has no stable JSON schema, cross-file resolution, type information or source edit operations; it is not an LSP and cannot produce native executables. See the [release notes](/releases/v0.0.6-alpha.1), [current troubleshooting](/tooling/troubleshooting) and [published tagged tests](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/tests/scarp_inspect_ast.rs) for the verified behavior.
