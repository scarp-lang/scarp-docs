# Troubleshooting

**Current release: [v0.0.6-alpha.1](/releases/v0.0.6-alpha.1).** New installations should use the [alpha.6 installer](/guide/installation-alpha6), [source navigation CLI](/tooling/cli-alpha6), and [AST debugging guide](/tooling/inspect-ast-alpha6). Older [alpha.5 CLI](/tooling/cli-alpha5) and [Rust-only C11 embedding API](/reference/c11-backend-alpha5) remain historical. The alpha.2 diagnostic fixtures below are intentionally version-specific.

**On the published v0.0.5-alpha.2 compiler:** use the [six verified failing examples and repairs](/tutorials/alpha2-diagnostics-and-repairs) to identify E0044/E0045 conversion and Unicode errors, restricted module constants, private imports and cycles. The examples are reproduced from published compiler test fixtures and run in CI. The advice below otherwise applies to the versioned general interpreter behavior.

## `scarp: command not found`

Run the executable directly from its extracted directory (`./scarp` or `.\scarp.exe` in PowerShell), or check whether the Cargo binary directory is on your `PATH`. Verify with `scarp --version` before running a tutorial.

## `unknown command` or old syntax errors

For the **published alpha.6 compiler** (and the older alpha.5 project workflow), use `scarp exec FILE.srp` to run a file, `scarp verify FILE.srp` to validate statically, and `scarp create DIRECTORY` / `scarp verify DIRECTORY` / `scarp launch DIRECTORY` for project work. Project module inspection is `scarp inspect modules --json DIRECTORY`. Alpha.6 also supports `scarp inspect symbols --json FILE.srp` and `scarp inspect references --json FILE.srp`. Historical `run`, `check`, and `tokens` remain for old scripts. `scarp build` and `scarp compile` are **not** supported commands. Older beta executables may require `println` and `let` rather than the current `print` and `bind` syntax. Read [compatibility](/reference/compatibility).

## A successful `check` prints nothing

That is intentional. `check` evaluates the selected execution path without replaying output. Use `scarp exec FILE.srp` to see output. The newer **static-only** `scarp verify FILE.srp` checks without executing normal statements; legacy `check` is different. Use `scarp inspect tokens FILE.srp` to inspect lexical tokens.

## `inspect ast` succeeds, but `verify` fails

That is expected if the **parser** can read a file but an import cannot be resolved or the program has typing errors. `scarp inspect ast FILE.srp` parses the entry file only; it does not validate modules or execute code. Use the [published alpha.6 AST walkthrough](/tooling/inspect-ast-alpha6) to distinguish tokens, AST, verified modules and resolved symbols. `scarp inspect ast --json` is unsupported: `--diagnostic-format=json` selects **error diagnostics only**, not successful AST output.

## Arithmetic fails unexpectedly

Integer arithmetic is checked, integers and floats do not mix implicitly, and floating-point results must remain finite. Division by zero is always an error. See [types](/language/types), [operators](/language/operators), and [diagnostics](/reference/diagnostics).

## Imports fail

Import paths must be relative `.srp` paths under the trusted entry directory; resolve them from the importing file, not the shell's working directory. Import cycles and private member access are errors. See [source modules](/language/modules).

## A loop or numerical program exhausts its budget

An exhausted budget is an execution error, not an automatic signal that more memory should be allocated. Inspect loop termination and numerical allocations before increasing `--max-steps` or `--max-vector-bytes`. These are logical limits, not general security isolation. See [budgets](/reference/budgets).

**Verified against:** [compiler troubleshooting](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/troubleshooting.md), [CLI reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/cli.md).
