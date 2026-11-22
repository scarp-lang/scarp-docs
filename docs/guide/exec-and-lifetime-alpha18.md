# One-command execution, persistent arrays and Scarp Lifetime — alpha.18

<!-- scarp-cli-release: v0.0.6-alpha.18 -->
<!-- scarp-current-source: 84d8de05968a488773e7c5b6eda1376d8957553c -->

This guide targets the **published** [v0.0.6-alpha.18](/releases/v0.0.6-alpha.18) binary, not the moving compiler main branch.

## How `scarp exec` selects the program

Run `scarp exec` from a project directory or a folder containing an entrypoint. The algorithm uses only the **current directory**:

1. If `scarp.project` or legacy `Scarp.project` is present, validate the manifest and use its declared entrypoint.
2. With no manifest, prefer `src/main.srp`.
3. Otherwise use `main.srp`.
4. If none exists, report an error. Do not search parent folders or execute another arbitrary `.srp` file.

An **invalid** manifest is an error; it cannot silently fall back to `src/main.srp`. Explicit paths always work:

~~~sh
scarp exec
scarp exec main.srp
scarp exec src/calculator.srp
scarp exec --max-steps 2000000
~~~

The standard spelling is `scarp exec path/to/file.srp`, not `scarp exec --filename.srp`; an option begins with a dash. For filenames beginning with a dash, use `--` to end options. `exec` enables bounded prompt/typed-input behavior when the running program needs it, while legacy `run` retains explicit interactive opt-in.

## Immutable `array_set`

The built-in `array_set(array, index, replacement)` returns a new snapshot of the **same fixed-array type and length**, without mutating the original. Arguments are evaluated once, left to right. Negative/out-of-range indices produce **E0063**; successful updates charge a new backing against the cumulative array budget, which can raise **E0064**. Index assignment remains unsupported.

~~~scarp
pure funcra replace_last(values: array<integer, 3>) -> array<integer, 3> {
    return array_set(values, 2, 100);
}

bind original = [array: 4, 8, 12];
bind updated = array_set(original, 1, 99);
print(original[1], updated[1], array_len(updated));

bind nested = [array: [array: "one"], [array: "two"]];
bind localized = array_set(nested, 0, [array: "नमस्ते"]);
print(nested[0][0], localized[0][0]);
print(replace_last(updated)[2]);
~~~

~~~text
8 99 3
one नमस्ते
100
~~~

## Scarp Lifetime and what it actually guarantees

Lifetime is the name for compiler-planned scope retirement plus safe-Rust immutable shared storage. Source code needs no explicit `free`, borrowing annotation, or garbage-collector call. Returning or capturing a value preserves its data independently of the lexical scope of an old binding.

In alpha.18, an **empty finite or integer numerical window** detaches from its original backing buffer and uses shared canonical empty storage. A **nonempty view** remains a shared, zero-copy alias that may keep a much larger allocation live. Zero-cell tiles derived from empty windows share the improvement. No numerical elements are copied to produce the empty window.

~~~scarp
// Lifetime preserves value snapshots without explicit memory management.
bind data = [1.0, 2.0, 3.0];
bind tail = window(data, 1, 2);
bind empty = window(data, 2, 0);
print(len(empty), tail);

bind numbers: integers = [integer: 7, 8, 9];
bind empty_numbers = ints_window(numbers, 2, 0);
print(ints_len(empty_numbers), ints_window(numbers, 1, 2));
~~~

~~~text
0 [2.0, 3.0]
0 [integer: 8, 9]
~~~

There is **no** cycle collector for arbitrary object graphs, no exposed pointer or address syntax, and no guarantee that freed storage is immediately returned to the OS. `--max-live-slots` counts allocated slots, `--max-vector-bytes` charges **cumulative** new vector materialization, and neither limits actual process RSS. Composite values, captured output, and nonempty views may extend retention.

The native ELF64 and C11 backends remain experimental Rust-host APIs, not a general `scarp compile` command. For exact scope retirement and future concurrency/FFI limitations see the [tagged Lifetime design](https://github.com/scarp-lang/scarp/blob/84d8de05968a488773e7c5b6eda1376d8957553c/docs/memory-lifetimes.md).

[Release and download checksums](/releases/v0.0.6-alpha.18) · [Earlier alpha.17 array traversal](/language/array-traversal-alpha17)
