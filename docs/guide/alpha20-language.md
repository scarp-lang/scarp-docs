# Exact decimals and persistent tuples

<!-- scarp-cli-release: v0.0.6-alpha.20 -->

This lesson targets the [published v0.0.6-alpha.20](/releases/v0.0.6-alpha.20), not compiler main. Install it from [official downloads](https://scarp-lang.github.io/downloads/). Use `scarp exec FILE.srp` for each standalone example.

## Exact decimal arithmetic

Scarp has distinct numeric types: bounded `integer`, arbitrary-precision `bigint`, binary64 `float`, and bounded base-ten `decimal`. To opt into exact decimal semantics, append lowercase `d` to a whole or fractional decimal literal. The compiler also accepts `decimal("0.1")`. Mixing decimal with integers or floats without explicit conversion is a type error.

~~~scarp
print(0.1d + 0.2d, 0.3d == 0.1d + 0.2d);
var x = 1.0d;
while x <= 5.0d { x += 0.1d; }
print(x);
print(0.1 + 0.2);
~~~

~~~text
0.3 true
5.1
0.30000000000000004
~~~

The expected output is asserted by the tagged [decimal literal integration tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/decimal_literals.rs). The loop demonstrates exact increments rather than a change to binary64 semantics.

### Decimal boundaries

- A decimal has at most 28 canonical coefficient digits and 18 fractional places.
- Exponent notation is not accepted for decimal literals. Fractional trailing zeros are canonicalized.
- Exact division fails if the result cannot be represented within the limits; use `decimal_div_rounded` with an explicit scale and rounding mode when rounding is intended.
- `decimal_from_integer` converts an integer exactly; `decimal_to_integer` requires an exact whole value in the integer range.
- `decimal_to_text` returns canonical decimal text.

See the [compiler decimal contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/decimal.md). Exact does not mean unlimited precision or automatic rounding.

## Tuple replacement and aliasing

A tuple is a fixed-arity ordered collection with a structural type. A mutable `var` permits replacement of a member at a constant index. The replacement must match the member type. Existing aliases retain their previous tuple values.

~~~scarp
var position = (10, 20);
bind old = position;
position[0] = 50;
position[1] = 100;
print(position);
print(old);
~~~

~~~text
(50, 100)
(10, 20)
~~~

Expected output follows the tagged [tuple update example](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_index_updates.srp) and [stdout fixture](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_index_updates.stdout). The `bind` alias is not mutated. This is persistent replacement, not arbitrary indexed mutation of all collections.

## Ordering compatible numeric tuples

Lexicographic comparison checks members from left to right and uses the first unequal pair to decide ordering. Compatible nested numeric tuples can be compared recursively; equality and ordering do not implicitly convert between numeric types. Singleton tuples require a trailing comma.

~~~scarp
print((10, 20) < (30, 40));
print((1, (2, 3)) < (1, (2, 4)));
print((0.0,) <= (-0.0,));
~~~

~~~text
true
true
true
~~~

See the [tagged ordering example](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_ordering.srp) and [tuple tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/tuples.rs). The comparison does not mean that every member is less than the corresponding member in the other tuple.

## Project workflow

New projects create a lowercase `scarp.project` manifest. Existing uppercase `Scarp.project` remains readable; prefer the lowercase filename for new projects. Use the following from a suitable parent directory and enter the new project before executing it.

~~~sh
scarp init demo
cd demo
scarp exec
~~~

The interpreter is still the standard way to run Scarp programs. Native ELF64 functions are an experimental Rust embedding feature, not a new `scarp compile` command. See the [current reference](/reference/current) for host/API boundaries.
