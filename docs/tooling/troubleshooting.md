# Troubleshooting

## `scarp: command not found`

Run the executable directly from its extracted directory (`./scarp` or `.\scarp.exe` in PowerShell), or check whether the Cargo binary directory is on your `PATH`. Verify with `scarp --version` before running a tutorial.

## `unknown command` or old syntax errors

Use `scarp run`, `scarp check`, or `scarp tokens`. `scarp build` and `scarp compile` are **not** supported commands. Older beta executables may require `println` and `let` rather than the current `print` and `bind` syntax. Read [compatibility](/reference/compatibility).

## A successful `check` prints nothing

That is intentional. `check` evaluates the selected execution path without replaying output. Use `scarp run` to see program output, or `scarp tokens` to see lexical tokens.

## Arithmetic fails unexpectedly

Integer arithmetic is checked, integers and floats do not mix implicitly, and floating-point results must remain finite. Division by zero is always an error. See [types](/language/types), [operators](/language/operators), and [diagnostics](/reference/diagnostics).

## Imports fail

Import paths must be relative `.srp` paths under the trusted entry directory; resolve them from the importing file, not the shell's working directory. Import cycles and private member access are errors. See [source modules](/language/modules).

## A loop or numerical program exhausts its budget

An exhausted budget is an execution error, not an automatic signal that more memory should be allocated. Inspect loop termination and numerical allocations before increasing `--max-steps` or `--max-vector-bytes`. These are logical limits, not general security isolation. See [budgets](/reference/budgets).

**Verified against:** [compiler troubleshooting](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/troubleshooting.md), [CLI reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/cli.md).
