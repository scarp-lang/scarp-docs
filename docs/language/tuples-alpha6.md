# Immutable heterogeneous tuples — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

Tuples first ship in the published [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6). They are **not supported** in the earlier alpha.5 binary. The authoritative [tuple contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/tuples.md), [complete tagged example](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.srp), [module](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/modules/tuple_pairs.srp) and [exact output](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.stdout) are version-pinned.

## Create and access a tuple

A tuple is a fixed-size, ordered value with members of potentially different types. The following short example illustrates a structural annotation and an index that is a **literal**:

~~~scarp
bind pair: tuple<integer, string> = (7, "नमस्ते");
print(pair, pair[0], pair[1]);
print((42,), (42));
~~~

The order matters: `tuple<integer, string>` differs from `tuple<string, integer>`. `(42,)` is a one-element tuple; `(42)` is just a grouped integer. Nested tuples such as `(1, ("x", true))` are supported. `pair[0]` and `pair[1]` select stored members; a computed index like `pair[index]` is not allowed for tuples. This is a language feature, not Python tuple semantics.

## Immutability, equality and functions

- `bind` stores an immutable tuple. `var` allows replacing the **whole tuple** with exactly the same structural type, not changing an element.
- Tuples can be parameters, return values, defaults, nested values, recursive function inputs and imported public function interfaces.
- Equality is structural for equal types; comparison ordering and arithmetic on tuples are not provided.
- Nested string values are displayed with quotes and escaped special characters; an ordinary top-level string retains its normal display style.

This is an **illustrative** code fence; for exact output and a runnable imported-module example use the official [`tuples.srp`](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.srp) and [`tuples.stdout`](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.stdout) from the published tag.

## Bounds and exclusions

Tuple arity is **1–32**, nesting is at most **32**, and structural source-type shape is at most **4,096 nodes**. Default cumulative tuple payload is **8 MiB**, configurable with `--max-tuple-bytes`. Existing work, output and text quotas remain in effect.

Empty `()`, tuple destructuring, dynamic indices, element assignment, tuple iteration and tuple constants in module initializers are **not** included. The experimental native C11/ELF64 emitters reject tuples. Rust embedders should review `SourceType`, `Value::Tuple` and `ExecutionOptions.max_tuple_bytes`, plus module inventory schema 2 for tuple-bearing signatures; no stable ABI is promised.

Continue to [input](/language/program-input-alpha6), [text conversions](/language/text-foundations-alpha6) and the [combined official release example](/releases/v0.0.6-alpha.6). [हिन्दी पाठ](/hi/language/tuples-alpha6).
