# प्रकाशित संख्यात्मक फ़ंक्शन — Scarp v0.0.6-alpha.3 और alpha.4

> **रिलीज़ सीमा:** यह मार्गदर्शिका प्रकाशित प्री-रिलीज़ [v0.0.6-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4) और उसके स्रोत कमिट `f04be0758cbce405ddcdb229699b0ff83c09d207` पर आधारित है। `main` पर विकसित होने वाली सुविधाओं को रिलीज़ हुई सुविधा नहीं माना गया है।

Scarp के सीमित और शुद्ध संख्यात्मक फ़ंक्शन immutable finite-float vectors पर काम करते हैं। ये अभी experimental interpreter में चलते हैं; GPU, automatic differentiation, पूरे tensor framework या प्रशिक्षित AI मॉडल के बराबर नहीं हैं।

## कौन-सा फ़ंक्शन कब प्रकाशित हुआ?

| फ़ंक्शन | पहली प्रकाशित प्री-रिलीज़ | उपयोग |
| --- | --- | --- |
| `softmax_temp(vector, float)` | `v0.0.6-alpha.3` | तापमान के अनुसार संभावनाएँ |
| `logsoftmax_temp(vector, float)` | `v0.0.6-alpha.3` | लॉग-संभावनाएँ |
| `topk(vector, integer)` | `v0.0.6-alpha.3` | मूल इंडेक्स की निश्चित रैंकिंग |
| `cosine_similarity(vector, vector)` | `v0.0.6-alpha.4` | वेक्टर की दिशा की तुलना |
| `sample_area`, `sample_slopes`, `sample_cumulative_area` | `v0.0.6-alpha.4` | नमूने के आधार पर क्षेत्रफल और ढलान |

## तापमान और Top-K

~~~scarp
print(softmax_temp([2.0, 2.0], 0.5));
print(logsoftmax_temp([5.0], 2.0));
bind logits = [1.0, 4.0, 4.0, 2.0];
print(topk(softmax_temp(logits, 0.5), 3));
~~~

आउटपुट:

~~~text
[0.5, 0.5]
[0.0]
[integer: 1, 2, 3]
~~~

Temperature सीमित और शून्य से बड़ा होना चाहिए। Top-K यादृच्छिक sampling नहीं करता। [उदाहरण 12](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/12-temperature-softmax.srp) देखें।

## कोसाइन समानता

~~~scarp
print(cosine_similarity([3.0, 4.0], [6.0, 8.0]));
print(cosine_similarity([1.0, 0.0], [0.0, 1.0]));
print(cosine_similarity([3.0], [-4.0]));
~~~

आउटपुट:

~~~text
1.0
0.0
-1.0
~~~

दोनों वेक्टरों की लंबाई बराबर और शून्य से अधिक होनी चाहिए, और कोई भी पूरा zero vector नहीं हो सकता। [उदाहरण 13](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/13-cosine-similarity.srp) देखें।

## नमूनों का संचयी क्षेत्रफल

~~~scarp
bind time = [0.0, 1.0, 3.0, 4.0];
bind speed = [0.0, 2.0, 6.0, 8.0];
print(sample_cumulative_area(time, speed));
print(sample_area(time, speed));
~~~

आउटपुट:

~~~text
[0.0, 1.0, 9.0, 16.0]
16.0
~~~

दोनों वेक्टरों में कम-से-कम दो मान, समान लंबाई और समय जैसे x निर्देशांकों में सख्ती से बढ़ता क्रम होना चाहिए। यह numerical integration है, symbolic calculus नहीं। [उदाहरण 14](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/14-sample-cumulative-area.srp) देखें।

## माइग्रेशन में कौन-सी फ़ाइल कहाँ रहे?

- [scarp-docs](https://github.com/scarp-lang/scarp-docs) सार्वजनिक API और हिन्दी/अंग्रेज़ी मार्गदर्शिकाओं का मुख्य स्थान है।
- [scarp-by-example](https://github.com/scarp-lang/scarp-by-example) चलने वाले पाठ, अभ्यास और exact stdout का मुख्य स्थान है।
- [scarp compiler](https://github.com/scarp-lang/scarp/tree/v0.0.6-alpha.4/examples) मूल regression fixtures और तकनीकी परीक्षण रखता रहेगा।
- विकास में मौजूद `v0.0.6-alpha.5` की `pearson_correlation` या nucleus/top-p सुविधा **प्रकाशित alpha.4 का हिस्सा नहीं** है।

[संगतता जाँच](/hi/reference/compatibility) और [वैज्ञानिक कंप्यूटिंग का रोडमैप](/hi/project/scientific-computing) भी देखें।
