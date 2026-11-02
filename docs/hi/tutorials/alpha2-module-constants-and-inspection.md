# Scarp alpha.2: module constants और source inspection

**Compiler: v0.0.5-alpha.2, प्रकाशित 2 नवंबर 2026।** इस ट्यूटोरियल में **तीन पूरे published examples** और उनके सही stdout दिए हैं। Imported source files को entry file से **पहले** दिखाया गया है, ताकि TypeScript validation फ़ाइल छूटने, बदलने या क्रम बिगड़ने को पहचान सके। अलग alpha.2 CI job सभी programs चलाकर output जाँचती है।

यह guide [प्रकाशित alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) के लिए है, पुराने [alpha.1 reference](/hi/reference/status) के लिए नहीं। Scarp अभी interpreter है; module inspection native executable नहीं बनाता।

## 1. तीन फ़ाइलों में compile-time constants

फ़ाइलों को नीचे दिए paths पर रखें। `import` का path **import करने वाली फ़ाइल** के directory से resolve होता है।

**`modules/constant_base.srp`** — सार्वजनिक literal constants:

~~~scarp
pub bind base = 10;
pub bind multiplier = 4;
pub bind label = "constant expressions";
~~~

**`modules/constants.srp`** — compile-time expressions और pure function:

~~~scarp
import "constant_base.srp" as settings;
bind step = 2;
pub bind answer = settings.base * settings.multiplier + step;
pub bind label = settings.label;
pub bind ready = answer == 42 and not false;
pub bind ratio = (1.5 * 2.0) / 4.0;

pub pure funcra adjust(value: integer = answer) -> integer
needs ready;
ensures result >= answer;
{
    return value;
}
~~~

**`constant_expressions.srp`** — मुख्य program:

~~~scarp
import "modules/constants.srp" as constants;
pub bind doubled = constants.answer * 2;
print(constants.label, constants.answer, doubled, constants.ready, constants.ratio, constants.adjust());
~~~

[प्रकाशित stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/constant_expressions.stdout):

~~~text
constant expressions 42 84 true 0.75 42
~~~

`settings.base * settings.multiplier + step` compiler के module preparation चरण में मूल्यांकित होता है। `pub bind doubled` भी module constant है। Pure function अपना default argument और module constants पढ़ सकता है। **Constant initializer में arbitrary runtime function calls, indexing, collections और side effects समर्थित नहीं हैं।** [Tagged reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/constant-expressions.md) देखें।

## 2. Program चलाए बिना module का निरीक्षण

**`modules/inspection.srp`** — public और private declarations:

~~~scarp
pub bind label = "module tools";
bind offset = 1;

pub pure funcra adjusted(value: integer, step: integer = 2) -> integer
    needs step >= 0;
    ensures result >= value;
{
    return helper(value) + step;
}

pure funcra helper(value: integer) -> integer {
    return value + offset;
}
~~~

**`module_inspection.srp`** — import और function call:

~~~scarp
import "modules/inspection.srp" as tools;
print(tools.label, tools.adjusted(39));
~~~

**`scarp run` पर अपेक्षित stdout:**

~~~text
module tools 42
~~~

अलग `scarp modules module_inspection.srp` command `print` execute **नहीं** करता। वह modules, imports, dependencies, visibility और function signatures की static सूची देता है। किसी private symbol का सूची में दिखना, दूसरी फ़ाइल से उसका import होना नहीं है। ऊपर का stdout पाने के लिए `scarp run` चलाएँ।

## 3. Versioned JSON में module metadata

**`inspection_json.srp`** — constants और function सहित source:

~~~scarp
pub bind base: integer = 6;
pub bind answer: integer = base * 7;
pure funcra echo(value: integer = answer) -> integer {
    return value;
}
print(echo());
~~~

**`scarp run` पर अपेक्षित stdout:**

~~~text
42
~~~

[प्रकाशित JSON inspection snapshot](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.modules.json) में execution output नहीं बल्कि source metadata रहता है:

~~~json
{"schema_version":1,"entry":0,"modules":[{"id":0,"path":"inspection_json.srp","imports":[],"dependencies":[],"dependents":[],"symbols":[{"name":"base","public":true,"span":[9,13],"kind":"constant","type":"integer"},{"name":"answer","public":true,"span":[37,43],"kind":"constant","type":"integer"},{"name":"echo","public":false,"span":[77,81],"kind":"function","pure":true,"result":"integer","parameters":[{"name":"value","type":"integer","has_default":true,"span":[82,87]}]}]}],"constant_dependencies":[{"source":0,"declaration":[37,43],"target":0,"target_declaration":[9,13],"span":[55,59]}]}
~~~

`schema_version: 1` JSON format का version है। `span` values **half-open UTF-8 byte offsets** हैं; ये Unicode-character columns नहीं। `constant_dependencies` में `answer` का `base` पर dependency दर्ज है। Native filesystem CLI का module path label इन-memory snapshot से **अलग हो सकता है**, क्योंकि loader वास्तविक filesystem path दिखा सकता है। Test स्थिर metadata और spans की जाँच करता है, path label को अलग मानने की अनुमति देता है।

## सही alpha.2 compiler से चलाएँ

**Alpha.2 executable** लें और `modules/` फ़ोल्डर का relative structure सुरक्षित रखें:

~~~sh
scarp check constant_expressions.srp
scarp run constant_expressions.srp
scarp modules module_inspection.srp
scarp modules --json inspection_json.srp
scarp run inspection_json.srp
~~~

सफल `check` कोई stdout नहीं लिखता। `run` ऊपर का परिणाम दिखाता है, जबकि `modules` static जानकारी देता है और `--json` machine-readable output चुनता है। इनमें native compilation या package installation उपलब्ध नहीं होता।

**प्रमाण:** [tagged source examples](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/examples), [module inspection reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-inspection.md) और [सत्यापन नीति](/hi/reference/evidence)।
