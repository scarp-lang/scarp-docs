# Operators and expressions

Scarp's operator rules in v0.0.5-alpha.1 are checked at runtime and during validation. Operands must have compatible kinds, and there are **no implicit numeric conversions**.

| Precedence (high to low) | Syntax | Behavior |
| --- | --- | --- |
| Grouping and index | `(x)`, `values[0]` | Group or read a checked vector index |
| Unary | `-x` | Checked integer negation / float sign change |
| Multiply/divide | `*`, `/` | Same-kind numeric operations |
| Add/subtract | `+`, `-` | Same-kind numeric operations |
| Compare | `==`, `!=`, `<`, `<=`, `>`, `>=` | Equality same-kind; order numeric |
| Negate boolean | `not` | Boolean negation |
| Boolean AND | `and` | Short-circuit false |
| Boolean OR | `or` | Short-circuit true |

~~~scarp
print(1 + 2 * 3);       // 7
print((1 + 2) * 3);     // 9
print(-7 / 2);          // -3
print(true or false);   // true
~~~

Chained comparisons such as `1 < x < 10` are rejected. Use `1 < x and x < 10`. `and` and `or` short-circuit the unselected operand at runtime, but source name/type checking still covers both operands.

## Assignment is a statement

~~~scarp
var x = 2;
x += x + 1;
print(x); // 5
~~~

Assignment does not return a value. The target must have been declared with `var`, and its type cannot change. Integer overflow, division by zero, and nonfinite float results report diagnostics and prevent buffered program output.

**Verified against:** [operator reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/values.md), [compiler tests](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/tests).
