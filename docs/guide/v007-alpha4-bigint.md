# Scarp alpha.4 — Exact BigInt wide exponents

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

`bigint` is an exact signed integer type. This pinned example exercises bounded exact operations with wide BigInt exponents. It does not imply infinite memory, unbounded work, or guaranteed speed.

~~~scarp
bind exponent = bigint("340282366920938463463374607431768211456");
print(bigint_pow_big(bigint("-1"), exponent));
print(bigint_pow_mod_big(bigint("-12345678901234567890987654321"),
                        exponent, bigint("4294967291")));
print(bigint_pow_big(bigint("-10"), bigint("17")));
~~~

## Exact expected output

~~~text
1
3252763948
-100000000000000000
~~~

## File-backed CLI

The experimental `scarp bigint` CLI consumes plain ASCII-decimal operand files and provides `add`, `sub`, `mul`, `div` and `div-wide`. Multiplication and ordinary division restrict operand size; wide division has a separate limb-work budget. Each destination must be a new file whose parent directory exists.

~~~sh
scarp bigint add left.txt right.txt result.txt
scarp bigint div left.txt right.txt quotient.txt
scarp bigint div-wide --max-limb-steps 1000000 left.txt right.txt quotient.txt
scarp bigint --help
~~~

## Safety and resource bounds

Power, digit and work limits can reject computations. Input files must contain only a valid signed ASCII integer, without whitespace or newlines. Division writes the quotient to the destination file and prints its signed remainder to stdout.

[Alpha.4 release](/releases/v0.0.7-alpha.4) · [Current reference](/reference/current) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/bigint_wide_exponents.srp).
