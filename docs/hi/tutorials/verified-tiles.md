# सत्यापित टाइल और मैट्रिक्स गणना

यह ट्यूटोरियल Scarp के प्रकाशित **v0.0.5-alpha.1** इंटरप्रेटर पर आधारित है। नीचे दिया गया पूरा कोड और उसका आउटपुट सीधे [आधिकारिक matrix-forward उदाहरण](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.srp) से लिया गया है। इसमें सामान्य tensor framework या GPU acceleration का दावा नहीं किया गया है।

## 1. फ़ाइल बनाकर प्रोग्राम चलाएँ

`matrix_forward.srp` नाम से फ़ाइल बनाइए और यह **पूरा मूल सोर्स** लिखिए:

~~~scarp
pure funcra forward(weights: tile, features: vector, bias: vector) -> vector
    needs width(weights) == len(features);
    needs height(weights) == len(bias);
    ensures len(result) == height(weights);
{
    return softmax(add(matvec(weights, features), bias));
}
bind identity = tile([1.0, 0.0, 0.0, 1.0], 2, 2);
bind weights = tileadd(identity, tilescale(identity, 1.0));
print(forward(weights, [1.0, 1.0], [0.0, 0.0]));
~~~

उसी फ़ोल्डर से पहले जाँचें और फिर चलाएँ:

~~~sh
scarp check matrix_forward.srp
scarp run matrix_forward.srp
~~~

अपेक्षित stdout:

~~~text
[0.5, 0.5]
~~~

[प्रकाशित सोर्स](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.srp) और [आउटपुट फ़ाइल](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/matrix_forward.stdout) दोनों को CI pinned release से सत्यापित करता है। हिन्दी और अंग्रेज़ी पृष्ठों के कोड को भी अलग से जाँचा जाता है।

## 2. टाइल क्या होती है?

`tile` दो आयामों वाला immutable numerical value है। `tile(values, rows, columns)` में मानों की संख्या ठीक `rows * columns` होनी चाहिए। मान **row-major** क्रम में रखे जाते हैं। `height` और `width` आयाम बताते हैं। इंडेक्स शून्य से शुरू होते हैं; numerical तत्व finite `float` होते हैं।

यह उदाहरण पहले **2 × 2 identity tile** बनाता है। `tilescale` सभी तत्वों को गुणा करता है और `tileadd` समान आकार की दो tiles जोड़ता है। `matvec` एक tile और उचित लंबाई वाले vector पर गणना करता है।

## 3. फ़ंक्शन कैसे काम करता है?

- `pure funcra forward(...)` एक typed function है जिसमें purity नियम लागू होते हैं।
- `needs width(weights) == len(features)` और `needs height(weights) == len(bias)` पहले आयामों की जाँच करते हैं।
- `matvec` से vector बनता है; `add` bias जोड़ता है; `softmax` बराबर दो मानों से `[0.5, 0.5]` देता है।
- `ensures len(result) == height(weights)` परिणाम की runtime जाँच है। यह औपचारिक गणितीय प्रमाण नहीं है।

## 4. सामान्य त्रुटियाँ

| स्थिति | कोड | क्या सुधारें |
| --- | --- | --- |
| Matrix के आयाम मेल नहीं खाते | `E0032` | `width`, `height` और `len` जाँचें |
| पंक्ति/कॉलम सीमा के बाहर हैं | `E0033` | वैध zero-based index दें |
| गणना के work budget की सीमा | `E0017` | अनावश्यक गणना घटाएँ |
| नया numeric buffer quota से अधिक | `E0036` | allocations कम करें या `--max-vector-bytes` जाँचें |

टाइल immutable हैं। उपलब्ध API में `tile`, `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd`, `tilescale` शामिल हैं। मनमाने आयाम वाले tensors, automatic broadcasting और `tile[row][column]` syntax अभी नहीं हैं। [न्यूमेरिकल संदर्भ](/hi/language/numerics), [त्रुटियाँ](/hi/reference/diagnostics) और [बजट](/hi/reference/budgets) पढ़ें।

**Compiler प्रमाण:** [प्रकाशित tiles guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md)। आगे [वेक्टर अभ्यास](/hi/tutorials/verified-vectors) और [मॉड्यूल अभ्यास](/hi/tutorials/modules-walkthrough) पढ़ें।

::: warning प्रयोगात्मक संस्करण
यह मार्गदर्शिका pinned compiler release के लिए है। कोई नया प्रोग्राम चलाने से पहले `scarp --version` की पुष्टि करें।
:::
