# Experimental native-object CLI

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

This tutorial targets the published alpha.3 object-only backend. It is not a complete operating-system, kernel or executable compiler.

## A small call graph

Save this function-only source as `calls.srp` in a fresh directory. The output filename must not already exist.

~~~scarp
pure funcra add_one(value: integer) -> integer {
    return value + 1;
}

pure funcra evaluate(value: integer) -> integer {
    return add_one(value);
}
~~~

~~~sh
scarp native-object --json x86_64-none bounded-entry evaluate 1000 512 calls.srp -o calls.o
~~~

The source name `evaluate` selects the entry; the exported object symbol is **`scarp_bounded_integer_entry`**, not `evaluate`. JSON is emitted to stdout after successful object publication. `calls.o` is a relocatable ELF64 object, not something to execute directly.

## Modes and limits

| Mode | Use | Exported symbol |
| --- | --- | --- |
| `checked` | Standalone pure integer function, forward scalar flow | `scarp_checked_integer_function` |
| `bounded` | Standalone function with loops and a work allowance | `scarp_bounded_integer_function` |
| `bounded-entry` | Named entry, budget-limited self/mutual recursion, work, active-frame and stack allowances | `scarp_bounded_integer_entry` |

The explicit target is `x86_64-none`. Both allowances are unsigned 32-bit decimal values. The stack budget is measured below the aligned caller stack pointer before CALL; external argument slots and caller alignment padding are separate.

## Diagnostics and output

Success exits 0, invalid arguments or targets exit 2, and source, compilation or file-output failures exit 1. Existing files or symlinks are not replaced. The destination parent must exist and support hard links.

JSON includes schema_version, target, mode, symbol, max_work, peak_stack_bytes, max_active_frames and failure_spans. Failure spans are UTF-8 byte offsets, not character positions.

## Troubleshooting

Use the reported peak_stack_bytes as the minimum accepted stack allowance for this exact source and selected entry. Re-emitting with that exact budget preserves the object bytes; one byte less must be rejected. This does not include external caller argument slots or interrupt frames.

A target such as `x86_64` is invalid; use the explicit `x86_64-none` target. A missing source, unsupported source construct, or pre-existing destination does not produce a replacement object. JSON failure_spans include comments and original line endings in their byte offsets, so retain the exact source file and JSON report.

## What is not supported

Unbounded recursion, external calls, heap-backed values, general aggregate parameters/results, project input and executable linking remain outside this backend. Alpha.3 introduced private flat integer/Boolean aggregates and concrete integer generic specialization; alpha.4 added bounded self/mutual recursion and nested private aggregates. [Verified alpha.4 systems examples](/guide/v007-alpha4-systems). Use `scarp exec` for interpreter execution.

[Current reference](/reference/current) · [Immutable native-object contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/native-object-output.md) · [Release](/releases/v0.0.7-alpha.3).

[Native ABI and host testing](/guide/native-abi) · [Native value layout](/guide/native-layout).

For alpha.3 additions and their limits, see [generics and strings](/guide/v007-alpha3-generics-strings) and [native aggregate locals](/guide/native-aggregate-locals).
