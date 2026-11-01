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

## Limits and errors

Indexing is bounds-checked. Invalid shapes, nonfinite results, and numerical payload-budget exhaustion produce diagnostics rather than silently returning invalid data. Each vector/tile element is a finite 64-bit float; some operations materialize new buffers and consume the cumulative vector-byte budget.

**Verified against:** [vector reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md), [tile reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md), [numerical fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.srp).
