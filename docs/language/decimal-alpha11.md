# Exact decimal arithmetic — alpha.11

<!-- scarp-current-release: v0.0.6-alpha.11 -->
<!-- scarp-cli-release: v0.0.6-alpha.11 -->
<!-- scarp-current-source: 79b57395957f47e1270ee542a856c844b82386de -->

Published alpha.11 provides an exact base-10 `decimal` type, not a second spelling for binary `float`. This is an experimental interpreter feature.

## Official tagged compiler example

~~~scarp
pure funcra taxed(price: decimal, rate: decimal) -> decimal {
    return price + price * rate;
}

bind total: decimal = taxed(decimal("199.99"), decimal("0.18"));
bind scores: array<decimal, 2> = [array: decimal("0.1"), decimal("0.2")];
print(decimal_format(total, 2, "half_even"));
print(scores[0] + scores[1]);
print(decimal_div_rounded(decimal("1"), decimal("3"), 2, "half_even"));
~~~

~~~text
235.99
0.3
0.33
~~~

~~~sh
scarp verify examples/decimal_exact.srp
scarp exec examples/decimal_exact.srp
~~~

The output shows a tax-inclusive price, exact `0.1 + 0.2`, and an explicitly rounded quotient. Source and expected stdout come from the immutable compiler tag.

## Rules and conversions

Decimal uses at most **28 canonical coefficient digits** and **18 fractional places**. Text accepts signed ASCII decimals, not exponents or digit separators. `decimal_from_integer` and `decimal_to_integer` are explicit conversions. `decimal_round` changes a value; `decimal_format` produces presentation text, while `decimal_div_rounded` requests scale and rounding mode for inexact quotients. Exact division fails when rounding is needed. There is no implicit conversion to or from `float`. Decimal is **interpreter-only**; experimental native emitters reject it with `E0049`. Diagnostics `E0068`–`E0070` cover invalid text or rounding mode, size/input limits, and inexact arithmetic.

[Release and downloads](/releases/v0.0.6-alpha.11) · [Interactive Decimal input](/tooling/decimal-input-alpha11).
