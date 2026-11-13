# सटीक BigInt पूर्णांक (v0.0.6-alpha.9)

<!-- scarp-cli-release: v0.0.6-alpha.9 -->

**[Scarp v0.0.6-alpha.9](/hi/releases/v0.0.6-alpha.9) में प्रकाशित।** `integer` signed i64 है, लेकिन नया `bigint` सटीक signed decimal संख्या रखता है। इसका अर्थ असीमित क्षमता नहीं है: digit, memory और काम की सीमाएँ लागू होती हैं। यह अभी interpreter से चलता है।

## बड़ी संख्या बनाना और दिखाना

नीचे का पूरा उदाहरण [प्रकाशित compiler source](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_arithmetic.srp) से बिना बदले लिया गया है:

~~~scarp
// Development BigInt milestone; unavailable in published alpha.4.
bind a: bigint = bigint("999999999999999999999999999999");
bind one = bigint_from_integer(1);
print(a + one);
print(a * bigint("123456789"));
print(-a / bigint("1000000000000000000"));
print(-a % bigint("1000000000000000000"));
print(a > one, bigint_abs(-a) == a, bigint_to_integer(one));
~~~

उस exact [stdout fixture](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_arithmetic.stdout) में यह output है:

~~~text
1000000000000000000000000000000
123456788999999999999999999999876543211
-999999999999
-999999999999999999
true true 1
~~~

## Constructors, conversions और operators

| Expression | इसका उपयोग |
| --- | --- |
| `bigint("123")` | signed ASCII decimal text से BigInt; spaces या underscore नहीं |
| `bigint_from_integer(42)` | i64 को बिना precision खोए convert करना |
| `bigint_to_integer(value)` | signed i64 में तभी बदलना जब value सीमा में हो |
| `bigint_abs(value)` | absolute मान |
| `a + b`, `a - b`, `a * b`, `a / b`, `a % b` | दो BigInt operands पर सटीक गणना |

BigInt में comparison, negation, typed declarations, functions, modules, loops और tuples समर्थित हैं। Division का परिणाम शून्य की ओर truncate होता है और remainder का sign dividend जैसा रहता है। `integer` या `float` में अपने-आप conversion नहीं होता; बहुत बड़े numeric literal को सीधे BigInt नहीं माना जाता।

## संसाधन सीमाएँ और अभी अनुपलब्ध कार्य

डिफ़ॉल्ट सीमा **10,000 decimal digits** एवं **8,388,608 cumulative limb bytes** है। अतिरिक्त execution-work और output limits भी हैं। कॉन्फ़िगर की जा सकने वाली अधिकतम सीमा **1,000,000 digits** है; यह प्रदर्शन की गारंटी नहीं है। [Compiler का असली contract](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/docs/bigint.md) पढ़ें। BigInt के bitwise operations, float conversion, fixed-size arrays और native executable `scarp compile` अभी नहीं मिले हैं।

## अगला प्रमाणित उदाहरण

इसी रिलीज़ का [Fibonacci तथा factorial source](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_sequences.srp) और उसका [stdout](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/examples/bigint_sequences.stdout) देखें। Official archives और checksums [release guide](/hi/releases/v0.0.6-alpha.9) में हैं।
