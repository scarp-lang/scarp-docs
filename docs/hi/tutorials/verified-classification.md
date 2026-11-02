# सत्यापित मैट्रिक्स वर्गीकरण और संभावनाएँ

**कंपाइलर संस्करण: Scarp v0.0.5-alpha.1।** इस पृष्ठ के तीनों पूरे प्रोग्राम और stdout, प्रकाशित compiler के `examples/` फ़ोल्डर से लिए गए हैं। English तथा Hindi दोनों पृष्ठों में source और output की जाँच होती है; CI वास्तव में pinned Rust interpreter चलाकर output का byte-for-byte मिलान करती है।

Scarp के `tile` और `vector` विशेष immutable numerical types हैं। ये उदाहरण गणना समझाते हैं; **इन्हें पूरा AI training framework या GPU backend न समझें**। शुरू में [वैक्टर](/hi/tutorials/verified-vectors) और [टाइल inference](/hi/tutorials/verified-tiles) पढ़ सकते हैं।

## 1. क्लास स्कोर और बराबरी की स्थिति

`matrix_classification.srp` फ़ाइल बनाकर पूरा कोड लिखें:

~~~scarp
bind weights = tile([1.0, 0.0, 0.0, 2.0, -1.0, 1.0], 3, 2);
bind scores = matvec(weights, [2.0, 1.0]);
// Equal best scores choose the first class.
print(scores, argmax(scores), maxval(scores));
~~~

अपेक्षित stdout:

~~~text
[2.0, 2.0, -1.0] 0 2.0
~~~

तीन rows और दो columns वाली tile, दो input features से तीन class scores बनाती है। पहले दो scores `2.0` पर बराबर हैं। प्रकाशित fixture के अनुसार `argmax` पहला index `0` चुनता है; `maxval` सबसे बड़ा score दिखाता है।

जाँचने के लिए `scarp check matrix_classification.srp` और चलाने के लिए `scarp run matrix_classification.srp` कमांड दें।

**प्रकाशित सोर्स:** [matrix_classification.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_classification.srp) और [stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_classification.stdout)।

## 2. संभावनाएँ और cross-entropy

`matrix_probabilities.srp` फ़ाइल बनाकर पूरा कोड लिखें:

~~~scarp
bind weights = tile([1.0, 0.0, 0.0, 1.0], 2, 2);
bind scores = matvec(weights, [0.0, 0.0]);
print(softmax(scores));
bind loss = crossentropy(scores, 1);
print(loss > 0.6931 and loss < 0.6932);
~~~

अपेक्षित stdout:

~~~text
[0.5, 0.5]
true
~~~

दो-बाई-दो identity tile और zero vector से बराबर scores मिलते हैं। इसलिए `softmax` का output `[0.5, 0.5]` है। `crossentropy(scores, 1)` से लगभग `0.6931` loss मिलता है; fixture floating result की पूरी decimal value छापने के बजाय एक दायरा जाँचती है।

जाँचने के लिए `scarp check matrix_probabilities.srp` और चलाने के लिए `scarp run matrix_probabilities.srp` कमांड दें।

**प्रकाशित सोर्स:** [matrix_probabilities.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_probabilities.srp) और [stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_probabilities.stdout)।

## 3. चुनी हुई class को one-hot target बनाना

`matrix_targets.srp` फ़ाइल बनाकर पूरा कोड लिखें:

~~~scarp
bind scores = matvec(tile([1.0, 0.0, 0.0, 2.0, -1.0, 1.0], 3, 2), [2.0, 1.0]);
print(onehot(len(scores), argmax(scores)));
~~~

अपेक्षित stdout:

~~~text
[1.0, 0.0, 0.0]
~~~

`len(scores)` classes की कुल संख्या देता है और `argmax(scores)` चुना हुआ index देता है। `onehot` उस स्थान पर `1.0` तथा बाकी स्थानों पर `0.0` वाला vector बनाता है। इसमें पहले उदाहरण की तरह तीन scores हैं।

जाँचने के लिए `scarp check matrix_targets.srp` और चलाने के लिए `scarp run matrix_targets.srp` कमांड दें।

**प्रकाशित सोर्स:** [matrix_targets.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_targets.srp) और [stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_targets.stdout)।

## किन बातों का ध्यान रखें?

- **आकार:** `matvec(weights, features)` में tile की width और vector की length बराबर हों। गलत आकार पर error आएगा; अपने-आप broadcasting नहीं होती।
- **Numerical domain:** `softmax` और `crossentropy` में input तथा numerical limits जाँचे जाते हैं। [Built-ins](/hi/reference/library) और [डायग्नोस्टिक्स](/hi/reference/diagnostics) देखें।
- **Class index:** इस सत्यापित fixture में बराबर सर्वाधिक score होने पर `argmax` **पहला** index चुनता है। Index और score अलग चीजें हैं।
- **Output:** ऊपर दिए outputs प्रकाशित compiler के हैं। स्वयं inputs बदलने पर परिणाम या diagnostic बदल सकता है।

आगे [रनटाइम बजट](/hi/reference/budgets), [मॉड्यूल](/hi/tutorials/modules-walkthrough) और [फ़ीचर स्थिति](/hi/reference/status) पढ़ें।

::: warning प्रयोगात्मक प्रीरिलीज़
Scarp `v0.0.5-alpha.1` स्थिर compatibility की गारंटी नहीं देता। दूसरे संस्करण में उदाहरण आज़माने से पहले फीचर सत्यापित करें।
:::
