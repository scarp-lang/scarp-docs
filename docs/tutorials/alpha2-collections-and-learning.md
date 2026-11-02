# Verified alpha.2 collections, scores and learning primitives

**Compiler baseline: v0.0.5-alpha.2, published November 2, 2026.** Four complete examples below are mirrored from the tagged source and expected-output files. A TypeScript evidence check compares their original content in both languages. An independent GitHub Actions job executes the programs with the exact published Rust interpreter.

This tutorial complements the [alpha.2 release guide](/releases/v0.0.5-alpha.2) for bit operations, typed variables, explicit conversions, Unicode, and activation kernels. The older [alpha.1 reference](/reference/status) is still separately pinned, and must not be used to claim that new alpha.2 features shipped earlier.

## 1. Immutable integer collections

Complete published source:

~~~scarp
bind values: integers = ints_range(1, 5, 1);
bind window = ints_window(values, 1, 3);
bind changed = ints_set(values, 0, 9);
var total: integer = 0;
repeat ints_len(window) as index {
    total += window[index];
}
print(values, changed, window, total);
print(ints_to_vector(window), ints_join([integer: 6], [integer: 7]));
~~~

Expected stdout from the tagged compiler:

~~~text
[integer: 1, 2, 3, 4, 5] [integer: 9, 2, 3, 4, 5] [integer: 2, 3, 4] 9
[2.0, 3.0, 4.0] [integer: 6, 7]
~~~

The integer range contains five numbers. Windowing and indexed replacement return new immutable collections; the original value stays unchanged. Explicit ints_to_vector converts integers into finite floating-point vector values.

Evidence: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.stdout).

## 2. Stable score selection

Complete published source:

~~~scarp
// A stable, first-match score winner.
bind scores = [1.0, 3.0, 3.0];
print(argmax(scores), maxval(scores));
print(argmin(scores), minval(scores));
~~~

Expected stdout from the tagged compiler:

~~~text
1 3.0
0 1.0
~~~

argmax chooses the first equal maximal score and argmin chooses the first minimal score. maxval and minval return the values rather than positions. This property is important for deterministic results.

Evidence: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.stdout).

## 3. Numerically stable probabilities

Complete published source:

~~~scarp
pure funcra normalize_weights(values: vector) -> vector
    needs len(values) > 0;
    needs values == clamp(values, 0.0, 1e308);
    needs sum(values) > 0.0;
    ensures sum(result) > 0.999999999999 and sum(result) < 1.000000000001;
{
    return scale(values, 1.0 / sum(values));
}

print(normalize_weights([2.0, 3.0, 5.0]));
print(softmax([1000.0, 1000.0, 1000.0, 1000.0]));
print(softmax([-1e308, 1e308]));
bind probabilities = softmax([1.0, 2.0, 3.0]);
print(sum(probabilities) > 0.999999999999 and sum(probabilities) < 1.000000000001);
print(probabilities[0] < probabilities[1] and probabilities[1] < probabilities[2]);
~~~

Expected stdout from the tagged compiler:

~~~text
[0.2, 0.30000000000000004, 0.5]
[0.25, 0.25, 0.25, 0.25]
[0.0, 1.0]
true
true
~~~

The function has needs preconditions and an ensures postcondition. Its 0.30000000000000004 output is an ordinary binary64 rounding effect; softmax handles equal large scores and extremes without claiming arbitrary precision.

Evidence: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.stdout).

## 4. Explicit loss gradients are not automatic training

Complete published source:

~~~scarp
// One-hot target construction and explicit categorical-loss gradient.
// No automatic differentiation or training loop is implied.
bind logits = [0.0, 0.0];
bind class_id = 1;
print(onehot(3, class_id));
print(lossgrad(logits, class_id));
print(crossentropy([3.0], 0));
~~~

Expected stdout from the tagged compiler:

~~~text
[0.0, 1.0, 0.0]
[0.5, -0.5]
0.0
~~~

onehot, lossgrad and crossentropy are numerical primitives. A returned gradient value does not imply automatic differentiation, backpropagation, model weight updates or a built-in training loop.

Evidence: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.stdout).


## Try it on a published compiler

Use alpha.2 and run the same source filename:

~~~sh
scarp check integer_collections.srp
scarp run integer_collections.srp
~~~

A successful check is silent. The run output above is exact in the source fixtures; CI additionally verifies trailing newlines byte-for-byte.

## Important boundaries

Immutable integer collections do not implement a general Python list API. Vector outputs must be finite and work within type and resource budgets. Classification helpers do not make Scarp a complete training framework. These programs are specific to the experimental prerelease.

See [alpha.2 CLI inspection](/tooling/alpha2-inspection), [library status](/reference/library), [runtime budgets](/reference/budgets), and [release evidence](/reference/evidence).
