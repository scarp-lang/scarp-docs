# Scarp alpha.16: statistics, Unicode and integer utilities

<!-- scarp-cli-release: v0.0.6-alpha.16 -->
<!-- scarp-current-source: 244f713b4fa48f02a98b8e3e3c11025363f35260 -->

This guide describes the [published alpha.16](/releases/v0.0.6-alpha.16). Historical examples remain pinned to their own releases.

## Median and quantiles

`median(values)` returns the middle value, averaging the two middle values for even lengths. `quantile(values, fraction)` uses type-7 linear interpolation for fractions between 0 and 1.

~~~scarp
// Median and type-7 quantiles use a bounded, immutable sorted copy.
bind samples = [4.0, 1.0, 7.0, 2.0];
print(median(samples));
print(quantile(samples, 0.25));
print(quantile(samples, 0.75));
bind visible = window(samples, 1, 3);
print(median(visible));
print(samples);
~~~

~~~text
3.0
1.75
4.75
2.0
[4.0, 1.0, 7.0, 2.0]
~~~

The source vector is never modified. Empty vectors or fractions outside [0,1] raise E0034; at most 65,536 elements. Each call precharges `N × (floor(log2(N)) + 5)` work steps and `8 × N` bytes of temporary vector storage. Quota failures may raise E0017/E0036.

## Unicode and checked integers

| Task | Intrinsics | Boundary |
| --- | --- | --- |
| Unicode case mapping | `text_lower`, `text_upper` | locale-independent; multi-scalar expansion possible |
| Scalar reversal/search | `text_reverse`, `text_rfind`, `text_count` | Unicode scalars, not graphemes; no normalization |
| Codepoint to string | `text_from_codepoint` | valid Unicode scalars only |
| Bit-pattern helpers | `bits_count_ones`, `bits_rotate_left`, `bits_reverse` | signed 64-bit; rotations 0–63 |
| Arithmetic helpers | `integer_abs`, `integer_gcd`, `integer_lcm` | overflow is an error |

For example, `text_upper("Straße")` returns `STRASSE`. Unicode scalar reversal can separate combining marks and is not grapheme reversal.

[Complete compiler example](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/examples/core_collections.srp) · [Required module](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/examples/modules/collection_tools.srp)

## Rust host boundaries

Exhaustive Rust `numeric::Builtin` matches must handle new variants. `ConstantCache` limits are Rust-host features. Experimental ELF64 and C11 emitters do not supply general native compilation of these functions.

~~~sh
scarp version
scarp verify examples/order_statistics.srp
scarp exec examples/order_statistics.srp
~~~

[Upstream statistics reference](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/docs/order-statistics.md) · [Upstream scalar utilities reference](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/docs/scalar-utilities.md)
