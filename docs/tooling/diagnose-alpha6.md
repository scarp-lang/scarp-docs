# Check your Scarp compiler and host — published alpha.6

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-diagnose-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

The published [Scarp v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) provides **`scarp diagnose`** and **`scarp diagnose --json`** to describe the actual executable you are running. This guide is verified against the [tagged CLI implementation](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/src/main.rs) at source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`. The capability report is **not** a package-registry check, a hardware benchmark, or proof that native Scarp compilation is available.

## 1. Check the executable

After following the [alpha.6 installation and checksum guide](/guide/installation-alpha6), open a terminal that can run your installed Scarp executable:

~~~sh
scarp version
scarp guide diagnose
scarp diagnose
scarp diagnose --json
~~~

`scarp version` identifies the executable's version; for the tagged alpha.6 release, it prints `scarp 0.0.6-alpha.1`. `scarp guide diagnose` gives contextual command help. `scarp diagnose` prints a human-readable report; **`scarp diagnose --json`** prints a single versioned JSON object followed by a newline, on stdout. A successful command does not write to stderr.

The commands above assume `scarp` is on your `PATH`. On Windows PowerShell, when the terminal is inside the extracted executable directory, use:

~~~powershell
.\scarp.exe diagnose --json
~~~

On Linux and macOS, when the executable is in the current directory, use:

~~~sh
./scarp diagnose --json
~~~

Calling the extracted binary directly avoids accidentally inspecting an older executable elsewhere on your `PATH`.

## 2. Read the actual JSON capability fields

The alpha.6 output has these nine keys. The compiler supplies **`host_os`** and **`host_arch`** at runtime; they describe **the machine running the executable**, not a target that Scarp can compile for.

| JSON field | Type | Interpretation in published alpha.6 |
| --- | --- | --- |
| `schema_version` | integer | `1`, the report's JSON schema version |
| `version` | string | `"0.0.6-alpha.1"` for this exact binary |
| `host_os` | string | Rust host operating system, such as `windows`, `linux`, or `macos` |
| `host_arch` | string | Rust host CPU architecture, such as `x86_64` or `aarch64` |
| `execution` | string | `"interpreter"`: `.srp` programs are interpreted |
| `static_verify` | boolean | `true`: `scarp verify` statically checks source without running ordinary program statements |
| `module_inspection` | boolean | `true`: static module inspection is available |
| `project_workflow` | boolean | `true`: explicit `Scarp.project` create/verify/launch workflow is available |
| `native_executable` | boolean | `false`: no native executable generation from `.srp` |
| `package_manager` | boolean | `false`: no built-in package-manager/registry workflow |

There are **ten** fields in total, including the schema version. These values describe implemented broad capabilities, **not** every subcommand or feature. To check symbol/references JSON and release-specific limits, use the [alpha.6 CLI reference](/tooling/cli-alpha6). To learn why AST debug output is not stable JSON, see [AST inspection](/tooling/inspect-ast-alpha6).

## 3. If the report surprises you

If `version` is not `0.0.6-alpha.1`, review which executable is on your `PATH` and use the correct [published release archive](/guide/installation-alpha6). A report showing `native_executable: false` or `package_manager: false` is **expected**: there is no `scarp build`, `scarp compile`, or native `.srp` package tool in this published release. Rust's `cargo build` builds the Scarp **interpreter itself**.

The report is deliberately **offline and read-only**. It does not query the network, test external registries, create a project, validate a source file, or prove that any `.srp` code will run successfully. For source validation use `scarp verify`; for a complete example follow the [alpha.6 project tutorial](/tutorials/project-symbol-navigation-alpha6).

Only `scarp diagnose`, `scarp diagnose --json`, and help forms are supported. Unsupported extra arguments such as `scarp diagnose --format=json` are **usage errors with exit code 2** and no successful report on stdout. For other failures, follow [troubleshooting](/tooling/troubleshooting). This documentation describes the published alpha.6 binary, not an unreleased compiler branch.
