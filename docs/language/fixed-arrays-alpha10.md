# Immutable fixed arrays and BigInt — alpha.10

<!-- scarp-cli-release: v0.0.6-alpha.10 -->
<!-- scarp-current-source: 44fcd0f77ccb92648cdb1fc7632495c506c87cb3 -->

[v0.0.6-alpha.10](/releases/v0.0.6-alpha.10) · [Array contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/fixed-arrays.md) · [BigInt contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/bigint.md).

## Exact syntax

`array<integer, 2>` stores two homogeneous values. `[array: 10, 20]` is nonempty; `[array: <integer>]` is typed empty. `values[index]` checks bounds; indexed assignment is not supported.

## Tagged example

[fixed_arrays.srp](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/fixed_arrays.srp)

[fixed_arrays.stdout](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/fixed_arrays.stdout)

~~~scarp
pure funcra labels(values: array<string, 2> = [array: "नमस्ते", "Scarp"])
    -> array<string, 2> ensures result == values; {
    return values;
}

var index = 1;
bind grid = [array: [array: 1, 2], [array: 3, 4]];
bind empty = [array: <array<integer, 2>>];
print(labels()[index], grid[index][0], empty);
print(labels(), grid[0] == [array: 1, 2]);
~~~

~~~text
Scarp 3 [array: <array<integer, 2>>]
[array: "नमस्ते", "Scarp"] true
~~~

~~~sh
scarp verify examples/fixed_arrays.srp
scarp exec examples/fixed_arrays.srp
~~~

## Resource limits

| Constraint | Ceiling |

| --- | --- |

| Array length | 4,096 |

| Array/tuple nesting | 32 |

| Expanded shape | 65,536 nodes |

| Array storage | 8 MiB default |

`E0062` reports array shape/length, `E0063` index bounds and `E0064` allocation errors.

## Expanded BigInt

Alpha.10 adds exact powers, gcd/lcm, integer square roots, bit length, radix conversion 2–36, signed bitwise and shifts, modular exponentiation, and `bigint_divmod`. Budgets apply and modular exponentiation is variable-time.

Module inventories with array types use schema 3. General native compilation remains unavailable.
