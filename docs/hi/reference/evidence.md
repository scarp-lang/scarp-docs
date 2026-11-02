# Scarp दस्तावेज़ों का सत्यापन

दस्तावेज़ में कोई सुविधा “implemented” तभी कही जाती है, जब उसका **प्रकाशित compiler source और tests** में प्रमाण मिले। वर्तमान pinned version `v0.0.5-alpha.1` है।

**नया प्रकाशित संस्करण:** [v0.0.5-alpha.2](/hi/releases/v0.0.5-alpha.2) 2 नवंबर को जारी हुआ। इसके **पाँच अलग प्रोग्राम और 10 source/output फ़ाइलें** प्रकाशित टैग से लिए गए हैं। `npm run check:alpha2` hash और द्विभाषी code/output जाँचता है; अलग `alpha2-conformance` CI job commit `e4db8e191cd7ea623123cae7348450ca6c95b170` पर compiler build करके प्रोग्राम वास्तव में चलाती है। नीचे की पुरानी 11-case suite अलग **alpha.1** baseline के लिए है।

## तीन स्तरों की जाँच

1. **Markdown/लिंक:** `npm run check:docs` से pages, navigation, anchors और आवश्यक metadata जाँचें।
2. **Fixture पहचान:** `npm run check:fixtures` 11 प्रकाशित Scarp उदाहरणों की 24 source/output फ़ाइलों की pinned Git blob hashes जाँचता है।
3. **वास्तविक execution:** CI में compiler को exact tagged commit से build करके source और expected stdout byte-by-byte जाँचे जाते हैं।

VitePress का सफल build यह प्रमाण नहीं कि `.srp` कोड चलता है। केवल source proposal से किसी नई सुविधा की घोषणा नहीं करें।

`npm run check:snippets` पुराना Scarp syntax और अनुपलब्ध CLI commands वाले runnable code fences पकड़ता है। `npm run check:tutorial-evidence` सभी 11 स्रोत-आउटपुट जोड़ों की हिन्दी और अंग्रेज़ी पृष्ठों से तुलना करता है। ये static checks हैं; वास्तविक compiler execution अलग CI job में होता है।

## अपने कंप्यूटर पर दोहराएँ

~~~sh
npm install
npm run check:docs
npm run check:fixtures
npm run docs:build
~~~

Compiler conformance test के लिए tag `afe8b5380c9d6c4774162e51c6c9bc8b90901671` का interpreter build करें, फिर `npm run test:compiler -- /path/to/scarp` चलाएँ।

## नए release के समय

Tag, change log, tests, baseline JSON, source hashes, feature-status और दोनों भाषाओं के pages साथ अपडेट करें। [रखरखाव सूची](/hi/project/maintenance) में प्रक्रिया दी है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

```sh
npm run check:docs
npm run check:fixtures
```

```sh
npm run check:fixtures -- /path/to/scarp/examples
npm run check:evidence -- /path/to/scarp
npm run test:compiler -- /path/to/scarp/target/debug/scarp
```
