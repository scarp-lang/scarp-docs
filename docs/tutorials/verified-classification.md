# Verified matrix classification and probabilities

**Compiler baseline: Scarp v0.0.5-alpha.1.** These three complete programs and their stdout are mirrored from the tagged compiler's `examples/` directory. The documentation checker verifies their order and exact visible content in **both English and Hindi**; CI executes each with the pinned Rust interpreter and compares its stdout byte-for-byte.

Numerical `tile` and `vector` are specialized, immutable, finite-float types. These examples illustrate numerical operations, **not** a general AI model training framework or GPU backend. Start with [verified vectors](/tutorials/verified-vectors) and [tile inference](/tutorials/verified-tiles) if the types are new.

## 1. Class scores and tie-breaking

Create `matrix_classification.srp` with this full source:

~~~scarp
bind weights = tile([1.0, 0.0, 0.0, 2.0, -1.0, 1.0], 3, 2);
bind scores = matvec(weights, [2.0, 1.0]);
// Equal best scores choose the first class.
print(scores, argmax(scores), maxval(scores));
~~~

Expected stdout:

~~~text
[2.0, 2.0, -1.0] 0 2.0
~~~

A three-row, two-column tile maps two input features into three scores. The top two scores are tied at `2.0`, and the fixture confirms `argmax` selects index `0` rather than index `1`; `maxval` returns the best score.

You can validate the original file with `scarp check matrix_classification.srp` and run it with `scarp run matrix_classification.srp`.

**Pinned compiler source:** [matrix_classification.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_classification.srp) and [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_classification.stdout).

## 2. Probabilities and cross-entropy

Create `matrix_probabilities.srp` with this full source:

~~~scarp
bind weights = tile([1.0, 0.0, 0.0, 1.0], 2, 2);
bind scores = matvec(weights, [0.0, 0.0]);
print(softmax(scores));
bind loss = crossentropy(scores, 1);
print(loss > 0.6931 and loss < 0.6932);
~~~

Expected stdout:

~~~text
[0.5, 0.5]
true
~~~

A two-by-two identity tile applied to a zero vector produces equal scores. `softmax` therefore prints `[0.5, 0.5]`. `crossentropy(scores, 1)` produces a positive loss close to `0.6931`; this particular fixture checks the range rather than printing a platform-dependent decimal.

You can validate the original file with `scarp check matrix_probabilities.srp` and run it with `scarp run matrix_probabilities.srp`.

**Pinned compiler source:** [matrix_probabilities.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_probabilities.srp) and [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_probabilities.stdout).

## 3. Turn a selected class into a one-hot target

Create `matrix_targets.srp` with this full source:

~~~scarp
bind scores = matvec(tile([1.0, 0.0, 0.0, 2.0, -1.0, 1.0], 3, 2), [2.0, 1.0]);
print(onehot(len(scores), argmax(scores)));
~~~

Expected stdout:

~~~text
[1.0, 0.0, 0.0]
~~~

`len(scores)` specifies the number of classes, while `argmax(scores)` selects the predicted class. `onehot` constructs a vector containing `1.0` at that position and `0.0` at the others. This example uses the same three-score geometry as the first example.

You can validate the original file with `scarp check matrix_targets.srp` and run it with `scarp run matrix_targets.srp`.

**Pinned compiler source:** [matrix_targets.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_targets.srp) and [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_targets.stdout).

## What to watch for

- **Shapes:** `matvec(weights, features)` requires a tile width equal to the vector length. Incorrect shapes produce a diagnostic, not automatic broadcasting.
- **Domains:** the `softmax` and `crossentropy` kernels have input rules, checked numerical behavior and runtime limits. See [built-ins](/reference/library) and [numerical diagnostics](/reference/diagnostics).
- **Class indices:** `argmax` selects the **first** maximal element for a tie in this published example. Do not confuse the position of the class with the value of its score.
- **Output:** the results above are compiler-owned fixtures, not guesses. Altered inputs can produce different scores or errors.

See [runtime budgets](/reference/budgets), [modules tutorial](/tutorials/modules-walkthrough), and [feature status](/reference/status) for release boundaries.

::: warning Experimental prerelease
Scarp `v0.0.5-alpha.1` does not promise stable language compatibility. Avoid copying these examples into older versions without checking available features.
:::
