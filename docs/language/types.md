# Data types and values

Scarp is statically checked for the kinds of values implemented by its interpreter. Locally declared `bind`/`var` bindings infer their type; `funcra` parameter and result types are explicit.

| Kind | Examples | Current restrictions |
| --- | --- | --- |
| `integer` | `0`, `42`, `-7` | Checked signed 64-bit integers |
| `float` | `0.5`, `1e3`, `-0.0` | Finite IEEE-754 binary64 only; no NaN/infinity |
| `boolean` | `true`, `false` | No implicit conversion or truthy/falsy values |
| `string` | `"Scarp"`, `"line\nnext"` | UTF-8; five escapes; no indexing/concatenation |
| `vector` | `[1.0, 2.0]`, `[]` | Immutable finite floating-point elements |
| `tile` | `tile([1.0, 2.0], 1, 2)` | Immutable row-major two-axis finite values |
| `unit` | Returned from a unit function | No ordinary value literal |

## Integers and checked arithmetic

Integers range from `-9223372036854775808` to `9223372036854775807`. Overflow and division by zero are errors, not wraparound. Integer division truncates toward zero; `-7 / 2` is `-3`.

## Finite floating-point numbers

~~~scarp
bind fraction = 0.5;
var total = 1.0;
total += fraction;
print(total, 1 / 2, 1.0 / 2.0);
~~~

Expected output: `1.5 0 0.5` followed by a newline. `1` and `1.0` are **different types**. Scarp does not automatically convert integer expressions to floats. Floating-point rounding applies; `0.1 + 0.2` need not equal exactly `0.3`.

## Strings and booleans

Strings retain Unicode contents. An actual line break inside a string is invalid; use `\n`. Supported escapes are `\\`, `\"`, `\n`, `\t`, and `\r`. Boolean operators require booleans; `and`/`or` short-circuit at runtime.

## New in published alpha.2: integer collections and annotated bindings

Published [v0.0.5-alpha.2](/releases/v0.0.5-alpha.2) adds an immutable **`integers`** collection type, as distinct from the floating-point `vector`, plus optional checked type annotations on `bind` and `var` declarations. The [typed bindings and explicit numeric conversion lesson](/language/typed-bindings-alpha2) reproduces two complete tagged programs and shows why annotations do not perform casts. The [compiler-verified integer collections tutorial](/tutorials/alpha2-collections-and-learning) shows ranges, windows, replacement and explicit conversion to float vectors. The older alpha.1 table above does not include these newer capabilities.

## Collections are specialized

Scarp has numerical vectors and tiles, not a general-purpose list/map/set type system. Vector and tile values cannot be mutated by element assignment. See [numerical capabilities](/language/numerics) and [built-ins](/reference/library).

**Verified against:** [value reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/values.md), [float reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/floats.md).
