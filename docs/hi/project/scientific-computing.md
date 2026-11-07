# Scientific Computing और AI — प्रस्तावित विकास

**स्थिति: यह विकास प्रस्ताव है, प्रकाशित Scarp लाइब्रेरी नहीं।**
अभी सत्यापित सार्वजनिक कंपाइलर का नवीनतम प्रीरिलीज़
[v0.0.6-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.3)
है। `scarp.math`, `scarp.tensor`, `scarp.science` और `scarp.ai`
जैसे नाम अभी वास्तविक standard-library namespace नहीं हैं।

## आज क्या उपलब्ध है?

Scarp में finite `float` वाले immutable vectors, दो-अक्ष के numeric tiles,
`matvec` और `matmul` जैसी matrix operations, कुछ statistics,
stable `softmax`, score ranking और विशेष loss-gradient kernels हैं।
कार्यक्रम सीमित संसाधनों वाले Rust interpreter से चलते हैं।
प्रयोगात्मक C11 backend केवल Rust API के विशेष scalar हिस्से के लिए है;
सामान्य native compiler, GPU tensors और पूरा automatic differentiation
framework अभी नहीं बने हैं।

## नया विकास: sampled calculus

[Compiler PR #153](https://github.com/scarp-lang/scarp/pull/153)
में दो नए, typed और pure functions का प्रस्ताव एवं implementation है:

| प्रस्तावित फ़ंक्शन | नतीजा | कार्य |
| --- | --- | --- |
| `sample_area(x, y)` | `float` | दिए गए samples से trapezoidal integration |
| `sample_slopes(x, y)` | `vector` | हर दो पड़ोसी samples के बीच औसत slope |

**ये फ़ंक्शन प्रकाशित alpha.3 में उपलब्ध नहीं हैं।**
किसी नए compatible compiler build के परीक्षण और आधिकारिक प्रकाशन
के बाद ही इन्हें released APIs मानना चाहिए।
[असली compiler branch का तकनीकी विवरण](https://github.com/scarp-lang/scarp/blob/feature/scientific-sampled-calculus/docs/sampled-calculus.md)
देख सकते हैं।

दोनों inputs की लंबाई बराबर और कम-से-कम 2 होनी चाहिए। Coordinates
strictly increasing होने चाहिए। ये numerical estimates हैं, symbolic
differentiation या बिल्कुल सही गणितीय integration का दावा नहीं करते।

## आगे काम का सही क्रम

1. **सही गणित:** numerical errors, precision, resource budgets, regression tests और benchmarks।
2. **वैज्ञानिक algorithms:** integration, differentiation, root finding और reliable solvers।
3. **Tensor types:** सुरक्षित shape, dimension, views और memory accounting।
4. **Scarp libraries:** `.srp` में ही simulation और AI programs लिखने योग्य APIs।
5. **Automatic differentiation:** gradients, optimizer, reproducible neural training।
6. **Performance:** सत्यापित CPU compiler, SIMD/parallel computing, उसके बाद GPU के अलग backend।

`scarp.math`, `scarp.stats`, `scarp.linalg`, `scarp.simulate`,
`scarp.units`, `scarp.optimize`, `scarp.ai` आदि इस समय
केवल **प्रस्तावित नाम** हैं; उन्हें अभी import नहीं किया जा सकता।

गहराई से योजना के लिए
[compiler proposal 0038](https://github.com/scarp-lang/scarp/blob/feature/scientific-sampled-calculus/docs/proposals/0038-scientific-computing-ecosystem.md),
और आज उपलब्ध features के लिए
[वेक्टर/टाइल](/hi/language/numerics) तथा
[built-ins](/hi/reference/library) देखें।

## रिलीज़ से पहले सत्यापन

नया feature तभी प्रकाशित माना जाए जब उसका compiler PR merge हो,
Linux, Windows, macOS और minimum Rust checks पास हों,
numerical correctness independently test हो और compatible compiler
की रिलीज़ वास्तव में प्रकाशित हो। पुराने tagged compiler के साथ
जुड़े verified code examples को बदलना नहीं चाहिए।
