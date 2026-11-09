# Scarp v0.0.6-alpha.5 — published numerical kernels

> **Published experimental prerelease:** [v0.0.6-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.5), 9 November 2026, exact compiler source `205e92f166f186c3905e5880d41c31717b697b8e`. These operations are **not** present in earlier v0.0.6-alpha.4 binaries. This is an interpreter-based, finite numerical API—not a sampling engine, neural-network framework, tensor stack, or general native compiler.

## Pearson correlation

The pure typed operation `pearson_correlation(left, right) -> float` compares **centered** paired values, unlike `cosine_similarity`, which compares directions without subtracting means. Both vectors must have the same length of at least two, finite binary64 elements, and nonzero variance. Shape mismatch yields E0032; empty, single-element, or constant arrays yield E0034. The finite result is in the mathematical interval from -1 to 1.

The complete original compiler fixture is:

~~~scarp
// Pearson correlation: centered scientific statistics, not cosine similarity.
bind measurements = [1.0, 2.0, 3.0];
print(pearson_correlation(measurements, [10.0, 20.0, 30.0]));
print(pearson_correlation(measurements, [30.0, 20.0, 10.0]));
print(pearson_correlation([-1.0, 0.0, 1.0], [1.0, -2.0, 1.0]));
~~~

~~~text
1.0
-1.0
0.0
~~~

The implementation scales and center-reduces both axes with compensated arithmetic, prepays `12 × N` abstract work steps, and allocates no new numerical vector payload. It remains finite-precision and does not guarantee exact real-number results in ill-conditioned inputs.

[Immutable source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.srp) · [exact stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.stdout) · [course migration PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57).

## Deterministic Top-P (nucleus selection)

`top_p(probabilities, mass) -> integers` returns original zero-based indices in descending probability order until the cumulative mass threshold is reached. `top_p_values(probabilities, mass) -> vector` returns original values in the same order. Equal scores break ties by original index. This is **not random sampling**, and it never generates text.

Probabilities must be nonempty, finite, nonnegative, and sum to 1 within an absolute tolerance of `1e-12`; `mass` must be finite and in `(0, 1]`. At exactly `1.0`, every original entry is retained, including zero-probability tails. Invalid numerical domains report E0034; wrong types E0015; wrong arity E0024.

~~~scarp
// Deterministic nucleus selection: rank the smallest probability prefix
// covering the specified cumulative mass without random sampling.
bind probabilities = [0.5, 0.25, 0.25];
print(top_p(probabilities, 0.75));
print(top_p_values(probabilities, 0.75));
print(top_p(probabilities, 1.0));

bind logits = [1.0, 4.0, 4.0, 2.0];
print(top_p(softmax_temp(logits, 0.5), 0.9));
~~~

~~~text
[integer: 0, 1]
[0.5, 0.25]
[integer: 0, 1, 2]
[integer: 1, 2]
~~~

The kernel ranks at most 65,536 entries, prepays `N × (floor(log2(N)) + 5)` abstract work steps, and charges `8N` bytes for the index array plus `8K` bytes for the selected output of `top_p_values` (where K is selected count). Work and payload exhaustion yield E0017 and E0036. Invalid calls produce no partial output.

[Immutable source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.srp) · [exact stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.stdout) · [course migration PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57).

## What did not ship

The optional experimental [ELF64 milestone](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/docs/native-elf64.md) is a **Rust embedding API** for limited integer object generation; it is not `scarp compile`. No GPU/tensor/autodiff system, stochastic decoder, native linker, full LSP, or package manager is included.

Continue with [published alpha.4 scientific kernels](/language/scientific-kernels-alpha4) for `cosine_similarity`, sampled calculus, Top-K, and temperature softmax. The [course examples PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57) is still under review; do not assume its proposed course URLs are live until merged and deployed.
