# Interactive Decimal input — alpha.11

<!-- scarp-current-release: v0.0.6-alpha.11 -->
<!-- scarp-cli-release: v0.0.6-alpha.11 -->
<!-- scarp-current-source: 79b57395957f47e1270ee542a856c844b82386de -->

Published `input_decimal(prompt)` flushes a prompt and validates an exact decimal with `scarp exec --interactive`. A redirected UTF-8 fixture makes the same example reproducible.

## Tagged source, input, and output

~~~scarp
bind amount: decimal = input_decimal("राशि> ");
print(decimal_format(amount, 2, "half_even"));
~~~

~~~text
2.675
~~~

~~~text
राशि> 2.68
~~~

~~~sh
scarp exec --interactive examples/interactive/exact_decimal.srp < examples/interactive/exact_decimal.stdin
~~~

The UTF-8 prompt is `राशि> `. Input `2.675` is formatted with `half_even` to two places, producing `2.68`. This function is unavailable in alpha.10.

[Decimal arithmetic guide](/language/decimal-alpha11) · [Release](/releases/v0.0.6-alpha.11).
