# Verified tiles and matrix inference

**Release:** Scarp **v0.0.5-alpha.1** (experimental interpreter). This lesson reproduces the entire published [matrix-forward fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.srp) and its tested output. It does not claim general-purpose tensors, mutable cells, or native GPU acceleration.

## 1. Prepare the source file

Create `matrix_forward.srp` and paste this **complete** source:

~~~scarp
pure funcra forward(weights: tile, features: vector, bias: vector) -> vector
    needs width(weights) == len(features);
    needs height(weights) == len(bias);
    ensures len(result) == height(weights);
{
    return softmax(add(matvec(weights, features), bias));
}
bind identity = tile([1.0, 0.0, 0.0, 1.0], 2, 2);
bind weights = tileadd(identity, tilescale(identity, 1.0));
print(forward(weights, [1.0, 1.0], [0.0, 0.0]));
~~~

Run from the directory containing that file:

~~~sh
scarp check matrix_forward.srp
scarp run matrix_forward.srp
~~~

The expected stdout is:

~~~text
[0.5, 0.5]
~~~

The documentation CI copies the [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.srp) and [expected output](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.stdout) from a pinned compiler release and executes them with the real interpreter. This page, and the Hindi page, are separately checked for source/output drift.

## 2. Understand tiles and dimensions

A `tile` is a two-axis immutable numerical value with a **row-major** element sequence. `tile(values, rows, columns)` needs a vector with exactly `rows * columns` elements. `height(tile)` and `width(tile)` inspect the axes. Indices start at zero, and elements must be finite `float` values.

The example creates a **2 × 2 identity tile**. `tilescale` scales all cells; `tileadd` adds two tiles with the same shape. In this example, the resulting tile is twice the identity matrix. `matvec` combines a tile and a vector whose length equals the tile's width.

## 3. Read the typed forward function

- `pure funcra forward(...)` declares a typed function restricted by Scarp's purity rules.
- `needs width(weights) == len(features)` and `needs height(weights) == len(bias)` check dimensions before entering the function body.
- `matvec` produces a vector; `add` incorporates the bias; `softmax` turns the two equal results into the displayed `[0.5, 0.5]`.
- `ensures len(result) == height(weights)` checks the postcondition at runtime. Contracts are executable guards, **not** formal proofs.

## 4. Avoid common errors

| Situation | Diagnostic | Fix |
| --- | --- | --- |
| Matrix dimensions or input lengths disagree | `E0032` | Check `width`, `height` and `len` |
| Reading a cell outside valid row/column bounds | `E0033` | Use zero-based indices within each axis |
| Numerical work budget exhausted | `E0017` | Reduce operations; inspect budget settings |
| Fresh numerical buffer allocation exceeds the quota | `E0036` | Reduce new buffers or deliberately adjust `--max-vector-bytes` |

Scarp tiles are immutable. The published API includes `tile`, `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd` and `tilescale`. It has no arbitrary-rank tensors, automatic broadcasting or `tile[row][column]` syntax. Read the [numerics reference](/language/numerics), [diagnostic troubleshooting](/reference/diagnostics) and [runtime budgets](/reference/budgets).

**Upstream reference:** [published tiles contract](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md). Continue with [verified vectors](/tutorials/verified-vectors) and [modules](/tutorials/modules-walkthrough).

::: warning Version-specific behavior
This lesson reflects the pinned experimental compiler release, not an unshipped language proposal. Always check `scarp --version` before copying examples.
:::
