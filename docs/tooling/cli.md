# Command-line interface — v0.0.5-alpha.3

<!-- scarp-cli-release: v0.0.5-alpha.3 -->

**Published alpha.3 CLI (historical reference):** Scarp [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3), released **November 2, 2026**, from [pinned commit `7715c28df09c7703b39e14fddb963275b25df476`](https://github.com/scarp-lang/scarp/commit/7715c28df09c7703b39e14fddb963275b25df476). These commands are **shipped in that prerelease**, not just proposed in the compiler's development documentation. Scarp is still experimental; the CLI interprets `.srp` programs and does **not** emit a native executable.

**Newer published release:** [v0.0.5-alpha.4](/releases/v0.0.5-alpha.4) now ships project `create`, `verify DIRECTORY` and `launch`. For new work, follow the [alpha.4 project quickstart](/guide/quickstart-alpha4). This page remains an exact **alpha.3** reference, and does not claim alpha.4 commands were available in alpha.3.

For standalone-file alpha.3 examples, follow the [alpha.3 quickstart](/guide/quickstart-alpha3). An [archived alpha.1 command reference](/tooling/cli-alpha1) remains available for maintaining old scripts.

## Available commands

| Command | Behavior | Executes program statements? |
| --- | --- | --- |
| `scarp version` / `scarp --version` | Print the installed package version | No |
| `scarp guide` / `scarp guide exec` | Show built-in CLI guidance; topics include `inspect tokens` and `inspect modules` | No |
| `scarp diagnose --json` | Report the real compiler version, platform and available capabilities offline | No |
| `scarp exec FILE` | Validate imports and execute a source graph using the interpreter | **Yes** |
| `scarp verify FILE` | Statically resolve source, names, types and modules | **No** |
| `scarp inspect tokens FILE` | Lex the entry file and display tokens/source positions | No |
| `scarp inspect ast FILE` | Parse the entry file and print an unstable, human-readable tree | No |
| `scarp inspect modules --json FILE` | Check modules and emit schema-version-1 module metadata | No |
| `scarp explain E0015` | Explain an existing diagnostic code without loading source | No |

`scarp` without arguments displays command guidance. Older `run`, `check`, `tokens` and `modules` invocations remain available **for migration compatibility**. Their old names are not recommended for new documentation.

## Start with the right executable

First verify that the executable you are using reports `0.0.5-alpha.3`:

~~~sh
scarp version
scarp guide
scarp diagnose --json
~~~

Use `.\scarp.exe` (PowerShell) or `./scarp` (Linux/macOS) if the executable has not been added to `PATH`. The [installation guide](/guide/quickstart-alpha3) covers official archives, SHA-256 checksums and platform differences.

## Verify, execute and inspect

Run the following from a directory containing the tagged release examples, including `text_construction.srp` and `collection_module.srp` with its `modules/` dependency:

~~~sh
scarp verify text_construction.srp
scarp exec text_construction.srp
scarp inspect tokens text_construction.srp
scarp inspect ast text_construction.srp
scarp inspect modules --json collection_module.srp
scarp explain E0015
~~~

The published `text_construction.srp` fixture produces this output when executed:

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

**`verify` is not `check`.** `verify` performs static validation without running ordinary program statements, runtime arithmetic or function contracts. It may evaluate restricted compile-time scalar module constants. The legacy `check` command can evaluate selected runtime paths while suppressing program output, so it is not a substitute for static verification.

`inspect tokens` only lexes source; it does not check imports, syntax trees or types. `inspect ast` parses the entry file but does **not** type-check, resolve imports or promise a stable machine-readable AST schema. Use `verify` when you need static source/type validation.

## Runtime budgets and help

`exec` accepts supported runtime budget options **before** its single source path, as does the historical `run` command. For example:

~~~sh
scarp exec --max-steps 2000000 text_construction.srp
scarp guide inspect modules
~~~

See [runtime limits and defaults](/reference/budgets). `verify`, `inspect tokens` and `inspect ast` do not execute the source and should not be given runtime-budget flags. **In alpha.3**, the CLI did **not** implement project-mode execution or offer `create` or `launch`. The **published alpha.4** release adds explicit project creation and launch. Neither release forwards arbitrary program arguments, provides package management, or offers `compile`, `build` or native code generation.

Relative source filenames are resolved against the terminal's working directory. Quote paths containing spaces; a filename beginning with `-` can be separated from options using `--`. Source files must contain valid UTF-8 text. Imports are restricted to local relative module paths; see [source-loading security](/reference/source-loading).

## Machine-readable output: three different contracts

| Request | What JSON means |
| --- | --- |
| `diagnose --json` | Offline compiler/platform/capability report (schema version 1 in alpha.3) |
| `inspect modules --json FILE` | Successful **module inventory** (schema version 1) |
| `--diagnostic-format=json` on a source command | **Failure diagnostics** written to stderr (schema version 1) |

The following command deliberately fails against the release's typed-error fixture. It returns a structured `E0015` diagnostic on **stderr**, without executing the program:

~~~sh
scarp verify --diagnostic-format=json diagnostics/type_error.srp
~~~

On a failed `verify`, inspect the exit code and stderr. **`inspect ast --json` is not supported** for successful tree output, and `--diagnostic-format=json` does not transform a successful AST into JSON. Details: [diagnostic reference](/reference/diagnostics) and [published alpha.3 JSON snapshot](/releases/v0.0.5-alpha.3#structured-compiler-diagnostic-schema-version-1).

## Exit status and compatibility

| Exit status | Meaning |
| --- | --- |
| `0` | Successful command |
| `1` | Source/read/runtime/budget or output error |
| `2` | Invalid CLI usage, unsupported option or missing argument |

Successful `verify` is silent, whereas `exec` may write selected user output to stdout and stderr. Invalid source produces a diagnostic; it does not produce partial user-program output. A downstream output I/O failure may occur after output bytes were emitted.

See [alpha.3 compiler release evidence](/releases/v0.0.5-alpha.3), [earlier alpha.2 module inspection](/tooling/alpha2-inspection), or [historical alpha.1 commands](/tooling/cli-alpha1).

**Verification:** This page's command availability is checked against the tagged compiler release in GitHub CI, and the documented example output is pinned in [`conformance/alpha3/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3).
