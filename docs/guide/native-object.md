# Experimental native-object CLI

<!-- scarp-cli-release: v0.0.7-alpha.2 -->
<!-- scarp-current-source: 638dc4c227f34f1c660be66834bcc0cbdb22dec8 -->

This tutorial targets the published alpha.2 object-only backend. It is not a complete operating-system, kernel or executable compiler.

## A small call graph

Save this function-only source as `calls.srp` in a fresh directory. The output filename must not already exist.

~~~scarp
pure funcra add_one(value: integer) -> integer {
    return value + 1;
}

pure funcra entry(value: integer) -> integer {
    return add_one(value);
}
~~~

~~~sh
scarp native-object --json x86_64-none bounded-entry entry 1000 512 calls.srp -o calls.o
~~~

JSON is emitted to stdout after successful object publication. `calls.o` is a relocatable ELF64 object, not something to execute directly.

## Modes and limits

| Mode | Use |
| --- | --- |
| `checked` | Standalone pure integer function, forward scalar flow |
| `bounded` | Standalone function with loops and a work allowance |
| `bounded-entry` | Named entry, same-file nonrecursive calls, work and stack allowances |

The explicit target is `x86_64-none`. Both allowances are unsigned 32-bit decimal values. The stack budget is measured below the aligned caller stack pointer before CALL; external argument slots and caller alignment padding are separate.

## Diagnostics and output

Success exits 0, invalid arguments or targets exit 2, and source, compilation or file-output failures exit 1. Existing files or symlinks are not replaced. The destination parent must exist and support hard links.

JSON includes schema_version, target, mode, symbol, max_work, peak_stack_bytes, max_active_frames and failure_spans. Failure spans are UTF-8 byte offsets, not character positions.

## What is not supported

Native recursion, external calls, heap-backed values, aggregate execution, project input and executable linking remain future work. Rust aggregate layout metadata does not imply execution support. Use `scarp exec` for interpreter execution.

[Current reference](/reference/current) · [Immutable native-object contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/native-object-output.md) · [Release](/releases/v0.0.7-alpha.2).
