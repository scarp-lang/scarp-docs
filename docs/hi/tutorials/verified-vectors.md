# सत्यापित न्यूमेरिकल वैक्टर ट्यूटोरियल

यह मार्गदर्शिका Scarp के प्रयोगात्मक **v0.0.5-alpha.1** इंटरप्रेटर के लिए है। नीचे का सोर्स और अपेक्षित आउटपुट सीधे प्रकाशित [vectors fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.srp) से लिए गए हैं। हिन्दी और अंग्रेज़ी, दोनों पृष्ठों में इनकी स्वचालित जाँच होती है।

## 1. वैक्टर वाला प्रोग्राम बनाएँ

`vectors.srp` नाम की UTF-8 फ़ाइल बनाएँ। नीचे **एक पूरा चलने वाला प्रोग्राम** है; इसे अलग-अलग छोटे प्रोग्राम न समझें।

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(values, len(values), values[0]);
var weights = [0.2, 0.3, 0.5];
bind snapshot = weights;
weights = scale(weights, 2.0);
print(snapshot);
print(weights);
print(sum(values), mean(values));
print(dot(values, [2.0, -1.0, 0.5, 2.0]));
print(mse([1.0, 2.0], [1.0, 4.0]));
print(clamp([-2.0, 0.5, 3.0], 0.0, 1.0));
print(fill(1.5, 3));
~~~

फ़ाइल के फ़ोल्डर से कमांड चलाएँ:

~~~sh
scarp check vectors.srp
scarp run vectors.srp
~~~

`run` कमांड का वास्तविक अपेक्षित stdout:

~~~text
[1.0, 2.0, 3.0, 4.0] 4 1.0
[0.2, 0.3, 0.5]
[0.4, 0.6, 1.0]
10.0 2.5
9.5
2.0
[0.0, 0.5, 1.0]
[1.5, 1.5, 1.5]
~~~

यह परिणाम प्रकाशित [stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/vectors.stdout) से मेल खाता है।

## 2. कोड का अर्थ समझें

- `[1.0, 2.0, 3.0, 4.0]` एक numerical vector है। `len(values)` उसकी लंबाई और `values[0]` पहला तत्व देता है।
- `var weights` को बदला जा सकता है। `bind snapshot` पहले वाला मान बनाए रखता है, जबकि `scale(weights, 2.0)` से `weights` में नया मान आता है।
- `sum` कुल योग, `mean` औसत, `dot` संबंधित तत्वों का गुणन-योग और `mse` दो समान आकार के वैक्टर का mean squared error निकालता है।
- `clamp` तत्वों को न्यूनतम और अधिकतम सीमा में रखता है। `fill(1.5, 3)` तीन समान संख्याओं वाला वैक्टर बनाता है।

## 3. अब अपनी फ़ाइल में बदलाव करें

अपनी कॉपी में संख्याएँ बदलने के बाद `scarp check vectors.srp` और `scarp run vectors.srp` फिर चलाएँ। बदले हुए प्रोग्राम का परिणाम ऊपर की सत्यापित fixture से अलग हो सकता है। अलग लंबाई वाले वैक्टर और गलत गणना पर diagnostics आ सकते हैं। [न्यूमेरिकल फीचर](/hi/language/numerics), [त्रुटि कोड](/hi/reference/diagnostics) तथा [रनटाइम बजट](/hi/reference/budgets) पढ़ें।

## 4. अगला अभ्यास: टाइल और मॉड्यूल

[सोर्स मॉड्यूल ट्यूटोरियल](/hi/tutorials/modules-walkthrough) में `tile` मैट्रिक्स और वैक्टर को `matvec` से जोड़ा जाता है। उसके मॉड्यूल और आउटपुट भी compiler fixtures से जाँचे जाते हैं। फ़ंक्शन सीखने के लिए [सत्यापित फ़ंक्शन अभ्यास](/hi/tutorials/verified-functions) देखें।

::: warning प्रयोगात्मक संस्करण
इन निर्देशों को केवल प्रकाशित v0.0.5-alpha.1 के लिए सत्यापित माना गया है। पुराने या भविष्य के संस्करणों में व्यवहार अलग हो सकता है। [फीचर स्थिति](/hi/reference/status) देखें।
:::
