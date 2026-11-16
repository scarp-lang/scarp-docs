# सटीक Decimal गणना — alpha.11

<!-- scarp-current-release: v0.0.6-alpha.11 -->
<!-- scarp-cli-release: v0.0.6-alpha.11 -->
<!-- scarp-current-source: 79b57395957f47e1270ee542a856c844b82386de -->

प्रकाशित alpha.11 में `decimal` एक सटीक base-10 type है, `float` का दूसरा नाम नहीं। यह experiment interpreter में उपलब्ध है।

## प्रकाशित compiler example

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

पहला परिणाम tax सहित कीमत है। दूसरा `0.1 + 0.2` का सटीक मान है। तीसरे परिणाम में quotient के लिए स्पष्ट rounding चुनी गई है।

## सीमाएँ और conversions

Decimal में अधिकतम **28 canonical coefficient digits** और **18 fractional places** मान्य हैं। Text में ASCII digits और वैकल्पिक चिह्न मान्य हैं; exponent और separators मान्य नहीं। `decimal_from_integer` और `decimal_to_integer` स्पष्ट conversion करते हैं। `decimal_round` value बदलता है, जबकि `decimal_format` प्रदर्शित text बनाता है। `decimal_div_rounded` scale और rounding mode स्वीकार करता है। Exact division में rounding आवश्यक होने पर त्रुटि आती है। `float` से implicit conversion नहीं होता। Decimal **केवल interpreter** में काम करता है; experimental native emitters इसे `E0049` से अस्वीकार करते हैं। `E0068`–`E0070` गलत text/mode, सीमा और inexact operations दिखाते हैं।

[रिलीज़ और डाउनलोड](/hi/releases/v0.0.6-alpha.11) · [Interactive Decimal input](/hi/tooling/decimal-input-alpha11).
