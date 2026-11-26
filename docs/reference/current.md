# Current Scarp compiler reference

<!-- scarp-cli-release: v0.0.7-alpha.2 -->

**Current published snapshot:** [v0.0.7-alpha.2](/releases/v0.0.7-alpha.2), published November 26, 2026. This page describes **verified current behavior**, not a promise of stable syntax across future prereleases.

## CLI and entrypoint selection

| Command | Current documented behavior |
| --- | --- |
| `scarp version` | Reports the running Scarp interpreter version |
| `scarp exec` | Uses a valid manifest in the working directory, else `src/main.srp`, else `main.srp`; an invalid manifest is an error |
| `scarp exec FILE.srp` | Runs an explicitly chosen Scarp source file |
| `scarp verify FILE.srp` | Performs static source and import verification without running program statements |

`scarp exec` supports bounded interactive input when required by the program. It interprets `.srp` source; a general `scarp compile` command is **not** part of this prerelease.

## Persistent fixed arrays

`array_set(values, index, replacement)` returns a new fixed-array snapshot with the **same length and element type**. The original and any earlier aliases remain unchanged. Out-of-bounds indices raise **E0063**. Successful replacements charge the cumulative array-allocation budget and may raise **E0064**. In-place indexed mutation is not supported.

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

## Fixed-array concatenation

`array_concat(left, right)` requires equal element types, returns a new array of the combined length, and leaves inputs unchanged. See [examples](/guide/alpha7-first).

## Lifetime and memory constraints

Scarp Lifetime combines compiler-planned scope retirement with safe Rust shared immutable storage. User source does not need explicit free/borrow calls. In alpha.18, empty finite and integer numerical windows detach from a larger backing allocation; **nonempty views can still retain the original storage**. This is not a general cycle collector, an operating-system memory cap, or a guarantee of immediate memory return. The `--max-vector-bytes` budget is **cumulative** and `--max-live-slots` counts allocated frame slots, not process RAM.

## Published decimal and tuple features

Alpha.20 supports exact decimal literals (`0.1d + 0.2d` is exactly `0.3`), persistent replacement at a constant tuple index on mutable bindings, and lexicographic ordering of compatible numeric tuples. Unsuffixed binary64 float behavior is unchanged. See the [language lesson](/guide/alpha7-first).


Read the [current type system guide](/guide/current-types) for scalar, composite and nominal types with runnable examples.

## Rust embedding and experimental native objects

Alpha.19 introduced checked named/exported callable handles, signature/effect-constrained slots and cumulative execution receipts. Alpha.20 extends host argument admission to strings inside composite values, counted by logical UTF-8 occurrence. These quotas do not bound total process memory.

The experimental native-object backend accepts pure integer functions, up to sixteen required arguments, and bounded nonrecursive direct calls within a file. The new CLI emits relocatable x86-64 ELF64 objects only. Work and call-stack bounds are checked; the ABI is experimental. See the [native-object tutorial](/guide/native-object) and [tagged compiler contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/native-elf64.md).

Read the [current release guide](/guide/alpha7-first) for array concatenation, integer reductions and native limitations.

## What remains outside this compiler

ELF64 object emission is now exposed through an experimental CLI; C11 emission and checked aggregate layout planning remain Rust host APIs. Neither provides general executable compilation. Native recursion, external calls, heap-backed values and aggregate execution remain unsupported. Scarp remains an experimental interpreter, with no stable compiler or standard-library compatibility promise.

## Download and evidence

Use [official downloads](https://scarp-lang.github.io/downloads/), the [current installation guide](/guide/install-latest), the [current language lesson](/guide/alpha7-first), and [immutable compiler source](https://github.com/scarp-lang/scarp/tree/638dc4c227f34f1c660be66834bcc0cbdb22dec8). Archived versioned pages are **retired from current documentation discovery**, though their source and test evidence remain in Git.
