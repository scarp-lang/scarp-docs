# Published numerical kernels — Scarp v0.0.6-alpha.3 and alpha.4

> **Release scope:** This guide covers the published experimental compiler [v0.0.6-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4), built from exact commit `f04be0758cbce405ddcdb229699b0ff83c09d207`. It does **not** describe unreleased features on compiler `main` as shipped.

Scarp has bounded, pure numerical primitives on immutable finite-float vectors. They execute through the experimental interpreter and do **not** constitute a tensor framework, a GPU backend, stochastic sampling, a native executable compiler, or a trained AI model.

## Availability

| Built-in | First published prerelease | Meaning |
| --- | --- | --- |
| `softmax_temp(vector, float) -> vector` | `v0.0.6-alpha.3` | Temperature-scaled score probabilities |
| `logsoftmax_temp(vector, float) -> vector` | `v0.0.6-alpha.3` | Log probabilities with temperature |
| `topk(vector, integer) -> integers` | `v0.0.6-alpha.3` | Deterministically ranked original zero-based indices |
| `cosine_similarity(vector, vector) -> float` | `v0.0.6-alpha.4` | Vector-direction similarity in the range [-1, 1] |
| `sample_area(vector, vector) -> float` | `v0.0.6-alpha.4` | Composite-trapezoid area for increasing x coordinates |
| `sample_cumulative_area(vector, vector) -> vector` | `v0.0.6-alpha.4` | Cumulative area after each sample |
| `sample_slopes(vector, vector) -> vector` | `v0.0.6-alpha.4` | Secant slopes between adjacent samples |

## 1. Temperature and ranking

~~~scarp
print(softmax_temp([2.0, 2.0], 0.5));
print(logsoftmax_temp([5.0], 2.0));
bind logits = [1.0, 4.0, 4.0, 2.0];
print(topk(softmax_temp(logits, 0.5), 3));
~~~

Expected output:

~~~text
[0.5, 0.5]
[0.0]
[integer: 1, 2, 3]
~~~

Temperature must be finite and strictly positive. `topk` chooses indices deterministically; it does not draw random samples. [Run lesson 12](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/12-temperature-softmax.srp) once the linked course PR is merged.

## 2. Cosine similarity

~~~scarp
bind direction = [3.0, 4.0];
print(cosine_similarity(direction, [6.0, 8.0]));
print(cosine_similarity([1.0, 0.0], [0.0, 1.0]));
print(cosine_similarity([3.0], [-4.0]));
~~~

Expected output:

~~~text
1.0
0.0
-1.0
~~~

Operands require equal nonzero lengths and nonzero finite vectors. Similarity is not a metric search index or a trained embedding model. [Lesson 13](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/13-cosine-similarity.srp) and its `.stdout` preserve the published compiler fixture.

## 3. Cumulative area of sampled measurements

~~~scarp
bind time = [0.0, 1.0, 3.0, 4.0];
bind speed = [0.0, 2.0, 6.0, 8.0];
print(sample_cumulative_area(time, speed));
print(sample_area(time, speed));
~~~

Expected output:

~~~text
[0.0, 1.0, 9.0, 16.0]
16.0
~~~

These functions require equally sized finite vectors with at least two observations and **strictly increasing** coordinate samples. This is sampled numerical integration, not symbolic calculus. [Lesson 14](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/14-sample-cumulative-area.srp) provides the unchanged tagged source.

## Source of truth and safe migration

- **Public reference:** This documentation repository owns learner-facing API descriptions and version-aware usage.
- **Runnable course:** [scarp-by-example](https://github.com/scarp-lang/scarp-by-example) owns numbered lessons, Hindi exercises and their exact expected output files.
- **Compiler checks:** [scarp](https://github.com/scarp-lang/scarp/tree/f04be0758cbce405ddcdb229699b0ff83c09d207/examples) retains the original fixtures and Rust regression suites. Those files must not be removed by a documentation migration.
- **Unreleased candidate:** `pearson_correlation` and nucleus/top-p ranking under `v0.0.6-alpha.5` development are **not** part of the published alpha.4 release; do not advertise them as available in alpha.4 binaries.

Use the [version compatibility reference](/reference/compatibility) when running a different compiler tag, and the [scientific-computing roadmap](/project/scientific-computing) for proposals rather than shipped functions.
