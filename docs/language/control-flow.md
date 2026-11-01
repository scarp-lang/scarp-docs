# Control flow

Scarp v0.0.5-alpha.1 supports `if`/`elif`/`else`, `while`, and counted `repeat` loops. All conditions are **explicit booleans**. Scope rules apply inside branches and loops.

## Branching

~~~scarp
bind score = 82;
if score >= 90 {
    print("excellent");
} elif score >= 60 {
    print("passed");
} else {
    print("retry");
}
~~~

The first true branch executes. All branches are statically checked for syntax, names and types, including unselected branches; only selected branches execute arithmetic and produce output.

## While loops

~~~scarp
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

The example comes from the compiler's tested `examples/loops.srp`. `break` and `continue` apply to the nearest enclosing loop. Execution is bounded by the work-step budget; an unbounded loop is an error when the limit is exhausted.

## Counted loops

Scarp additionally provides `repeat` with a finite integer count, a loop variable, and explicit scope semantics. Follow the [walkthrough](/tutorials/repeat-and-loops) or use the official [iteration reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/iteration.md) and [tested repeat fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.srp) for the exact count/iteration contract.

## Budget-aware execution

The default work budget is one million logical steps. Change it explicitly using `scarp run --max-steps N file.srp` or use `scarp check` with the same option. See [runtime budgets](/reference/budgets).

**Verified against:** [iteration reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/iteration.md), [loop fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.srp).
