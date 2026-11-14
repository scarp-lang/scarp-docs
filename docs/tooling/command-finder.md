# Find the right Scarp CLI command for your version

Scarp's command-line interface changes across experimental prereleases. A command available in a newer compiler might be **unknown** to a historical one; in particular, alpha.1/alpha.2's `check` is **not** a substitute for alpha.3's static `verify`.

Use the interactive tool below to select **the exact published compiler version** you installed and the task you want to perform. It will show **release-scoped commands only when shipped**, or explain that the feature was not yet available. You can copy supported commands to your clipboard.

<ScarpCommandFinder />

## How to use these commands

First confirm your actual executable. On alpha.3 and later, use `scarp version`; for alpha.1/alpha.2, use `scarp --version`. Replace `FILE.srp` with the path to a source file and `PROJECT_DIRECTORY` with the path of an existing project containing `Scarp.project`. For `scarp create demo`, choose a **new, nonexistent** directory; that command writes a scaffold and refuses to overwrite existing files.

The command finder is **client-side and offline after the page loads**. It does not query GitHub, detect the executable on your computer, run Scarp programs or read your files. Its reference links point to separately verified release documentation. The **latest published release is [v0.0.6-alpha.10](/releases/v0.0.6-alpha.10)**, not the compiler's moving `main` branch.

## Where the release boundaries come from

| First published | Feature or behavior | Evidence |
| --- | --- | --- |
| **v0.0.5-alpha.1** | `scarp run FILE.srp` for interpreter execution | [Published alpha.1 CLI](/tooling/cli-alpha1) |
| **v0.0.5-alpha.3** | `exec`, static `verify`, `inspect ast`, and offline `diagnose` | [Published alpha.3 CLI](/tooling/cli) |
| **v0.0.5-alpha.4** | Project `create`, `verify DIRECTORY`, and `launch` | [Tagged project quickstart](/guide/quickstart-alpha4) |
| **v0.0.5-alpha.5** | `inspect modules --json PROJECT_DIRECTORY` | [Tagged alpha.5 CLI](/tooling/cli-alpha5) |
| **v0.0.6-alpha.1** | `inspect symbols --json` and `inspect references --json` | [Tagged alpha.6 CLI](/tooling/cli-alpha6) |

Alpha.2 remains selectable for historical `run` behavior. A feature's first publication does **not** establish that every older program runs unchanged in subsequent versions. Follow the [release-aware learning path](/guide/learning-path), [version compatibility](/reference/compatibility), and [installation guide](/guide/installation-alpha6) before migrating source.

The [हिन्दी command finder](/hi/tooling/command-finder) contains the same tasks, tagged release boundaries and commands, with a Hindi interface. If JavaScript is disabled or clipboard permissions are unavailable, use the table and linked versioned CLI references directly.

## Alpha.2 release boundary

The published **v0.0.6-alpha.2** adds bounded Rust embedding caches and dependency invalidation. It does **not** add new `scarp` CLI commands. The existing alpha.1 symbols and references commands remain available. See the [alpha.2 release guide](/releases/v0.0.6-alpha.2).

The previous published compiler [v0.0.6-alpha.3](/releases/v0.0.6-alpha.3) remains available for historical Top-K and temperature-softmax behavior.

## Alpha.4 scientific functions

The published [v0.0.6-alpha.4](/releases/v0.0.6-alpha.4) adds `sample_area`, `sample_cumulative_area`, `sample_slopes` and `cosine_similarity`, but **no new CLI subcommands**. The restricted ELF64 object emitter is a Rust API, not a general native executable compiler or `scarp compile` command.

## Alpha.5 scientific APIs

Published [v0.0.6-alpha.5](/releases/v0.0.6-alpha.5) adds `top_p`, `top_p_values` and `pearson_correlation` without new CLI subcommands. Narrow ELF64 object generation is a Rust embedding API, **not** a `scarp compile` command. See [Top-P](/language/nucleus-selection-alpha5) and [Pearson correlation](/language/pearson-correlation-alpha5).

## Alpha.6 input, text and tuples

Published [v0.0.6-alpha.6](/releases/v0.0.6-alpha.6) adds `read_line()` with redirected UTF-8 input, explicit scalar/text conversions, and immutable tuples. The existing `scarp exec` / `run` / `launch` commands are used; there is **no** `scarp compile` or terminal prompt command. See [input](/language/program-input-alpha6), [text](/language/text-foundations-alpha6), and [tuples](/language/tuples-alpha6).

The published [v0.0.6-alpha.7](/releases/v0.0.6-alpha.7) adds conditional-expression values and Unicode scalar escapes to the interpreter, without adding a general native build command.

## Alpha.8: declarative projects and test commands

**[v0.0.6-alpha.8](/releases/v0.0.6-alpha.8)** is the first published compiler with the new `scarp init`, project `scarp run`, `scarp test` and `scarp project info` workflow. Select alpha.8 in the version picker to see three new tasks: initialize a declarative project, run/list tests, and inspect metadata. When an older version is selected, those commands are marked **unavailable** instead of being suggested for the wrong compiler.

`scarp test --list` only discovers sources; ordinary `scarp test` **executes trusted programs**. `--require-tests` rejects empty suites and failed assertions report E0065. See the [alpha.8 project CLI](/tooling/project-alpha8) and [tagged calculator project](/tutorials/calculator-alpha8).

## Alpha.9: structured test reports

Published [v0.0.6-alpha.9](/releases/v0.0.6-alpha.9) adds `scarp test --json=v2` without changing the original `--json` schema. Choose the new **structured test failures** task in the command finder. Alpha.8 and earlier compiler versions must show this task as unavailable. Read the [JSON-v2 guide](/tooling/test-json-v2-alpha9) for failure phases and privacy limits.

## Alpha.10 interactive prompts

The published compiler adds `--interactive` and `--input-file PATH`. Follow the [input guide](/tooling/interactive-input-alpha10) and the [arrays guide](/language/fixed-arrays-alpha10). Older release selections keep their original capability boundaries.
