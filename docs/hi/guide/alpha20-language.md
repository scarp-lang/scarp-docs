# Exact decimal और persistent tuple

<!-- scarp-cli-release: v0.0.6-alpha.20 -->

यह पाठ [प्रकाशित v0.0.6-alpha.20](/hi/releases/v0.0.6-alpha.20) के लिए है, compiler main के लिए नहीं। [आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) से install करें। प्रत्येक उदाहरण अलग file में रखकर `scarp exec FILE.srp` चलाएँ।

## Exact decimal arithmetic

Scarp में bounded `integer`, arbitrary-precision `bigint`, binary64 `float` और bounded base-ten `decimal` अलग types हैं। Exact decimal के लिए lowercase `d` suffix या `decimal("0.1")` प्रयोग करें। Decimal और दूसरे numeric types के बीच implicit conversion नहीं होता।

~~~scarp
print(0.1d + 0.2d, 0.3d == 0.1d + 0.2d);
var x = 1.0d;
while x <= 5.0d { x += 0.1d; }
print(x);
print(0.1 + 0.2);
~~~

~~~text
0.3 true
5.1
0.30000000000000004
~~~

यह अपेक्षित output [मूल decimal literal integration tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/decimal_literals.rs) में है। Loop exact increment दिखाता है; binary64 float का पुराना व्यवहार नहीं बदलता।

### Decimal की सीमाएँ

- Canonical coefficient में अधिकतम 28 digits और fraction में 18 places हैं।
- Decimal literal में exponent notation नहीं है। Fraction के अंतिम zero canonical representation में हटते हैं।
- Exact division तभी सफल है जब परिणाम निर्धारित सीमा में represent हो। Rounding की जरूरत हो तो `decimal_div_rounded` में scale और mode स्पष्ट दें।
- `decimal_from_integer` exact conversion देता है; `decimal_to_integer` के लिए पूर्ण संख्या integer range में होनी चाहिए।
- `decimal_to_text` canonical text देता है।

[Compiler decimal contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/decimal.md) देखें। Exact का मतलब unlimited precision नहीं है।

## Tuple replacement और alias

Tuple fixed-arity ordered value है। Mutable `var` में constant index पर सही member type वाला नया value रख सकते हैं। पहले बनी aliases पुराने tuple को सुरक्षित रखती हैं।

~~~scarp
var position = (10, 20);
bind old = position;
position[0] = 50;
position[1] = 100;
print(position);
print(old);
~~~

~~~text
(50, 100)
(10, 20)
~~~

अपेक्षित output [मूल उदाहरण](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_index_updates.srp) और [stdout fixture](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_index_updates.stdout) पर आधारित है। `bind` alias नहीं बदलती। यह persistent replacement है, सभी collections का in-place mutation नहीं।

## Numeric tuples का क्रम

Lexicographic comparison बाएँ से दाएँ पहला अलग member खोजता है। Compatible nested numeric tuples की तुलना भी हो सकती है। अलग numeric types स्वतः convert नहीं होते। Singleton tuple में अंतिम comma जरूरी है।

~~~scarp
print((10, 20) < (30, 40));
print((1, (2, 3)) < (1, (2, 4)));
print((0.0,) <= (-0.0,));
~~~

~~~text
true
true
true
~~~

[मूल ordering उदाहरण](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/tuple_ordering.srp) तथा [tuple tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/tuples.rs) देखें। Lexicographic comparison में हर member का अलग से छोटा होना आवश्यक नहीं।

## Project workflow

नए projects lowercase `scarp.project` बनाते हैं। पुराने `Scarp.project` को पढ़ सकते हैं। सही parent directory से नया project बनाकर उसके भीतर execute करें।

~~~sh
scarp init demo
cd demo
scarp exec
~~~

सामान्य CLI interpreter है। Native ELF64 एक experimental Rust embedding API है, `scarp compile` command नहीं। [वर्तमान संदर्भ](/hi/reference/current) में सीमाएँ पढ़ें।
