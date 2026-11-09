# Deterministic Top-P selection (published alpha.5)

The **published** [Scarp v0.0.6-alpha.5 release](/releases/v0.0.6-alpha.5) introduces `top_p(probabilities, mass)` and `top_p_values(probabilities, mass)`. These return a deterministic ranked prefix; they do **not** perform stochastic token sampling.

## API contract

`top_p(vector, float) -> integers` returns original zero-based indices in descending probability order. `top_p_values(vector, float) -> vector` returns the same candidates' original scores. Ties use original index order. The mass threshold must be finite and greater than zero, up to and including 1.0. Exactly `1.0` retains **all** elements, including zero-probability entries.

Inputs must contain 1–65,536 finite nonnegative values whose total is 1 within `1e-12`; unnormalized scores are **rejected**, not silently normalized. Use `softmax` or `softmax_temp` first when starting from logits. Immutable `window(...)` inputs return indices relative to the visible window.

## Verified example

Open the [tagged Scarp example](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.srp) and [exact stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.stdout). The first call with probabilities `[0.5, 0.25, 0.25]` and mass `0.75` selects indices `[integer: 0, 1]`; with mass `1.0`, it retains `[integer: 0, 1, 2]`.

## Limits and failures

Invalid probabilities or thresholds raise E0034; wrong arity E0024, wrong types E0015. Ranking is bounded to `O(N log N)`; work is prepaid at `N × (floor(log2(N)) + 5)` steps and index-buffer space at `8N` bytes, with `8K` additional bytes for the `K` values result. Exceeding work/allocation budgets raises E0017/E0036. No RNG, model inference or native compilation is implied.

[हिन्दी Top-P पाठ](/hi/language/nucleus-selection-alpha5) · [Release and download verification](/releases/v0.0.6-alpha.5).
