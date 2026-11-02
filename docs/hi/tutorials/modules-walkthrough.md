# Source modules से प्रोग्राम बनाना

यह उदाहरण प्रकाशित **Scarp v0.0.5-alpha.1** इंटरप्रेटर के लिए है। पुराने `v0.0.4-alpha.4` में `import` सुविधा नहीं थी। यहाँ दिखाई गई तीनों फ़ाइलों का पूरा कोड और वास्तविक stdout pinned compiler fixtures के अनुसार जाँचा जाता है।

## 1. प्रोजेक्ट का फ़ोल्डर बनाएँ

इस संरचना में `main.srp` मुख्य प्रोग्राम है और `modules/` में दो लाइब्रेरी फ़ाइलें हैं:

```text
my-program/
  main.srp
  modules/
    settings.srp
    linear.srp
```

`import` वाले पथ को import करने वाली फ़ाइल के स्थान से समझा जाता है। फ़ाइलें UTF-8 में सेव करें।

## 2. सेटिंग्स मॉड्यूल बनाएँ

`modules/settings.srp` में यह **पूरा और बिना बदला** उदाहरण लिखें:

```scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
```

`pub bind` से केवल समर्थित immutable scalar constants दूसरे मॉड्यूल को दिखाई देते हैं। रनटाइम पर mutable global values बनाने की सुविधा अभी उपलब्ध नहीं है।

## 3. गणना वाला फ़ंक्शन मॉड्यूल बनाएँ

`modules/linear.srp` में यह कोड लिखें:

```scarp
import "settings.srp" as settings;

pub pure funcra predict(features: vector) -> vector
    needs len(features) == 2;
    ensures len(result) == 2;
{
    bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
    return scale(matvec(weights, features), settings.gain);
}
```

इसमें `settings.srp` का पथ `linear.srp` के सापेक्ष है। `pure` फ़ंक्शन के प्रभाव सीमित करता है। `needs` और `ensures` वास्तविक runtime checks हैं; ये गणितीय शुद्धता का औपचारिक प्रमाण नहीं हैं। `tile` और `matvec` का उपयोग मैट्रिक्स और वैक्टर की गणना में होता है।

## 4. मुख्य प्रोग्राम बनाएँ

`main.srp` में निम्न पूरा कोड सेव करें:

```scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;

bind scores = linear.predict([2.0, 1.0]);
print(settings.title);
print(scores);
print(argmax(scores), onehot(len(scores), argmax(scores)));
```

प्रोजेक्ट के मूल फ़ोल्डर से पहले `check` और फिर `run` करें:

```sh
scarp check main.srp
scarp run main.srp
```

`run` का अपेक्षित stdout बिल्कुल यही है:

```text
Modular inference
[4.0, 1.0]
0 [1.0, 0.0]
```

परीक्षणों में इन तीनों Scarp फ़ाइलों का पूरा सोर्स और इस stdout का मिलान प्रकाशित रिलीज़ के fixtures से होता है। केवल ऐसा दिखने वाला कोड पर्याप्त नहीं माना जाता जो सही हो सकता है।

## 5. सीमाएँ और सुरक्षा समझें

Main फ़ाइल के parent directory से trusted import root तय होता है। Imports के नाम relative `.srp` पथ होते हैं; absolute paths, root से बाहर जाने वाले paths, network imports, wildcard imports, cycles और re-exports अभी समर्थित नहीं हैं। Library में top-level `print` या `var` की जगह सही `pub` फ़ंक्शन या सीमित constants का इस्तेमाल करें।

[मॉड्यूल संदर्भ](/hi/language/modules), [सोर्स सुरक्षा](/hi/reference/source-loading) और [न्यूमेरिकल वैक्टर अभ्यास](/hi/tutorials/verified-vectors) देखें।

**Compiler प्रमाण:** [मॉड्यूल नियम](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md), [main fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp), [linear.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/linear.srp), [settings.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/settings.srp)।
