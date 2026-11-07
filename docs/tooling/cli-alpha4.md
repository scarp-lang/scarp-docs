# Command-line interface — published Scarp v0.0.5-alpha.4
::: tip Latest CLI reference
The latest published compiler is [v0.0.6-alpha.3](/releases/v0.0.6-alpha.3), which adds Top-K and temperature functions but no new CLI subcommand. For historical alpha.5 module inspection, see the [alpha.5 CLI](/tooling/cli-alpha5). Commands below remain specific to alpha.4.
:::


<!-- scarp-cli-release: v0.0.5-alpha.4 -->
<!-- scarp-project-release: v0.0.5-alpha.4 -->
<!-- scarp-alpha4-cli-reference: 79141329176f5dce51457e90a6652902f6432135 -->
**Historical, release-pinned Scarp alpha.4 CLI:** [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), released November 3, 2026 from [source `79141329176f5dce51457e90a6652902f6432135`](https://github.com/scarp-lang/scarp/commit/79141329176f5dce51457e90a6652902f6432135). These commands are in the tagged **interpreter prerelease**, not just proposals. The language and project manifest are still experimental. For downloaded native packages and SHA-256 verification use [Installation](/guide/installation).

This page covers alpha.4. Preserve the separate [historical alpha.3 file CLI](/tooling/cli) and [alpha.1 CLI](/tooling/cli-alpha1) for their actual command boundaries.

## Published commands

| CLI command | Input | Program statements execute? |
| --- | --- | --- |
| `scarp version`, `scarp --version` | None | No |
| `scarp guide [command]` | Optional help topic | No |
| `scarp diagnose --json` | None; offline capability report | No |
| `scarp create DIRECTORY` | New project directory | No, but **writes two new files** |
| `scarp verify DIRECTORY` | Explicit `Scarp.project` root | **No**, static validation |
| `scarp launch DIRECTORY` | Explicit project root | **Yes**, interpreter |
| `scarp verify FILE.srp` | Existing source file | **No**, static validation |
| `scarp exec FILE.srp` | Existing source file | **Yes**, interpreter |
| `scarp inspect tokens FILE.srp` | Source file | No; lexer only |
| `scarp inspect ast FILE.srp` | Source file | No; parser only |
| `scarp inspect modules --json FILE.srp` | **File**, not directory | No; module inventory |
| `scarp explain E0015` | Existing error code | No |

**Not yet in this published tag:** `scarp inspect modules --json DIRECTORY` (development source only), `scarp build`, `scarp compile`, a package manager, arbitrary program-argument forwarding, native `.srp` executables or implicit project discovery. Older `run`, `check`, `tokens`, `modules` commands remain for migration, but **`check` can execute runtime paths** and is not a replacement for `verify`.

## Create and run the first project

Run this in a writable parent directory where `hello-world` **does not already exist**. From an extracted package, use `.\scarp.exe` in PowerShell or `./scarp` on Linux/macOS instead of a possibly older executable on `PATH`.

~~~sh
scarp version
scarp guide
scarp diagnose --json
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
scarp verify hello-world/src/main.srp
scarp exec hello-world/src/main.srp
~~~

`create` generates `hello-world/Scarp.project` and `hello-world/src/main.srp`. It refuses to overwrite **any existing directory, even an empty one**. The exact generated manifest:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

The exact generated source:

~~~scarp
print("Hello from Scarp!");
~~~

Both `launch hello-world` and `exec hello-world/src/main.srp` print:

~~~text
Hello from Scarp!
~~~

Source, manifest and stdout are pinned in the [published alpha.4 conformance suite](/releases/v0.0.5-alpha.4). See the [first project quickstart](/guide/quickstart-alpha4).

## File commands versus project commands

`verify FILE.srp` checks syntax, imports, names and types **without executing normal runtime statements**. `verify DIRECTORY` first validates that directory's explicit `Scarp.project` and its entrypoint, then performs the same static source checks. Successful verification is silent and creates no artifacts, but **does not guarantee that `launch` will succeed at runtime**. `exec FILE.srp` executes an individual source file. `launch DIRECTORY` executes the entrypoint declared in its manifest through the same interpreter.

The project manifest is UTF-8 with a **4096-byte maximum**, exactly three ordered v1 fields (`scarp-project: 1`, `name:`, `entry:`). The entry must be a relative project-contained `.srp` path. Path traversal, unsafe symlink escapes, invalid fields and duplicated fields fail. The CLI never searches parent directories for the project manifest. See [source path safety](/reference/source-loading) and [alpha.3→alpha.4 migration](/guide/migrate-alpha3-to-alpha4).

## Budgets, JSON and exit codes

`launch` and `exec` accept runtime flags **before** the path: `--max-steps`, `--max-prints`, `--max-call-depth`, `--max-calls`, `--max-live-slots`, `--max-capture-bytes`, `--max-vector-bytes`, `--max-text-bytes`. Static `verify` **rejects runtime flags with exit status 2**. Quote paths with spaces, and use `--` for a path starting with a dash.

~~~sh
scarp launch --max-steps 500000 hello-world
scarp verify --diagnostic-format=json hello-world
scarp launch --diagnostic-format=json hello-world
scarp inspect modules --json hello-world/src/main.srp
~~~

`diagnose --json` reports `"project_workflow":true` and `"native_executable":false`. Successful `inspect modules --json FILE` emits **schema-v1 inventory**. The option `--diagnostic-format=json` on `verify` or `launch` changes **error diagnostics on stderr** only; a successful launch still writes ordinary program output, **not successful JSON**.

| Status | Meaning | Streams |
| --- | --- | --- |
| `0` | Success | `verify` silent; `launch` prints source output |
| `1` | File, manifest, source, type, runtime or budget failure | Error diagnostic on stderr |
| `2` | Invalid command, flag or missing argument | Usage error on stderr |

`inspect tokens` does not type-check, and `inspect ast` outputs a human-readable unstable tree, not successful JSON. See [diagnostics](/reference/diagnostics), [runtime budgets](/reference/budgets) and [compatibility](/reference/compatibility).

**Evidence:** [published release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [tagged CLI](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/main.rs), [project parser](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/project.rs) and [project tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/tests/scarp_projects.rs). This page's commands and both language variants are checked by TypeScript documentation CI and a real tagged compiler conformance job.
