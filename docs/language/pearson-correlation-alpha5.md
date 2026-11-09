# Centered Pearson correlation (published alpha.5)

[Scarp v0.0.6-alpha.5](/releases/v0.0.6-alpha.5) introduces `pearson_correlation(left, right) -> float`. It measures the **centered** linear relationship between two paired finite numeric vectors and returns a finite value from -1 to 1. Unlike cosine similarity, each vector has its own mean removed.

## Inputs, outputs and validation

Both vectors must be equal in length and have at least **two observations**. Neither may be constant (zero variance). Nonfinite values are invalid. A different right-hand length yields E0032; too few or constant elements E0034, and incorrect type/arity E0015/E0024. The input is immutable; visible windows operate on their displayed elements.

The [official tagged source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.srp) and [exact stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.stdout) give correlations `1.0`, `-1.0`, and `0.0` for aligned, reversed and uncorrelated centered samples.

## Numerical and resource contract

The implementation subtracts/scales axes independently and uses compensated reductions to handle extreme finite magnitudes more robustly. Results are finite and bounded, but floating-point behavior is not an exact guarantee for ill-conditioned inputs. Work is prepaid at `12 × N` abstract steps for up to 65,536 observations, with no newly allocated numerical vector payload. This does not add tensors, automatic differentiation or GPU execution.

[हिन्दी Pearson पाठ](/hi/language/pearson-correlation-alpha5) · [Release evidence](/releases/v0.0.6-alpha.5).
