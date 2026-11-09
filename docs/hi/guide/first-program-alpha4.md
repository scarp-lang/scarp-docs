# Scarp में पहला प्रोग्राम — प्रकाशित v0.0.6-alpha.4

<!-- scarp-cli-release: v0.0.6-alpha.4 -->

> **पुराने release पर pinned शुरुआती गाइड:** यह **प्रकाशित प्रयोगात्मक** [Scarp v0.0.6-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4) से फ़ाइल बनाकर शुरू करने की गाइड है। आधिकारिक compiler commit `f04be0758cbce405ddcdb229699b0ff83c09d207` है। [पुराना first-program tutorial](/hi/guide/first-program) `v0.0.5-alpha.1` के लिए सुरक्षित रखा गया है।

यहाँ के source और output [Scarp by Example](https://github.com/scarp-lang/scarp-by-example) के वास्तविक compiler-verified पाठों से लिए गए हैं। Scarp इन प्रोग्रामों को interpreter से चलाता है; अभी यह सामान्य native executable compiler नहीं है।

## 1. सही रिलीज़ डाउनलोड करें

[आधिकारिक v0.0.6-alpha.4 रिलीज़](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4) से अपने OS का archive और उसकी SHA-256 checksum फ़ाइल लें। चलाने से पहले checksum जाँचें। `scarp` कमांड उपलब्ध होने पर संस्करण देखें:

~~~sh
scarp version
~~~

इसका संस्करण `0.0.6-alpha.4` होना चाहिए। किसी पुराने prerelease के साथ नए CLI या syntax की संगतता अपने-आप नहीं मान सकते।

## 2. पहली .srp फ़ाइल बनाएँ

UTF-8 में `hello.srp` नामक फ़ाइल बनाएँ और सत्यापित उदाहरण का पूरा कोड लिखें:

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

`//` टिप्पणी है, `print` नई लाइन में आउटपुट देता है और statement के अंत में `;` आवश्यक है।

## 3. पहले जाँचें, फिर चलाएँ

`hello.srp` वाली directory में terminal खोलकर ये कमांड चलाएँ:

~~~sh
scarp verify hello.srp
scarp exec hello.srp
~~~

`verify` **स्थिर जाँच** करता है और सफल होने पर कोई आउटपुट नहीं देता। `exec` चलाने पर stdout ठीक यही होगा:

~~~text
Hello from Scarp!
~~~

[मूल Scarp फ़ाइल](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/01-hello.srp) और [सटीक stdout](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/01-hello.stdout) course CI में compiler से सत्यापित हैं। वेबसाइट स्वयं प्रोग्राम नहीं चलाती।

## 4. Immutable bind समझें

दूसरे पाठ से `area.srp` बनाएँ:

~~~scarp
// Bindings are visible after their declaration.
bind width = 6;
bind height = 7;
bind area = width * height;
print("Area:");
print(area);
~~~

~~~sh
scarp verify area.srp
scarp exec area.srp
~~~

सटीक आउटपुट:

~~~text
Area:
42
~~~

`bind` से ऐसा मान बनता है जिसे फिर assign नहीं कर सकते। `area` बनाने से पहले `width` और `height` घोषित हो चुके हैं। बदलने वाला मान चाहिए तो `var` सीखें। [Variables और scopes](/hi/language/variables) तथा [दूसरे verified example](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/02-bindings.srp) से आगे बढ़ें।

## 5. आगे का रास्ता

[Scarp by Example](https://github.com/scarp-lang/scarp-by-example) में क्रमवार runnable lessons, हिन्दी/अंग्रेज़ी व्याख्या, अभ्यास और stdout fixtures हैं। पहले [Basics chapter](https://github.com/scarp-lang/scarp-by-example/tree/main/examples/01-basics), फिर [control flow](/hi/language/control-flow), [modules](/hi/language/modules) और [प्रकाशित alpha.4 वैज्ञानिक kernels](/hi/language/scientific-kernels-alpha4) पढ़ें।

पूरा project बनाना हो तो [version-aware learning path](/hi/guide/learning-path) खोलें। पुराने `v0.0.5-alpha.4` project-generator और नए `v0.0.6-alpha.4` compiler को केवल "alpha.4" कहकर एक जैसा न समझें।

**इसके बाद प्रकाशित compiler:** [v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5) में नये फ़ंक्शन हैं, लेकिन इस पाठ के alpha.4 source/output और version pin जानबूझकर सुरक्षित हैं। [Pearson और Top-P](/hi/language/scientific-kernels-alpha5) अलग सीखें।
