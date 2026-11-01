# Diagnostics and error codes

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
| `E0036` | Numerical allocation budget exhausted | Check new buffer creation |
| `E0038` | Imported source could not load | Verify path/permissions/UTF-8 |
| `E0039` | Import cycle | Refactor shared code into an acyclic module |
| `E0041` | Private module member access | Export an intended supported member with `pub` |
| `E0043` | Import path policy violation | Use a root-contained relative `.srp` path |

This is a **selected troubleshooting table**, not an exhaustive diagnostic catalog. Errors can include related declaration locations and bounded function call traces. Syntax and semantic errors prevent buffered program output; writer errors may occur after some bytes have been emitted.

**Verified against:** [diagnostic reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/diagnostics.md), [numerical errors](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/numerical-errors.md).
