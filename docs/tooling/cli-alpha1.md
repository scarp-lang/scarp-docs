# CLI archive: Scarp v0.0.5-alpha.1

This is a **historical command reference for v0.0.5-alpha.1**, not the current CLI. Use the [published alpha.3 command reference](/tooling/cli) for new projects. Statements about unavailable commands below apply **only to alpha.1**.

The shipped Scarp v0.0.5-alpha.1 interpreter provides exactly three **file commands** plus help/version. Some older design documents suggest additional CLI verbs; those are not shipped commands.

| Command | Available? | Purpose |
| --- | --- | --- |
| `scarp run <file>` | Yes | Check and execute a source graph |
| `scarp check <file>` | Yes | Validate and evaluate the selected path without output |
| `scarp tokens <file>` | Yes | Tokenize a single source file without parsing or execution |
| `scarp --help`, `-h` | Yes | Print usage |
| `scarp --version`, `-V` | Yes | Print executable version |
| `scarp build` / `compile` | **No** | No native `.srp` compilation command |
| `scarp exec` / `verify` / `inspect` | **No** | Not implemented CLI verbs |

## Working with a compiler source checkout

~~~sh
cargo run --locked -- run examples/hello.srp
cargo run --locked -- check examples/scopes.srp
cargo run --locked -- tokens examples/hello.srp
~~~

Cargo's `--` separates Cargo arguments from Scarp arguments. When installed, run the equivalent `scarp` command directly.

## Runtime options

`run` and `check` accept seven decimal limits **before** the file path, each at most once:

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/loops.srp
scarp check --max-vector-bytes 8388608 examples/vectors.srp
~~~

See [the complete limits and defaults](/reference/budgets). `tokens` rejects these runtime limits. Use `--` to separate a dash-prefixed filename:

~~~sh
scarp run -- -example.srp
~~~

## Validation and status codes

- **0**: successful run/check/tokens/help/version.
- **1**: source, runtime, file-read, resource-budget, or output I/O error (except broken pipe behavior).
- **2**: invalid command-line usage, invalid options, or wrong argument count.

A successful `check` writes neither program stdout nor program stderr. It evaluates selected loops, assignments, and arithmetic: it is not solely a static syntax checker. `tokens` does not parse or follow imports.

Scarp resolves relative paths from the process working directory. File contents must be UTF-8; `.srp` is conventional but not enforced for an entry file. Since v0.0.5-alpha.1, imports load from local relative `.srp` paths with root boundaries.

**Verified against:** [official CLI reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/cli.md), [CLI implementation](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/src/main.rs).
