# Explicit scalar and text conversions — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

This lesson applies to the [published v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6) only. The earlier alpha.5 compiler **does not** ship these intrinsics. The [compiler contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/text-foundations.md) and [source example](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.srp) provide the release-pinned behavior.

## Six built-ins

| Intrinsic | Input → output | Behavior |
| --- | --- | --- |
| `integer_to_text` | integer → string | Canonical decimal representation |
| `float_to_text` | float → string | Finite decimal representation, retaining signed zero |
| `text_to_integer` | string → integer | Checked signed 64-bit decimal parse |
| `text_to_float` | string → float | Explicit finite IEEE-754 binary64 conversion |
| `text_trim` | string → string | Remove leading/trailing Unicode whitespace |
| `text_replace` | string, pattern, replacement → string | Literal, left-to-right nonoverlapping replacement |

None converts values implicitly. Decimal integer text supports optional leading `+` or `-`, ASCII digits and no whitespace. For `text_to_float`, decimal exponents are supported; NaN, infinity, hexadecimal and malformed numeric text are rejected. Call `text_trim` yourself if spaces are expected. `text_replace` uses case-sensitive UTF-8 matching, not regular expressions; an empty pattern is an error.

## Published example

The following executable statements come from the [tagged example](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.srp). Its historical first comment references the earlier alpha.5 candidate phase; the **alpha.6 tag** is now the published source.

~~~scarp
pure funcra amount(text: string) -> integer {
    return text_to_integer(text_trim(text));
}

print(integer_to_text(amount("  -42 ")));
bind number = text_to_float("1.25e2");
print(float_to_text(number), to_integer(number));
print(text_replace(text_trim("  café café  "), "é", "🌍"));
print(float_to_text(-0.0));
~~~

Its [tagged expected stdout](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.stdout) is:

~~~text
-42
125.0 125
caf🌍 caf🌍
-0.0
~~~

Formatting is not arbitrary-precision decimal arithmetic. Float parsing rounds to finite binary64; `float_to_text(-0.0)` keeps the sign and decimal marker. Signed `integer` remains bounded to i64; BigInt is not introduced.

## Failures, Unicode and budgets

Invalid or out-of-range numeric text reports `E0044`; an empty literal replacement pattern reports `E0034`. New result strings remain bounded by the existing per-value text cap (1,048,576 bytes) and cumulative text/work quotas. Trimming is based on Unicode whitespace, not normalization; replacement does not alter the input or perform locale-aware matching.

Try reading a line with [bounded input](/language/program-input-alpha6) and then explicitly parsing its text. For a typed record, see [tuples](/language/tuples-alpha6). [Release guide](/releases/v0.0.6-alpha.6) · [हिन्दी पाठ](/hi/language/text-foundations-alpha6).
