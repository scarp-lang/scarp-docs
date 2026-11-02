# Command-line interface

**Latest published CLI:** [Scarp v0.0.5-alpha.3](/releases/v0.0.5-alpha.3) adds the Scarp-first `exec`, static-only `verify`, `inspect tokens/ast/modules`, offline `diagnose`, contextual `guide`, and `version` commands. The released interpreter continues accepting the original legacy commands. The table below documents the **older pinned alpha.1 behavior only**, not the latest release. Do not confuse static `verify` with execution-backed legacy `check`.

**Newer published release:** [v0.0.5-alpha.2](/tooling/alpha2-inspection) adds module inventory, JSON module inspection, and source-free diagnostic explanations. The table below remains specific to the older **alpha.1** interpreter; do not treat it as the current command list for alpha.2.

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
