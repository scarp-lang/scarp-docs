# Current Scarp compiler reference

<!-- scarp-cli-release: v0.0.6-alpha.20 -->

**Current published snapshot:** [v0.0.6-alpha.20](/releases/v0.0.6-alpha.20), published November 24, 2026. This page describes **verified current behavior**, not a promise of stable syntax across future prereleases.

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

## Lifetime and memory constraints

Scarp Lifetime combines compiler-planned scope retirement with safe Rust shared immutable storage. User source does not need explicit free/borrow calls. In alpha.18, empty finite and integer numerical windows detach from a larger backing allocation; **nonempty views can still retain the original storage**. This is not a general cycle collector, an operating-system memory cap, or a guarantee of immediate memory return. The `--max-vector-bytes` budget is **cumulative** and `--max-live-slots` counts allocated frame slots, not process RAM.

## Published decimal and tuple features

Alpha.20 supports exact decimal literals (`0.1d + 0.2d` is exactly `0.3`), persistent replacement at a constant tuple index on mutable bindings, and lexicographic ordering of compatible numeric tuples. Unsuffixed binary64 float behavior is unchanged. See the [language lesson](/guide/alpha20-language).


Read the [current type system guide](/guide/alpha20-types) for scalar, composite and nominal types with runnable examples.

## Rust embedding and experimental native objects

Alpha.19 introduced checked named/exported callable handles, signature/effect-constrained slots and cumulative execution receipts. Alpha.20 extends host argument admission to strings inside composite values, counted by logical UTF-8 occurrence. These quotas do not bound total process memory.

The experimental native object API supports pure functions with one to six integer parameters, integer/Boolean locals, checked arithmetic, local assignment, short-circuit logic and early integer returns. Its target is Linux x86-64 System V ELF64, not a general native CLI. Loops, calls, contracts, defaults and heap-backed values are outside the subset. See [compiler native contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/native-elf64.md).

Read [systems programming and Rust embedding](/guide/alpha20-systems) for native ABI boundaries, callable slots and cumulative quotas.

## What remains outside this compiler

The native ELF64 and C11 code-generation experiments are **Rust host APIs**, not general user-facing `.srp` binary compilation. Scarp remains an experimental interpreter, with no stable compiler or standard-library compatibility promise.

## Download and evidence

Use [official downloads](https://scarp-lang.github.io/downloads/), the [current installation guide](/guide/install-latest), the [current language lesson](/guide/alpha20-language), and [immutable compiler source](https://github.com/scarp-lang/scarp/tree/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98). Archived versioned pages are **retired from current documentation discovery**, though their source and test evidence remain in Git.
