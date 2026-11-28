# Scarp alpha.4 — बड़ी संख्या और BigInt exponent

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

`bigint` exact signed integer है। यह example बड़े BigInt exponent पर सीमित exact operations दिखाता है; unlimited memory, अनंत work या बिना शर्त तेज़ गणना का वादा नहीं करता।

~~~scarp
bind exponent = bigint("340282366920938463463374607431768211456");
print(bigint_pow_big(bigint("-1"), exponent));
print(bigint_pow_mod_big(bigint("-12345678901234567890987654321"),
                        exponent, bigint("4294967291")));
print(bigint_pow_big(bigint("-10"), bigint("17")));
~~~

## रन करने पर exact output

~~~text
1
3252763948
-100000000000000000
~~~

## File-backed CLI

`scarp bigint` का प्रयोग plain ASCII-decimal input files के साथ करें। `add`, `sub`, `mul`, `div`, `div-wide` उपलब्ध हैं। Multiplication तथा सामान्य division में छोटे operand की सीमा है। `div-wide` अलग limb-work budget लेता है। प्रत्येक destination नई file होनी चाहिए और उसके parent directory का अस्तित्व जरूरी है।

~~~sh
scarp bigint add left.txt right.txt result.txt
scarp bigint div left.txt right.txt quotient.txt
scarp bigint div-wide --max-limb-steps 1000000 left.txt right.txt quotient.txt
scarp bigint --help
~~~

## सुरक्षा और सीमाएँ

Power/decimal digit budgets और काम की सीमा पर error मिलेगा। Input file में सिर्फ वैध signed ASCII integer लिखें; newline और spaces स्वीकार नहीं। Quotient file में लिखा जाता है, जबकि division का signed remainder stdout पर आता है।

[alpha.4 रिलीज़](/hi/releases/v0.0.7-alpha.4) · [Current reference](/hi/reference/current) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/bigint_wide_exponents.srp).
