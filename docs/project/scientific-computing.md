# Scientific computing and AI — proposed direction

**Development proposal, not a released Scarp library.** The latest verified
public compiler prerelease is [v0.0.6-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.3).
Scientific computing remains incremental: no `scarp.math`, `scarp.tensor`,
`scarp.science` or `scarp.ai` standard-library namespaces are implemented yet.

Scarp already supports immutable finite-float vectors, two-axis numeric tiles,
checked matrix operations, selected statistics, stable softmax, ranking and
specialized loss-gradient kernels. The language currently executes through
a bounded Rust interpreter. Its C11 emitter is limited to an experimental,
Rust-hosted scalar subset; this is **not** general native executable compilation.
There is no GPU tensor backend, automatic differentiation engine or neural
network training framework.

## Source-only sampled calculus (unreleased)

[Compiler PR #153](https://github.com/scarp-lang/scarp/pull/153)
was **merged into main** after the published alpha.3 release. It adds two typed pure kernels:

| Proposed call | Result | Purpose |
| --- | --- | --- |
| `sample_area(x, y)` | `float` | Integrate measurements using the composite trapezoidal rule |
| `sample_slopes(x, y)` | `vector` | Estimate a secant derivative for each adjacent interval |

These calls are **not part of the published alpha.3 artifacts**. Do not
copy them into projects built against that published compiler until a newer,
compatible release is verified. Source code and tests are available in the
[merged compiler PR](https://github.com/scarp-lang/scarp/pull/153/files).

Both functions require equal-length finite-vector inputs with at least two
entries and strictly increasing coordinates. They are not symbolic
differentiation, spline fitting or exact integration. The merged code checks numerical overflow, enforces bounded work and
numerical output allocation, and uses finite binary64 arithmetic.

[Compiler PR #155](https://github.com/scarp-lang/scarp/pull/155) has
also **merged into main**, adding
`sample_cumulative_area(x, y) -> vector`: a prefix integral with one result
per coordinate. Its first value is zero and its final value matches the
full sampled integral for finite, representable results.
**All three kernels are available in current source only, not alpha.3.**

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
[compiler proposal 0038](https://github.com/scarp-lang/scarp/pull/153/files).
For functionality available today, see [vectors and tiles](/language/numerics)
and the [built-in reference](/reference/library).

## Publication gate

Before advertising a new numerical call as released, require a merged compiler
change, green Linux/Windows/macOS/MSRV tests, independently checked numerical
output, documentation reviewed against actual type signatures, and a compatible
published compiler artifact. Version-pinned examples in this documentation
must continue to execute with the compiler version they claim to demonstrate.
