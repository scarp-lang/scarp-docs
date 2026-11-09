# Scientific Computing और AI — प्रकाशित सुविधाएँ और आगे की योजना

**नवीनतम प्रकाशित प्रायोगिक कंपाइलर:** [v0.0.6-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4), 8 नवंबर 2026। यह पृष्ठ प्रकाशित संख्यात्मक सुविधाओं और भविष्य के प्रस्तावों को अलग-अलग बताता है।

Scarp में immutable finite-float vectors, numeric tiles, matrix operations, कुछ statistical functions, softmax/ranking और स्पष्ट loss-gradient primitives हैं। अब sampled calculus और cosine similarity भी प्रकाशित alpha.4 में उपलब्ध हैं। Compiler का experimental Rust interpreter तथा सीमित Rust-hosted C11/ELF64 सुविधाएँ पूर्ण native compiler, GPU runtime या automatic differentiation नहीं बनातीं।

## Alpha.4 में प्रकाशित संख्यात्मक सुविधाएँ

`sample_area(x, y)`, `sample_slopes(x, y)`, `sample_cumulative_area(x, y)` और `cosine_similarity(left, right)` प्रकाशित `v0.0.6-alpha.4` का हिस्सा हैं, लेकिन पहले प्रकाशित alpha.3 में नहीं थे।

Integration वाले दोनों inputs की लंबाई बराबर और कम-से-कम दो होनी चाहिए; x निर्देशांक लगातार बढ़ते हों। संचयी क्षेत्रफल की पहली प्रविष्टि शून्य होती है और वैध उदाहरण में आख़िरी मान पूरे क्षेत्रफल के बराबर होता है। Cosine similarity दो गैर-शून्य और बराबर लंबाई वाले वेक्टरों की दिशा तुलना करता है। ये सीमित गणितीय फ़ंक्शन हैं, symbolic calculus या ML framework नहीं।

[पूरा हिन्दी संदर्भ](/hi/language/scientific-kernels-alpha4) और [चलने वाले उदाहरण](/hi/examples/) देखें। Compiler अपने मूल regression fixtures रखता है।

## Alpha.5 का विकास, अभी प्रकाशित नहीं

`pearson_correlation` तथा nucleus/top-p selection आगामी `v0.0.6-alpha.5` के **अप्रकाशित source candidate** में विकसित हो रहे हैं। प्रकाशित alpha.4 binary में इन्हें उपलब्ध न बताएँ। `scarp.math`, `scarp.tensor`, `scarp.science` और `scarp.ai` अभी import करने योग्य released namespaces नहीं हैं।

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
[compiler proposal 0038](https://github.com/scarp-lang/scarp/blob/main/docs/proposals/0038-scientific-computing-ecosystem.md),
और आज उपलब्ध features के लिए
[वेक्टर/टाइल](/hi/language/numerics) तथा
[built-ins](/hi/reference/library) देखें।

## रिलीज़ से पहले सत्यापन

नया feature तभी प्रकाशित माना जाए जब उसका compiler PR merge हो,
Linux, Windows, macOS और minimum Rust checks पास हों,
numerical correctness independently test हो और compatible compiler
की रिलीज़ वास्तव में प्रकाशित हो। पुराने tagged compiler के साथ
जुड़े verified code examples को बदलना नहीं चाहिए।
