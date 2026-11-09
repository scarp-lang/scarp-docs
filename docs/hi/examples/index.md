# सत्यापित Scarp उदाहरण

## प्रकाशित alpha.4 के नए अभ्यास

चलने वाले `.srp` पाठों का मुख्य स्थान [Scarp by Example](https://github.com/scarp-lang/scarp-by-example) है। कंपाइलर में मूल regression tests बने रहेंगे।

- [पाठ 12 — Temperature softmax](https://github.com/scarp-lang/scarp-by-example/blob/content-migration-alpha4-20261109/examples/06-ai-foundations/12-temperature-softmax.srp)
- [पाठ 13 — Cosine similarity](https://github.com/scarp-lang/scarp-by-example/blob/content-migration-alpha4-20261109/examples/06-ai-foundations/13-cosine-similarity.srp)
- [पाठ 14 — नमूनों का संचयी क्षेत्रफल](https://github.com/scarp-lang/scarp-by-example/blob/content-migration-alpha4-20261109/examples/06-ai-foundations/14-sample-cumulative-area.srp)
- [संग्रह अध्याय पाठ 13 — नमूनों का क्षेत्रफल और ढलान](https://github.com/scarp-lang/scarp-by-example/blob/content-migration-alpha4-20261109/examples/04-collections/13-sampled-calculus.srp)
- [AI अध्याय पाठ 15 — Top-K रैंकिंग](https://github.com/scarp-lang/scarp-by-example/blob/content-migration-alpha4-20261109/examples/06-ai-foundations/15-topk-ranking.srp)

ये पाठ प्रकाशित compiler `v0.0.6-alpha.4` की source/stdout फ़ाइलों पर आधारित हैं; इनके [माइग्रेशन PR #57](https://github.com/scarp-lang/scarp-by-example/pull/57) को merge होने तक `main` में उपलब्ध न मानें। [फ़ंक्शन का हिन्दी संदर्भ](/hi/language/scientific-kernels-alpha4) भी पढ़ें।


ये उदाहरण प्रकाशित compiler `v0.0.5-alpha.1` की fixtures से जुड़े हैं। केवल सिंटैक्स दिखाने के बजाय CI इनके अपेक्षित stdout की **byte-by-byte** तुलना करता है।

## नवीनतम alpha.6 का पूरा project पाठ

[दो files वाला, compiler-tested project और symbol-navigation tutorial](/hi/tutorials/project-symbol-navigation-alpha6) शुरू से करें। इसमें प्रकाशित alpha.6 source से `Scarp.project` बनाना, execution के बिना symbols/references जाँचना और सही interpreter output चलाना सिखाया गया है। नीचे के पुराने उदाहरण alpha.1 baseline के हैं।

## पहले प्रोग्राम से compiler tools तक सीखें

[सात चरणों वाला, हर release के अनुसार learning path](/hi/guide/learning-path) पढ़ें। उसके बाद यहाँ compiler के पूरे और प्रमाणित examples देखें। अलग चरणों के लिए **अलग प्रकाशित compiler versions** तय हैं; सभी पुराने examples को नवीनतम compiler में बिना जाँच न चलाएँ।

## Hello Scarp

~~~scarp
print("Hello from Scarp!");
~~~

आउटपुट में `Hello from Scarp!` के बाद newline होगा।

## सुरक्षित अंकगणित

`integer` में overflow और शून्य से भाग अस्वीकार किए जाते हैं। `print(1 + 2 * 3);` का आउटपुट `7` होता है।

## फ़ंक्शन और calls

`funcra` में parameters व return types घोषित होते हैं। `examples/functions.srp` में forward declarations, return और `unit` दिखते हैं।

## मॉड्यूल जोड़ना

`examples/module_demo.srp` दो relative source modules (`modules/linear.srp` और `modules/settings.srp`) import करके vector results दिखाता है।

## स्वचालित जाँच

`conformance/manifest.json` में 11 कार्यक्रमों और उनके expected outputs का प्रमाण है: `hello`, `functions`, `loops`, `repeat`, `output`, `vectors`, `module_demo`, `matrix_forward`, `matrix_classification`, `matrix_probabilities`, `matrix_targets`। `npm run check:fixtures` identities जाँचता है; `npm run test:compiler -- /path/to/scarp` वास्तविक interpreter output जाँचता है। [सत्यापन नीति](/hi/reference/evidence) पढ़ें। [फ़ंक्शन](/hi/tutorials/verified-functions), [लूप](/hi/tutorials/repeat-and-loops), [आउटपुट और newline](/hi/tutorials/verified-output), [न्यूमेरिकल वैक्टर](/hi/tutorials/verified-vectors) तथा [मॉड्यूल](/hi/tutorials/modules-walkthrough) और [टाइल](/hi/tutorials/verified-tiles) तथा [वर्गीकरण](/hi/tutorials/verified-classification) के पूरे प्रोग्राम चरणबद्ध चलाएँ। प्रकाशित compiler के 11 conformance उदाहरण दोनों भाषाओं में शामिल हैं।

## नवीनतम प्रकाशित alpha.2 उदाहरण

[Alpha.2 रिलीज़ गाइड](/hi/releases/v0.0.5-alpha.2) और [collections तथा learning tutorial](/hi/tutorials/alpha2-collections-and-learning) में **12 नए pinned programs** ([module constants और JSON tutorial](/hi/tutorials/alpha2-module-constants-and-inspection) सहित) हैं। इनके वास्तविक stdout और नए module text/JSON inspection की अलग CI जाँच होती है। नीचे के 11 पुराने उदाहरण अभी अलग alpha.1 baseline के हैं।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
print("Hello from Scarp!");
~~~

~~~scarp
print(1 + 2 * 3);            // 7
print((1 + 2) * 3);          // 9
print(-7 / 2);               // -3
~~~

~~~scarp
funcra add(a: integer, b: integer) -> integer {
    return a + b;
}
funcra square(value: integer) -> integer {
    return value * value;
}
print(add(10, square(5))); // 35
~~~

~~~sh
scarp run examples/module_demo.srp
scarp check examples/module_demo.srp
~~~
