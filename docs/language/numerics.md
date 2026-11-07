# Vectors and tiles

Scarp v0.0.5-alpha.1 includes numerical features built on **finite binary64** values. These are specialized primitives, not general-purpose mutable collections or tensors.

## Vectors

A vector is an immutable collection of finite floats. The compiler example shows vector literals, indexing, snapshots, and numerical kernels:

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(values, len(values), values[0]);
var weights = [0.2, 0.3, 0.5];
bind snapshot = weights;
weights = scale(weights, 2.0);
print(snapshot);
print(weights);
print(sum(values), mean(values));
~~~

`len`, `scale`, `sum`, and `mean` are implemented numerical built-ins. Other checked operations include dot products, norms, reductions, windows and selected prediction/loss utilities. See [built-ins](/reference/library) rather than assuming Python/NumPy function names exist.

## Tiles and matrix operations

A tile has two explicit dimensions with immutable row-major numerical elements.

~~~scarp
bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
print(matvec(weights, [2.0, 1.0])); // [4.0, 1.0]
~~~

The currently implemented tile API includes `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd`, and `tilescale`. There is no automatic broadcasting, mutable cell indexing, or general N-dimensional tensor type.

## Build a real two-axis numerical example

The [verified matrix-forward lesson](/tutorials/verified-tiles) reproduces the **complete published `matrix_forward.srp` file** and its expected stdout. Unlike a short illustrative snippet, its source/output pair is included in the documentation's pinned compiler conformance suite and executed in CI. Start with [verified vectors](/tutorials/verified-vectors) if `vector` is unfamiliar.

`matvec(t, v)` requires `width(t) == len(v)`; `matmul(a, b)` requires `width(a) == height(b)`. A tile's cell count is at most 65,536, with row/column dimensions checked separately; row-major elements cannot be changed in place. Each new materialized output can charge the cumulative `--max-vector-bytes` budget, so successful type checks do not guarantee unlimited computation. Consult [numerical diagnostics](/reference/diagnostics) before increasing limits.

## Classification and probability kernels

The [verified classification and probabilities tutorial](/tutorials/verified-classification) runs **three full published compiler examples** covering matrix scores, `argmax` tie-breaking, `softmax`, `crossentropy` and `onehot` targets. All source and expected output blocks are checked against the pinned release, including a separate compiler execution job. These examples demonstrate numerical primitives, not a training system.

## Newly published alpha.2 statistics and training primitives

The [alpha.2 collections and numeric-learning tutorial](/tutorials/alpha2-collections-and-learning) provides four additional compiler-verified complete programs: immutable integer collections, stable score selection, numerically stable probabilities, and explicit loss gradients. The separate alpha.2 fixture suite checks them against the newer release; the existing alpha.1 numerical examples remain independently pinned. These primitives do not provide automatic differentiation or a full training loop.

## Scientific computing roadmap (unreleased)

Scarp is extending numerical work incrementally. The [scientific computing
proposal](/project/scientific-computing) distinguishes shipped vector/tile
operations from proposed integration, differentiation, tensor and AI work.
The sampled-calculus functions in compiler PR #153 are **not** in the published
alpha.3 compiler; do not treat them as runnable released APIs.

## Limits and errors

Indexing is bounds-checked. Invalid shapes, nonfinite results, and numerical payload-budget exhaustion produce diagnostics rather than silently returning invalid data. Each vector/tile element is a finite 64-bit float; some operations materialize new buffers and consume the cumulative vector-byte budget.

**Verified against:** [vector reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md), [tile reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md), [numerical fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.srp).
