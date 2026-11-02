# Repeat and while loops: verified examples

**Scarp v0.0.5-alpha.1 (experimental)** supports two different loops: `repeat` executes a saved integer count, while `while` checks a boolean condition before each iteration. These examples reproduce complete compiler-owned fixtures and expected stdout, not hypothetical syntax.

## 1. Counted iteration with `repeat`

Save this entire program as `repeat.srp`:

~~~scarp
// The count is saved once; changing count does not shorten this loop.
var count = 5;
var total = 0;
repeat count as index {
    count = 0;
    if index == 2 { continue; }
    total += index;
}
print(total);
print(count);
~~~

Run `scarp check repeat.srp` first, followed by `scarp run repeat.srp`. Expected stdout:

~~~text
8
0
~~~

The compiler captures `count` **once**, before the loop. Inside the body, `count = 0` changes the variable but does **not** shorten the already scheduled five iterations (indices 0–4). The `continue;` at index 2 skips that addition. Therefore `0 + 1 + 3 + 4 = 8`, and the final `count` is `0`.

The loop index declared by `as index` is immutable and local to the loop. A repeat count of zero runs the body zero times; a negative count produces error **E0019**. The body must still be well-typed.

**Compiler evidence:** [repeat.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.srp) and [repeat.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.stdout).

## 2. Condition-based iteration with `while`

Create `loops.srp` using this second complete fixture:

~~~scarp
// Iteration with nearest-loop control and checked accumulator arithmetic.
var index = 0;
var total = 0;
while index < 10 {
    index += 1;
    if index == 3 { continue; }
    if index > 5 { break; }
    total += index;
}
print(total);
~~~

Run `scarp check loops.srp` followed by `scarp run loops.srp`. Expected stdout:

~~~text
12
~~~

`index` counts upward from zero. `continue;` skips index 3, while `break;` exits the loop when the index exceeds 5. Thus the accumulator receives 1, 2, 4 and 5: **12**.

A `while` guard must have boolean type; unlike some languages, integers are not automatically truthy. Both `break;` and `continue;` affect the nearest enclosing loop and require their semicolons.

**Compiler evidence:** [loops.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.srp) and [loops.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.stdout).

## 3. Use bounded execution

If you are working from a checkout of the Scarp compiler, its `examples/` directory already contains both programs:

~~~sh
scarp check --max-steps 2000000 examples/repeat.srp
scarp run --max-steps 2000000 examples/loops.srp
~~~

`check` evaluates the selected execution path while discarding output; a work budget protects the interpreter from excessive execution. This is **not** a proof that every possible path terminates or a wall-clock deadline. See [runtime budgets](/reference/budgets), [error diagnostics](/reference/diagnostics), and the [verified functions tutorial](/tutorials/verified-functions).

The full source and output pairs on this page are mirrored in the [documentation conformance fixtures](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs) and must pass the bilingual TypeScript tutorial-evidence check before deployment.

::: warning Release scope
These examples describe the published v0.0.5-alpha.1 interpreter, not features assumed for other releases. Read the [feature status](/reference/status) before relying on a newer syntax.
:::
