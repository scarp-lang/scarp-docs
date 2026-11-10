# Scarp v0.0.6-alpha.5 — प्रकाशित numerical kernels

> **आधिकारिक प्रयोगात्मक prerelease:** [v0.0.6-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.5), 9 नवंबर 2026। सटीक compiler source commit `205e92f166f186c3905e5880d41c31717b697b8e` है। ये नए फ़ंक्शन पुराने v0.0.6-alpha.4 binary में उपलब्ध नहीं हैं। यह पूरा AI framework, random sampling या सामान्य native compiler नहीं है।

## Pearson correlation — औसत घटाकर संबंध

`pearson_correlation(left, right) -> float` paired संख्याओं का **औसत घटाकर** रैखिक संबंध मापता है। `cosine_similarity` औसत घटाए बिना वेक्टरों की दिशा देखता है, इसलिए दोनों अलग हैं। दोनों vectors समान लंबाई के, कम से कम दो finite values वाले और nonconstant होने चाहिए। लंबाई असमान होने पर E0032; constant या बहुत कम values होने पर E0034 मिलता है।

वास्तविक compiler की पूरी Scarp फ़ाइल:

~~~scarp
// Pearson correlation: centered scientific statistics, not cosine similarity.
bind measurements = [1.0, 2.0, 3.0];
print(pearson_correlation(measurements, [10.0, 20.0, 30.0]));
print(pearson_correlation(measurements, [30.0, 20.0, 10.0]));
print(pearson_correlation([-1.0, 0.0, 1.0], [1.0, -2.0, 1.0]));
~~~

~~~text
1.0
-1.0
0.0
~~~

कम्पाइलर केंद्रित और compensated arithmetic प्रयोग करता है। प्रति इनपुट `12 × N` abstract steps का बजट रखा जाता है; नया numerical vector payload नहीं बनता। Floating-point गणना हर कठिन इनपुट पर पूर्णतः exact नहीं होती।

[अपरिवर्तनीय source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.srp) · [सटीक stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.stdout) · [कोर्स PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57)।

## Top-P — निश्चित nucleus selection

`top_p(probabilities, mass) -> integers` अधिक संभावना वाले मानों से शुरू करके उस **सबसे छोटे समूह** के मूल zero-based index लौटाता है जिसका cumulative sum `mass` तक पहुँचता है। `top_p_values(probabilities, mass) -> vector` वही चुनी probabilities देता है। बराबरी पर पहले इंडेक्स को प्राथमिकता मिलती है। इसमें **random sampling नहीं** है।

इनपुट vector खाली न हो, हर मान finite और nonnegative हो तथा कुल योग 1 से `1e-12` के भीतर हो। `mass` की अनुमति `(0, 1]` है। ठीक `1.0` पर शून्य probability वाले मान समेत सभी प्रविष्टियाँ चुनी जाती हैं। गलत numeric domain पर E0034, type पर E0015, arity पर E0024 मिलता है।

~~~scarp
// Deterministic nucleus selection: rank the smallest probability prefix
// covering the specified cumulative mass without random sampling.
bind probabilities = [0.5, 0.25, 0.25];
print(top_p(probabilities, 0.75));
print(top_p_values(probabilities, 0.75));
print(top_p(probabilities, 1.0));

bind logits = [1.0, 4.0, 4.0, 2.0];
print(top_p(softmax_temp(logits, 0.5), 0.9));
~~~

~~~text
[integer: 0, 1]
[0.5, 0.25]
[integer: 0, 1, 2]
[integer: 1, 2]
~~~

अधिकतम 65,536 मानों के लिए `N × (floor(log2(N)) + 5)` abstract steps और `8N` ranking bytes लगते हैं। चुने गए K मान लौटाने पर `top_p_values` को `8K` अतिरिक्त bytes चाहिए। काम और memory budget खत्म होने पर E0017/E0036 मिलता है; अधूरा परिणाम नहीं लिखा जाता।

[अपरिवर्तनीय source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.srp) · [सटीक stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.stdout) · [कोर्स PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57)।

## अभी उपलब्ध नहीं

[सीमित ELF64 सुविधा](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/docs/native-elf64.md) केवल Rust embedding API है, सामान्य `scarp compile` कमांड नहीं। GPU, सामान्य tensor, autodiff, random decoder, native linker, पूरी LSP और package manager प्रकाशित नहीं हुए।

पुराने [प्रकाशित alpha.4 वैज्ञानिक फ़ंक्शन](/hi/language/scientific-kernels-alpha4) में cosine, sampled calculus, Top-K तथा temperature softmax सीखें। [Course PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57) merge/deploy होने से पहले उसके नए URL को सार्वजनिक प्रकाशित पाठ न मानें।
