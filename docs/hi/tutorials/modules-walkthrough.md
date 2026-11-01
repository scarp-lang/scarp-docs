# Source modules के साथ प्रोग्राम बनाना

Scarp **v0.0.5-alpha.1** में अलग-अलग `.srp` फ़ाइलों से मॉड्यूल आयात किए जा सकते हैं। पुराने alpha.4 रिलीज़ में यह सुविधा उपलब्ध नहीं थी।

## 1. फ़ोल्डर संरचना

एक मुख्य `main.srp` और `modules/` के अंदर `settings.srp`, `linear.srp` बनाएँ। Imports हमेशा आयात करने वाली फ़ाइल के स्थान से relative होते हैं।

## 2. सेटिंग मॉड्यूल

~~~scarp
// modules/settings.srp
pub bind title = "Modular inference";
pub bind gain = 1.0;
~~~

`pub bind` केवल immutable scalar constant को दूसरे मॉड्यूल में उपलब्ध कराता है। रनटाइम module globals अभी नहीं हैं।

## 3. गणना वाला मॉड्यूल

~~~scarp
// modules/linear.srp
import "settings.srp" as settings;
pub pure funcra predict(features: vector) -> vector {
    bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
    return scale(matvec(weights, features), settings.gain);
}
~~~

Library में फ़ाइल-स्तर के `print`, `var` या गणना वाले constants नहीं लिख सकते; गणना फ़ंक्शन में करें।

## 4. मुख्य प्रोग्राम

~~~scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;
print(settings.title);
print(linear.predict([2.0, 1.0]));
~~~

मुख्य फ़ाइल को `scarp run main.srp` से चलाएँ और `scarp check main.srp` से जाँचें।

## 5. सीमाएँ

मॉड्यूल import में `as` alias अनिवार्य है। Wildcard imports, re-exports, network imports और चक्रीय imports उपलब्ध नहीं हैं। पथ project की trusted root से बाहर नहीं जा सकता। अधिक जानकारी [मॉड्यूल संदर्भ](/hi/language/modules) में है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

```text
my-program/
  main.srp
  modules/
    settings.srp
    linear.srp
```

```scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
```

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

```scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;

bind scores = linear.predict([2.0, 1.0]);
print(settings.title);
print(scores);
print(argmax(scores), onehot(len(scores), argmax(scores)));
```

```sh
scarp check main.srp
scarp run main.srp
```

```text
Modular inference
[4.0, 1.0]
0 [1.0, 0.0]
```
