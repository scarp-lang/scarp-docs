# Scientific computing and AI — shipped kernels and future direction

**Latest published experimental compiler:** [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6), released 10 November 2026. This page describes both available primitives and future proposals; it is **not** a claim that a scientific standard library has been released.

Scarp includes immutable finite-float vectors, numeric tiles, matrix operations, a selection of statistics, stable softmax/ranking, explicit loss-gradient primitives and the published sampled calculus/cosine similarity kernels. The current interpreter is bounded. An experimental Rust-hosted C11 emitter and limited ELF64 integer object writer do **not** constitute general native compilation, GPU tensors, automatic differentiation, or neural-network training.

## Published sampled calculus and cosine similarity

**Published in v0.0.6-alpha.4:** `sample_area(x, y) -> float`, `sample_slopes(x, y) -> vector`, `sample_cumulative_area(x, y) -> vector`, and `cosine_similarity(left, right) -> float`. Earlier v0.0.6-alpha.3 binaries do **not** contain the sampled calculus or cosine similarity functions.

Sampled calculus requires finite equally sized coordinate/value vectors with at least two observations and strictly increasing coordinates. It evaluates numerical approximations rather than symbolic integration/differentiation. The cumulative area result starts at zero; on valid finite samples its final result matches total area for the example. Cosine similarity compares two nonzero same-length vectors, returning a finite measure of their relative direction.

See the version-pinned [public API guide](/language/scientific-kernels-alpha4) and the [runnable example catalog](/examples/) for full examples and outputs. The compiler retains its original regression fixtures.

## Published alpha.5 numerical functions and alpha.6 language foundations

The [published v0.0.6-alpha.5 numerical guide](/language/scientific-kernels-alpha5) covers `pearson_correlation`, deterministic `top_p` and `top_p_values`. **None is available in the older alpha.4 binary**. Top-P ranks candidates; it does not implement random sampling. The separately published [v0.0.6-alpha.6 release](/releases/v0.0.6-alpha.6) adds [bounded input](/language/program-input-alpha6), [explicit text conversions](/language/text-foundations-alpha6) and [tuples](/language/tuples-alpha6). These are general-language foundations, not a new scientific library.

No `scarp.math`, `scarp.tensor`, `scarp.science` or `scarp.ai` importable namespaces exist as released libraries. Treat the scientific ecosystem proposal below as **planned**, not as an executable API.

## Architecture and dependency order

1. **Numerical correctness:** scalar edge cases, stable reductions, kernels,
   errors, budgets, platform tests and reproducible benchmarks.
2. **Scientific algorithms:** sampled quadrature, derivatives, regression,
   interpolation, root finding and checked numerical solvers.
3. **Container and type design:** compatible tensor representations, rank/shape
   semantics, safe views and explicit allocation accounting.
4. **First-class functions and library modules:** reviewed APIs so developers
   can express numerical models wholly in `.srp`, without writing Rust.
5. **Automatic differentiation and training:** tested chain rules, graph
   lifetime quotas, parameter updates and reproducible runs.
6. **High-performance execution:** independently verified CPU lowering,
   optional SIMD/parallel kernels and, only later, explicit GPU backends.

The long-term module names `scarp.math`, `scarp.stats`,
`scarp.linalg`, `scarp.science`, `scarp.simulate`,
`scarp.optimize`, `scarp.units`, `scarp.tensor`, `scarp.ai`
and `scarp.signal` are **design candidates**, not importable modules.

For the technical plan and validation requirements see
[compiler proposal 0038](https://github.com/scarp-lang/scarp/blob/main/docs/proposals/0038-scientific-computing-ecosystem.md).
For functionality available today, see [vectors and tiles](/language/numerics)
and the [built-in reference](/reference/library).

## Publication gate

Before advertising a new numerical call as released, require a merged compiler
change, green Linux/Windows/macOS/MSRV tests, independently checked numerical
output, documentation reviewed against actual type signatures, and a compatible
published compiler artifact. Version-pinned examples in this documentation
must continue to execute with the compiler version they claim to demonstrate.
