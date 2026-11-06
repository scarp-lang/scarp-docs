# Find the right Scarp CLI command for your version

Scarp's command-line interface changes across experimental prereleases. A command available in a newer compiler might be **unknown** to a historical one; in particular, alpha.1/alpha.2's `check` is **not** a substitute for alpha.3's static `verify`.

Use the interactive tool below to select **the exact published compiler version** you installed and the task you want to perform. It will show **release-scoped commands only when shipped**, or explain that the feature was not yet available. You can copy supported commands to your clipboard.

<ScarpCommandFinder />

## How to use these commands

First confirm your actual executable. On alpha.3 and later, use `scarp version`; for alpha.1/alpha.2, use `scarp --version`. Replace `FILE.srp` with the path to a source file and `PROJECT_DIRECTORY` with the path of an existing project containing `Scarp.project`. For `scarp create demo`, choose a **new, nonexistent** directory; that command writes a scaffold and refuses to overwrite existing files.

The command finder is **client-side and offline after the page loads**. It does not query GitHub, detect the executable on your computer, run Scarp programs or read your files. Its reference links point to separately verified release documentation. The **latest published release is [v0.0.6-alpha.2](/releases/v0.0.6-alpha.2)**, not the compiler's moving `main` branch.

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
