# Current Scarp compiler reference

<!-- scarp-cli-release: v0.0.6-alpha.18 -->

**Current published snapshot:** [v0.0.6-alpha.18](/releases/v0.0.6-alpha.18), published November 22, 2026. This page describes **verified current behavior**, not a promise of stable syntax across future prereleases.

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

## Development preview: tuple ordering (not released)

The source compiler on `main` includes **lexicographic ordering of numeric tuples**, merged after the alpha.19 publication baseline. **No published alpha.19 (or earlier) binary includes this feature.** See the [development-only tuple ordering reference](/language/tuple-ordering-development) and its source-pinned tests. This section does not change the published alpha.18 snapshot documented above.

## What remains outside this compiler

The native ELF64 and C11 code-generation experiments are **Rust host APIs**, not general user-facing `.srp` binary compilation. Scarp remains an experimental interpreter, with no stable compiler or standard-library compatibility promise.

## Download and evidence

Use [official downloads](https://scarp-lang.github.io/downloads/), the [current installation guide](/guide/install-latest), the [compiler-backed alpha.18 lesson](/guide/exec-and-lifetime-alpha18), and [immutable compiler source](https://github.com/scarp-lang/scarp/tree/84d8de05968a488773e7c5b6eda1376d8957553c). Archived versioned pages are **retired from current documentation discovery**, though their source and test evidence remain in Git.
