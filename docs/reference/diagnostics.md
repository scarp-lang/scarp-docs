# Diagnostics and error codes

**Published alpha.2 diagnostic evidence:** [Six compiler-verified failure cases and repairs](/tutorials/alpha2-diagnostics-and-repairs) cover conversions (E0044), Unicode indexing (E0045), module constants (E0037), private imports (E0041) and import cycles (E0039). Their source/stderr fixtures are pinned to the alpha.2 release and checked by CI. The selected table below remains tied to the older **alpha.1** baseline.

Scarp uses compiler diagnostics with error identifiers, source locations and contextual help. Status code **1** indicates source/runtime/file/output errors; status code **2** indicates invalid CLI usage. A successful `check` returns 0 silently.

## Selected errors

| Code | Meaning | Typical repair |
| --- | --- | --- |
| `E0002` | Unterminated string or physical newline | Close the string; use `\n` |
| `E0003` | Unsupported string escape | Use one of five supported escapes |
| `E0004` | Missing statement terminator | Add `;` |
| `E0006` | Integer literal out of range | Use a signed 64-bit integer |
| `E0007` | Checked integer overflow | Reconsider arithmetic bounds |
| `E0008` | Division by zero | Check denominator |
| `E0010` | Unknown name | Declare before use, or check spelling |
| `E0011` | Duplicate declaration | Rename or introduce a new scope |
| `E0013` | Assignment to immutable binding | Use `var` for reassignment |
| `E0015` | Primitive type mismatch | Use matching types; no implicit casts |
| `E0017` | Work budget exhausted | Verify loop termination and limits |
| `E0018` | Output budget exhausted | Reduce output or explicitly raise limit |
| `E0026` | Function contract failed | Correct inputs or implementation |
| `E0027` | Function/depth/slot budget exhausted | Inspect recursion or frame use |
| `E0029` | Output capture limit exhausted | Reduce buffered output |
| `E0030` | Invalid/nonfinite float literal | Use valid finite decimal/exponent spelling |
| `E0031` | Nonfinite float arithmetic result | Check floating-point range |
| `E0032` | Invalid vector/tile shape or mismatched dimensions | Match lengths and matrix axes |
| `E0033` | Vector index or tile row/column out of range | Check zero-based bounds |
| `E0034` | Numerical domain error | Provide nonempty input where required |
| `E0035` | Bounded numerical allocation failed | Reduce allocated payload |
| `E0036` | Numerical allocation budget exhausted | Check new buffer creation |
| `E0038` | Imported source could not load | Verify path/permissions/UTF-8 |
| `E0039` | Import cycle | Refactor shared code into an acyclic module |
| `E0041` | Private module member access | Export an intended supported member with `pub` |
| `E0043` | Import path policy violation | Use a root-contained relative `.srp` path |

This is a **selected troubleshooting table**, not an exhaustive diagnostic catalog. Errors can include related declaration locations and bounded function call traces. Syntax and semantic errors prevent buffered program output; writer errors may occur after some bytes have been emitted.

## How to repair a numerical tile program

Start with the **first reported error code**, location and any related call trace. A source or runtime failure prevents pending program output from being committed. `scarp check <path>` returns exit status **1** and writes a diagnostic to stderr for an invalid program; successful `check` is silent.

1. **Dimensions (E0032):** `tile(values, rows, columns)` requires exactly `rows * columns` visible values. `matvec(tile, vector)` requires `width(tile) == len(vector)`; `matmul(a, b)` requires `width(a) == height(b)`.
2. **Bounds (E0033):** `cell(tile, row, column)` uses zero-based row and column indices. Valid rows are below `height(tile)`; columns must be below `width(tile)`. `lane(tile, row)` checks the row in the same way.
3. **Domain (E0034):** Some reductions need nonempty vectors; `mean([])` is invalid. Supply valid data rather than converting an error to an arbitrary zero.
4. **Execution limits (E0017/E0036):** Work-step exhaustion and cumulative numerical buffer exhaustion are distinct. A larger `--max-steps` budget does not increase `--max-vector-bytes`.
5. **Legacy syntax (E0005/E0004):** Modern declarations use `bind` and `var` instead of earlier `let` forms; typed functions use `funcra`. Refer to [compatibility](/reference/compatibility) before trying syntax from a different version.

To reproduce a known-good numerical example, start with the [verified tiles tutorial](/tutorials/verified-tiles), which is checked against the pinned compiler's matrix-forward program and stdout. Then change **one** argument at a time and rerun `scarp check`; do not treat speculative snippets as verified fixtures.

**Compiler evidence:** [upstream numerical repair guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/numerical-errors.md) and [tiles contract](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md). These are version-pinned references. Compiler wording and exact caret positions can depend on the failing source and platform.

**Verified against:** [diagnostic reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/diagnostics.md), [numerical errors](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/numerical-errors.md).
