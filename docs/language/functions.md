# Functions with `funcra`

Typed user-defined functions are implemented in Scarp v0.0.5-alpha.1. The keyword is **`funcra`**, not `fn`, `func`, or `function`. Parameters and result types are mandatory. Local bindings still infer types.

## Declaration and calls

~~~scarp
funcra square(value: integer) -> integer {
    return value * value;
}
bind answer = square(6);
print(answer); // 36
~~~

Non-unit functions must return the declared kind along every path. A `unit` function may use bare `return;` or fall through; a unit result is not usable as an expression value. Forward calls, recursion, and mutual recursion within a file are supported.

## Optional and named arguments

~~~scarp
funcra endpoint(start: integer, length: integer = 5) -> integer {
    return start + length;
}
print(endpoint(7), endpoint(length: 2, start: 10));
~~~

Output is `12 12` with a newline. Required parameters precede optional ones; named arguments can be provided in any order after positional arguments. Defaults evaluate for omitted arguments and may refer to earlier parameters.

## Purity and contracts

~~~scarp
pure funcra clipped(x: integer, lo: integer = 0, hi: integer = 10) -> integer
    needs lo <= hi;
    ensures result >= lo and result <= hi;
{
    if x < lo { return lo; }
    if x > hi { return hi; }
    return x;
}
print(clipped(x: 15)); // 10
~~~

`pure` is checked: a pure function cannot produce output or call impure user functions. `needs` clauses are runtime preconditions; `ensures` clauses are runtime postconditions. They are **executable checks, not formal proofs**. A postcondition can reference `result` for non-unit functions.

## Call limits and restrictions

The interpreter uses heap call frames, not unbounded host-stack recursion. Depth and cumulative call counts have configurable limits. No overloads, generics, closures, variadic user functions, or implicit access to top-level script locals are implemented. See [budgets](/reference/budgets) and [source modules](/language/modules).

**Verified against:** [functions reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/functions.md), [tested functions fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.srp), [contract fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/function_contracts.srp).
