# आउटपुट: `print` और `write` का अंतर

यह मार्गदर्शिका **Scarp v0.0.5-alpha.1** के प्रकाशित इंटरप्रेटर पर आधारित है। `print` आख़िर में नई लाइन जोड़ता है, जबकि `write` नहीं जोड़ता। इस उदाहरण के **असली आउटपुट bytes** की CI में compiler के साथ तुलना होती है।

## 1. प्रोग्राम बनाएँ

`output.srp` में पूरा कोड लिखें:

~~~scarp
// Output without a final newline.
bind name = "Scarp";
write("Hello, ");
print(name, 3, true,);
print();
write("done");
~~~

पहले जाँचें, फिर चलाएँ:

~~~sh
scarp check output.srp
scarp run output.srp
~~~

स्क्रीन पर दिखने वाला stdout:

~~~text
Hello, Scarp 3 true

done
~~~

**महत्त्वपूर्ण:** आख़िर में `done` के बाद **newline नहीं है**। Markdown code block देखने से यह नहीं पता चलता कि आउटपुट के अंत में newline है या नहीं। प्रकाशित [output.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.stdout) फ़ाइल में सटीक bytes रखे हैं और [compiler-conformance टेस्ट](https://github.com/scarp-lang/scarp-docs/blob/main/scripts/test-compiler.ts) असली इंटरप्रेटर के आउटपुट से byte-for-byte तुलना करता है।

## 2. हर स्टेटमेंट को समझें

- `write("Hello, ");` शुरुआत का टेक्स्ट लिखता है, लेकिन नई लाइन नहीं।
- `print(name, 3, true,);` arguments के बीच space और अंत में एक newline जोड़ता है। इस सत्यापित उदाहरण में अंतिम comma भी समर्थित है।
- `print();` एक खाली लाइन लिखता है।
- `write("done");` अंतिम `done` लिखता है, लेकिन उसके बाद newline नहीं जोड़ता।

पूरे प्रोग्राम में `Hello, Scarp 3 true`, उसके बाद **दो newline characters**, और अंत में `done` लिखे जाते हैं।

## 3. कौन सा विकल्प चुनें?

सामान्य line-oriented messages के लिए `print` और बिना newline के आउटपुट जोड़ने के लिए `write` चुनें। output limits, stderr और कमांड की त्रुटियाँ समझने के लिए [आउटपुट संदर्भ](/hi/language/output) और [त्रुटि कोड](/hi/reference/diagnostics) पढ़ें।

**Compiler प्रमाण:** [सोर्स फ़ाइल](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.srp) तथा [अपेक्षित आउटपुट](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.stdout)। आगे [फ़ंक्शन](/hi/tutorials/verified-functions), [लूप](/hi/tutorials/repeat-and-loops) और [वैक्टर](/hi/tutorials/verified-vectors) सीखें।

::: warning प्रयोगात्मक रिलीज़
यह विवरण केवल सत्यापित v0.0.5-alpha.1 इंटरप्रेटर का है। [फ़ीचर स्थिति](/hi/reference/status) देखें।
:::
