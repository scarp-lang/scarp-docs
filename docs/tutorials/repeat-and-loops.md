# Repeat and while loops

Scarp **v0.0.5-alpha.1 (experimental)** has two looping constructs. `while` repeats while a boolean condition is true; `repeat` runs a body a saved number of times. Neither is an iterable `for` loop.

## Counted iteration with `repeat`

```scarp
var total = 0;
repeat 5 as index {
    total += index;
}
print(total); // 10
```

The `repeat` count is an integer evaluated **once** before the loop. The index is immutable, starts at zero and ends at count minus one. A count of zero executes no iterations; a negative count produces **E0019**. The count and body must still be well-typed even if the count is zero.

In this real [compiler test fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.srp), modifying `count` inside the loop does not change the initial count:

```scarp
var count = 5;
var total = 0;
repeat count as index {
    count = 0;
    if index == 2 { continue; }
    total += index;
}
print(total);
print(count);
```

Expected stdout:

```text
8
0
```

The same source and exact expected output are mirrored in the [local conformance suite](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs).

## Condition-based iteration with `while`

```scarp
var index = 0;
var total = 0;
while index < 10 {
    index += 1;
    if index == 3 { continue; }
    if index > 5 { break; }
    total += index;
}
print(total); // 12
```

A `while` guard **must** evaluate to a boolean; Scarp has no implicit truthiness. `break;` exits the nearest enclosing loop; `continue;` moves to its next iteration, which reevaluates `while` or advances the `repeat` counter. Both require semicolons.

## Validate bounded execution

The interpreter limits execution work, including loops and selected calls. For example:

```sh
scarp check --max-steps 2000000 examples/repeat.srp
scarp run --max-steps 2000000 examples/loops.srp
```

`check` evaluates the selected path but discards output. It can detect reachable runtime errors, and it stops work that exhausts a budget. It is not a proof that every possible path terminates, nor a wall-clock timeout.

**Compiler evidence:** [iteration reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/iteration.md), [repeat fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.srp), [while fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.srp).
