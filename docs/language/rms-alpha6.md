# Root mean square (RMS) — v0.0.6-alpha.1

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-release: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

The pure builtin `rms(values: vector) -> float` first shipped in [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) (source `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`). **Earlier alpha.5 binaries do not have it.**

For a nonempty vector of finite values, RMS is the square root of the mean of the squared elements. It measures magnitude without depending on the signs of those elements. Internally the implementation scales first and uses compensated accumulation: it does **not** directly square huge inputs and overflow. Results are rounded binary64 approximations.

## Run the exact published example

Full source from [examples/root_mean_square.srp](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/root_mean_square.srp):

~~~scarp
// RMS measures signal magnitude without forming an overflowing norm.
bind signal = [3.0, 4.0];
print(rms(signal) > 3.5, rms(signal) < 3.6);
print(rms([2.0, -2.0]));
print(rms(window([99.0, 3.0, 4.0, 99.0], 1, 2)) == rms(signal));
print(rms([1e308, -1e308]) == 1e308);
print(rms([0.0, -0.0]));
~~~

Exact expected stdout:

~~~text
true true
2.0
true
true
0.0
~~~

From the tagged source's root:

~~~sh
scarp verify examples/root_mean_square.srp
scarp exec examples/root_mean_square.srp
~~~

The `window` example reads only the visible slice. An all-zero vector returns positive `0.0`; extreme finite inputs remain finite. Equality in this *specific example* is verified by the compiler's fixture, but general floating-point comparisons should use tolerances.

## Domain, type, work and memory boundaries

- An **empty vector** such as `rms([])` reports `E0034` at its argument.
- Wrong argument types/arity use the existing type and argument diagnostics; there is **no** automatic conversion from the integer collection type.
- The kernel prepays **4n native work steps** for `n` visible items. Other program work still costs steps.
- RMS allocates **no additional numerical payload**. Creating the original vector still counts against allocation limits; a vector has at most 65,536 visible elements.
- `verify` checks types without evaluating the runtime numerical domain. Errors discard buffered output under the interpreter's normal atomic-output rules.
- The experimental scalar C11 Rust API does **not** support RMS or vector code generation; unsupported expressions report `E0049`.

The [exact compiler specification](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/docs/root-mean-square.md) documents numerical edge cases, and [alpha.6 release notes](/releases/v0.0.6-alpha.1) explain the version boundary.
