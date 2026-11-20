# Scarp alpha.16: statistics और Unicode utilities

<!-- scarp-cli-release: v0.0.6-alpha.16 -->
<!-- scarp-current-source: 244f713b4fa48f02a98b8e3e3c11025363f35260 -->

यह मार्गदर्शिका केवल [प्रकाशित alpha.16](/hi/releases/v0.0.6-alpha.16) पर आधारित है; पुरानी examples अपने अलग release पर pinned हैं।

## Median और quantile

`median(values)` बीच का मान देता है और even-size vector में बीच के दो मानों का औसत। `quantile(values, fraction)` 0 से 1 fraction पर type-7 linear interpolation करता है।

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

Source vector अपरिवर्तित रहता है। खाली vector या गलत fraction से E0034; अधिकतम 65,536 elements। हर call का work budget `N × (floor(log2(N)) + 5)` और temporary vector allocation `8 × N` bytes है। E0017/E0036 quota failures हो सकते हैं।

## Unicode और checked integers

| Task | Intrinsics | Boundary |
| --- | --- | --- |
| Unicode case mapping | `text_lower`, `text_upper` | locale-independent; multi-scalar expansion संभव |
| Scalar reverse/search | `text_reverse`, `text_rfind`, `text_count` | Unicode scalar, grapheme नहीं; normalization नहीं |
| Codepoint से string | `text_from_codepoint` | केवल मान्य Unicode scalars |
| Bit-pattern helpers | `bits_count_ones`, `bits_rotate_left`, `bits_reverse` | signed 64-bit; rotations 0–63 |
| Arithmetic helpers | `integer_abs`, `integer_gcd`, `integer_lcm` | overflow पर error |

उदाहरण के लिए `text_upper("Straße")` का परिणाम `STRASSE` है। Combining marks को अलग करने वाली scalar reversal को grapheme reversal न समझें।

[पूरा compiler example](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/examples/core_collections.srp) · [आवश्यक module](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/examples/modules/collection_tools.srp)

## Rust host सीमाएँ

`numeric::Builtin` के exhaustive Rust matches को नए variants संभालने होंगे। `ConstantCache` limits Rust host API के लिए हैं। ELF64 और C11 experimental emitters इन functions के लिए general native compilation नहीं देते।

~~~sh
scarp version
scarp verify examples/order_statistics.srp
scarp exec examples/order_statistics.srp
~~~

[मूल statistics reference](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/docs/order-statistics.md) · [मूल scalar reference](https://github.com/scarp-lang/scarp/blob/244f713b4fa48f02a98b8e3e3c11025363f35260/docs/scalar-utilities.md)
