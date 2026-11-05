# Root mean square (RMS) — v0.0.6-alpha.1

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-release: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

Pure built-in `rms(values: vector) -> float` पहली बार [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) (source `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`) में प्रकाशित हुआ है। **पुराने alpha.5 compiler में यह नहीं है।**

Nonempty finite vector का RMS, उसके प्रत्येक element के वर्गों के औसत का वर्गमूल है। इस माप में positive और negative signs परिणाम की magnitude नहीं बदलते। Compiler पहले input को scale करता है और compensated calculation अपनाता है; बड़े अंकों को सीधा square करके overflow नहीं करता। परिणाम binary64 floating-point approximation होता है।

## प्रकाशित example को चलाएँ

[examples/root_mean_square.srp](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/root_mean_square.srp) का पूरा source:

~~~scarp
// RMS measures signal magnitude without forming an overflowing norm.
bind signal = [3.0, 4.0];
print(rms(signal) > 3.5, rms(signal) < 3.6);
print(rms([2.0, -2.0]));
print(rms(window([99.0, 3.0, 4.0, 99.0], 1, 2)) == rms(signal));
print(rms([1e308, -1e308]) == 1e308);
print(rms([0.0, -0.0]));
~~~

सटीक stdout:

~~~text
true true
2.0
true
true
0.0
~~~

Tag वाले source directory से:

~~~sh
scarp verify examples/root_mean_square.srp
scarp exec examples/root_mean_square.srp
~~~

`window` केवल दिखने वाले elements पर काम करता है। पूरे zero vector का उत्तर positive `0.0` है; बहुत बड़े finite inputs का उत्तर भी finite रहता है। ऊपर का exact equality उदाहरण compiler fixture से जाँचा गया है, लेकिन सामान्य floating-point गणना में तुलना के लिए tolerance रखें।

## त्रुटियाँ, सीमाएँ और संसाधन

- खाली vector जैसे `rms([])` पर argument के स्थान में **`E0034`** आता है।
- गलत types/arguments पर पहले से उपलब्ध type/arity diagnostics आते हैं। Integer collection को अपने आप vector में नहीं बदला जाता।
- `n` visible values के लिए kernel पहले से **4n native work steps** गिनता है; बाकी expressions का काम अलग है।
- RMS खुद **अतिरिक्त numerical payload allocate नहीं करता**। Original vector बनाना quota में आता है; एक vector में अधिकतम 65,536 visible elements हैं।
- `verify` types जाँचता है, सामान्य runtime numerical domain नहीं चलाता। Interpreter error पर pending output सुरक्षित ढंग से discard करता है।
- प्रयोगात्मक C11 Rust embedding backend RMS या vector code emit नहीं करता; unsupported form पर `E0049` आता है।

कठिन numeric मामलों के लिए [official tagged compiler details](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/docs/root-mean-square.md) और [alpha.6 release](/hi/releases/v0.0.6-alpha.1) पढ़ें।
