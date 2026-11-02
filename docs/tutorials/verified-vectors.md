# Verified numerical vectors tutorial

This walkthrough is for the **Scarp v0.0.5-alpha.1** interpreter. Its source and expected output below are copied without changes from the released [vectors fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.srp). Both language editions are checked against the pinned compiler examples.

## 1. Create and inspect vectors

Create a UTF-8 file named `vectors.srp`. This is one **complete runnable program**, not a collection of independent snippets:

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(values, len(values), values[0]);
var weights = [0.2, 0.3, 0.5];
bind snapshot = weights;
weights = scale(weights, 2.0);
print(snapshot);
print(weights);
print(sum(values), mean(values));
print(dot(values, [2.0, -1.0, 0.5, 2.0]));
print(mse([1.0, 2.0], [1.0, 4.0]));
print(clamp([-2.0, 0.5, 3.0], 0.0, 1.0));
print(fill(1.5, 3));
~~~

Run the program from the folder containing your file:

~~~sh
scarp check vectors.srp
scarp run vectors.srp
~~~

The expected stdout of `run` is exactly:

~~~text
[1.0, 2.0, 3.0, 4.0] 4 1.0
[0.2, 0.3, 0.5]
[0.4, 0.6, 1.0]
10.0 2.5
9.5
2.0
[0.0, 0.5, 1.0]
[1.5, 1.5, 1.5]
~~~

The output matches the compiler's [published stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.stdout).

## 2. Read the operations

- `[1.0, 2.0, 3.0, 4.0]` is a numerical vector; `len(values)` reports its length and `values[0]` selects its first element.
- `bind snapshot = weights` keeps the earlier value, while reassignment through `var weights` stores the result of `scale(weights, 2.0)`. The earlier snapshot remains unchanged.
- `sum` adds elements; `mean` computes their average. `dot` combines matching vector positions; `mse` computes mean squared error for two equal-length vectors.
- `clamp` bounds each element between `0.0` and `1.0`, while `fill(1.5, 3)` constructs three identical entries.

## 3. Experiment without confusing verified results

Change the values in your own copy and repeat `scarp check vectors.srp` before `scarp run vectors.srp`. Your modified program **will not** necessarily have the same output as the fixture above. Scarp checks vector dimensions, and invalid numeric operations can produce diagnostics. Review [numeric types and vectors](/language/numerics), [diagnostics](/reference/diagnostics), and [runtime budgets](/reference/budgets).

## 4. Continue with modules and tiles

The [source modules walkthrough](/tutorials/modules-walkthrough) combines a `tile` matrix and a vector through `matvec`; its complete file contents and output are also checked against the published compiler. Use the [verified functions tutorial](/tutorials/verified-functions) if function calls are new to you.

::: warning Prerelease compatibility
This is a demonstration of the pinned v0.0.5-alpha.1 interpreter, not evidence that these operations are available in older or future releases. Refer to [feature status](/reference/status).
:::
