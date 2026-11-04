# Scarp CLI — published v0.0.5-alpha.5

<!-- scarp-cli-release: v0.0.5-alpha.5 -->
<!-- scarp-alpha5-cli-reference: 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 -->

This is the current **published** Scarp CLI reference, based on [GitHub release v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) (November 4, 2026) and exact source commit 2eeed0aa52ccb59523307841ad8ffbd83f8911a8. The CLI still uses a Rust interpreter, **not native executable compilation**.

For new installs follow [alpha.5 installation](/guide/installation-alpha5). Use the separate [alpha.4 CLI](/tooling/cli-alpha4), [alpha.3 CLI](/tooling/cli) and [alpha.1 CLI](/tooling/cli-alpha1) when working with those earlier compiler versions.

## Command availability by release

| Command or capability | Earliest published version | Executes ordinary statements? |
| --- | --- | --- |
| scarp exec FILE, static scarp verify FILE, scarp inspect tokens/ast/modules FILE | alpha.3 | exec **yes**, verify/inspect **no** |
| scarp create DIRECTORY, scarp launch DIRECTORY, scarp verify DIRECTORY | alpha.4 | launch **yes**, create writes new files, verify is static |
| **scarp inspect modules --json DIRECTORY** | **alpha.5** | **No**: static project-aware module inspection |
| scarp modules --json DIRECTORY (legacy alias) | alpha.5 | **No** |
| scarp diagnose --json, scarp guide, scarp version | alpha.3 | No |
| Rust embedding C11 emitter emit_c/emit_program | alpha.5 | Not a CLI command; separate Rust API |
| scarp compile, scarp build, general native executable generation | **Not shipped** | Not available |

## Project-aware module inspection

Open a writable parent directory where hello-scarp does **not already exist**. The generated project has a version-1 Scarp.project manifest and src/main.srp entrypoint. Run:

~~~sh
scarp version
scarp create hello-scarp
scarp verify hello-scarp
scarp inspect modules --json hello-scarp
scarp inspect modules --json hello-scarp/src/main.srp
scarp modules --json hello-scarp
scarp launch hello-scarp
~~~

The two inspect commands resolve to the same canonical entrypoint and should return **identical schema-version-1 module JSON** for this project. The old modules alias is retained for compatibility. Inspect runs **no normal runtime statements** and never builds native artifacts.

Invalid, missing, oversized or unsafe manifests fail with **exit status 1** and diagnostic stderr rather than a partial module inventory. Use the existing --diagnostic-format=json option for JSON **errors**; it is different from --json for **successful inventory**. Project paths must be explicit; there is no implicit search for parent manifests. Traversal and escaping symlink paths are rejected.

The project workflow from alpha.4 remains unchanged: create refuses to overwrite **even empty existing directories**, verify DIRECTORY checks the project statically, and launch DIRECTORY executes the declared entrypoint. The generated manifest is at most **4096 UTF-8 bytes** with three ordered fields and an entry path confined within the project.

## Exact interpreter example from the tagged alpha.5 compiler

The release includes [native_scalar_repeat.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/examples/native_scalar_repeat.srp) and its exact stdout snapshot. Run these from the extracted official package's examples directory:

~~~sh
scarp verify examples/native_scalar_repeat.srp
scarp exec examples/native_scalar_repeat.srp
~~~

The interpreter writes:

~~~text
even-index sum
6
triangle cells
6
0
2
~~~

This demonstrates counted repeat loops and scalar calculations. **No standalone C executable is produced**.

## Exit codes and diagnostic output

| Exit code | Meaning |
| --- | --- |
| 0 | Successful command |
| 1 | Manifest, source, runtime, I/O, or budget failure; diagnostic on stderr |
| 2 | CLI usage error: unsupported command, flag or missing argument |

Static verify does not execute program statements. Legacy check **may** evaluate selected runtime paths and is **not** equivalent. Inspect modules is static and does not accept runtime execution budget flags. Run/exec/launch still use the interpreter. The offline diagnose --json report includes current version/platform/capabilities; success output is not the same as failure diagnostics.

## Rust-only C11 emitter is NOT a CLI compiler

The [experimental C11 backend](/reference/c11-backend-alpha5) supplies a C11 string through scarp::c_backend::emit_c and emit_program **to Rust embedding hosts only**. A host must separately provide its own C compiler; no scarp compile command or cross-platform native executable workflow was published. Unsupported emitter forms return E0049, and the interpreter supports a broader language subset than this backend.

See the [full alpha.5 release guide](/releases/v0.0.5-alpha.5), [feature status](/reference/status), [installation](/guide/installation-alpha5) and [compatibility](/reference/compatibility).

**Evidence:** [Tagged CLI source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/src/main.rs), [tagged project tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/tests/scarp_projects.rs), [GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) and compiler source 2eeed0aa52ccb59523307841ad8ffbd83f8911a8. CI builds the exact published tag and exercises file/project inspection.
