# Lexicographic numeric tuple ordering — compiler development preview

> **Development-only feature.** This page describes the Scarp compiler on `main` starting at commit [`fde0e374b445fb573dfd980bde36f83e9d76e729`](https://github.com/scarp-lang/scarp/commit/fde0e374b445fb573dfd980bde36f83e9d76e729). The separately published **v0.0.6-alpha.19 does not support tuple ordering**. Do not run these samples against an alpha.19 download. This is not a promise that the next release has been approved.

## Basic semantics

In the development interpreter, `<`, `<=`, `>`, and `>=` compare tuples **lexicographically**: compare the first pair of members; if they are equal, compare the second pair, and so on. The first difference decides the result. When all members are equal, `<=` and `>=` are true, while `<` and `>` are false.

~~~scarp
print((10, 20) < (30, 40));       // true
print((10, 20) < (10, 20));       // false
print((10, 20) >= (10, 20));      // true
print((1, (2, 3)) < (1, (2, 4))); // true
~~~

The two tuple operands must have **identical structural types** and every leaf member must be an ordered numeric type: `integer`, `float`, `bigint`, or `decimal`. Nested tuples of those types are supported. There are no implicit numeric conversions.

## Rejected comparisons

~~~scarp
print(("a",) < ("b",));          // invalid: string members are unordered
print((true,) > (false,));      // invalid: boolean members are unordered
print((1,) < (1.0,));           // invalid: different structural types
print((1, 2) >= (1,));          // invalid: different tuple arity
~~~

These forms are rejected at static verification, even if a runtime comparison could have stopped at an earlier member. Tuple equality (`==`, `!=`) still supports existing compatible nonnumeric types; ordering does not change equality or permit tuple arithmetic.

## Nested tuples, signed zero and work limits

Nested numeric tuples use the same rule recursively. Finite floating-point `-0.0` and `0.0` compare equal, matching existing Scarp scalar semantics. Comparison uses the interpreter's existing conservative composite-work charge, so an early mismatch does not bypass resource limits. The restricted C11 and ELF64 scalar backends still reject tuple operations.

## Verified source and expected output

The compiler repository contains a [runnable Scarp program](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/examples/tuple_ordering.srp), its [exact stdout fixture](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/examples/tuple_ordering.stdout), and [Rust regression tests](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/tests/tuples.rs). The feature was merged with passing Linux, Windows, macOS, minimum-Rust and package checks in [PR #353](https://github.com/scarp-lang/scarp/pull/353).

To test this **development source**, check out the linked commit of the compiler repository and run:

~~~sh
cargo run --locked -- exec examples/tuple_ordering.srp
~~~

Expected output:

~~~text
true
false
true
true
~~~

**Released compiler users:** use [official downloads](https://scarp-lang.github.io/downloads/) and the [current published reference](/reference/current); do not confuse a development preview with a released feature.

[हिन्दी में पढ़ें](/hi/language/tuple-ordering-development).
