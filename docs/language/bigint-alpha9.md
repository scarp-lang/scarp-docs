# Exact signed BigInt integers (v0.0.6-alpha.9)

<!-- scarp-cli-release: v0.0.6-alpha.9 -->

**Published in [Scarp v0.0.6-alpha.9](/releases/v0.0.6-alpha.9).** Unlike `integer` (signed i64), `bigint` stores exact signed decimal integers with explicit resource limits. This is interpreter-backed, not a general-purpose native code generator.

## Build and print an exact value

The following complete example is copied from the [tagged compiler source](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_arithmetic.srp):

~~~scarp
// Development BigInt milestone; unavailable in published alpha.4.
bind a: bigint = bigint("999999999999999999999999999999");
bind one = bigint_from_integer(1);
print(a + one);
print(a * bigint("123456789"));
print(-a / bigint("1000000000000000000"));
print(-a % bigint("1000000000000000000"));
print(a > one, bigint_abs(-a) == a, bigint_to_integer(one));
~~~

Expected standard output, copied from the exact [tagged fixture](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_arithmetic.stdout):

~~~text
1000000000000000000000000000000
123456788999999999999999999999876543211
-999999999999
-999999999999999999
true true 1
~~~

## Constructors, conversions and operators

| Expression | Meaning |
| --- | --- |
| `bigint("123")` | Parse a signed ASCII decimal string, with no spaces or underscores |
| `bigint_from_integer(42)` | Convert an i64 exactly |
| `bigint_to_integer(value)` | Convert back only if the result fits signed i64 |
| `bigint_abs(value)` | Absolute value |
| `a + b`, `a - b`, `a * b`, `a / b`, `a % b` | Exact signed arithmetic on two BigInt operands |

Comparison, negation, typed declarations, functions, modules, loops and tuples also support BigInt. Division truncates toward zero and the remainder has the dividend's sign. A BigInt is not silently converted to `integer` or `float`, and a large numeric literal is **not** an automatic BigInt.

## Budgets and limitations

Default maximum: **10,000 decimal digits** and **8,388,608 cumulative limb bytes**, subject to execution-work and output limits. Configurable maximum digit ceiling: **1,000,000**, which is not a performance guarantee. Read the [upstream resource and error contract](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/docs/bigint.md). BigInt bitwise operators, floating conversions, fixed-size arrays and a native executable `scarp compile` command are not provided in this release.

## More verified examples

The same tag also contains [Fibonacci and factorial source](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_sequences.srp) with its [expected stdout](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_sequences.stdout). The [compiler prerelease page](/releases/v0.0.6-alpha.9) provides official packages and checksum links.
