# Operators and expressions

**Published alpha.2 extension:** [bitwise integers and typed declarations](/releases/v0.0.5-alpha.2) add binary/hex integer literals, bit operators and compound assignments. The [version-specific alpha.2 bitwise operators guide](/language/bitwise-operators-alpha2) now explains all operators, fixed-width shifts, and real tagged E0046/E0006 diagnostics in detail. The release guide retains the full, compiler-verified bit-field example. The precedence table below remains tied to the **alpha.1** expression grammar and deliberately omits these newer operators.

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
