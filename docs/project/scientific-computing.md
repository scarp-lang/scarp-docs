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

## Work in progress: sampled calculus

[Compiler PR #153](https://github.com/scarp-lang/scarp/pull/153)
proposes two typed pure kernels:

| Proposed call | Result | Purpose |
| --- | --- | --- |
| `sample_area(x, y)` | `float` | Integrate measurements using the composite trapezoidal rule |
| `sample_slopes(x, y)` | `vector` | Estimate a secant derivative for each adjacent interval |

This PR is **not part of alpha.3**. Do not copy its examples into projects
built against the published compiler until a verified compatible release
is identified. The [compiler's detailed implementation and tests](https://github.com/scarp-lang/scarp/blob/feature/scientific-sampled-calculus/docs/sampled-calculus.md)
are reviewable, but the development branch can change.

Both functions require equal-length finite-vector inputs with at least two
entries and strictly increasing coordinates. They are not symbolic
differentiation, spline fitting or exact integration. The branch checks
numerical overflow, enforces bounded work and numerical output allocation,
and uses finite binary64 arithmetic.

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
[compiler proposal 0038](https://github.com/scarp-lang/scarp/blob/feature/scientific-sampled-calculus/docs/proposals/0038-scientific-computing-ecosystem.md).
For functionality available today, see [vectors and tiles](/language/numerics)
and the [built-in reference](/reference/library).

## Publication gate

Before advertising a new numerical call as released, require a merged compiler
change, green Linux/Windows/macOS/MSRV tests, independently checked numerical
output, documentation reviewed against actual type signatures, and a compatible
published compiler artifact. Version-pinned examples in this documentation
must continue to execute with the compiler version they claim to demonstrate.
