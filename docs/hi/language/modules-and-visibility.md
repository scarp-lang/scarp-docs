# Scarp modules: public API, imports और static inspection

<!-- scarp-modules-release: v0.0.5-alpha.1+v0.0.5-alpha.2 -->

यह पाठ **प्रकाशित Scarp compiler** के सत्यापित उदाहरणों पर आधारित है। [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) में local file imports तथा public/private visibility समर्थित हैं। [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) में सीमित compile-time constant expressions और static `scarp modules` inspection उपलब्ध है। [सबसे नया प्रकाशित alpha.3](/hi/releases/v0.0.5-alpha.3) है; भाषा अभी **stable नहीं** है।

::: warning सही release चुनें
Alpha.1 example का compiler commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671` है। Alpha.2 examples और diagnostics का commit `e4db8e191cd7ea623123cae7348450ca6c95b170` है। GitHub CI दोनों को अलग-अलग **वास्तविक tagged compiler** पर जाँचती है। **Alpha.1 पर alpha.2 का `modules` command या computed constants नहीं चलाएँ।** इन परीक्षणों से सभी versions की compatibility की गारंटी भी नहीं मिलती।
:::

## 1. तीन फ़ाइलों में module graph (alpha.1)

Module एक UTF-8 `.srp` file है। `import "relative/path.srp" as alias;` के माध्यम से दूसरी file के **public** members का उपयोग कर सकते हैं। Import path **import करने वाली file के relative** होता है, केवल entry file के relative होना ज़रूरी नहीं।

प्रकाशित [module example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp) के अनुसार यह folder structure बनाएँ:

~~~text
module_demo.srp
modules/
  settings.srp
  linear.srp
~~~

पहले `modules/settings.srp` में public immutable scalar constants लिखें:

~~~scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
~~~

फिर `modules/linear.srp` में उसी directory की `settings.srp` import करें और public pure function export करें:

~~~scarp
import "settings.srp" as settings;

pub pure funcra predict(features: vector) -> vector
    needs len(features) == 2;
    ensures len(result) == 2;
{
    bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
    return scale(matvec(weights, features), settings.gain);
}
~~~

अंत में entry `module_demo.srp` बनाएँ:

~~~scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;

bind scores = linear.predict([2.0, 1.0]);
print(settings.title);
print(scores);
print(argmax(scores), onehot(len(scores), argmax(scores)));
~~~

प्रकाशित expected stdout:

~~~text
Modular inference
[4.0, 1.0]
0 [1.0, 0.0]
~~~

Entry file `settings.title` पढ़ती है और `linear.predict(...)` चलाती है। यह function अपने module के `settings.gain` का उपयोग करके vector/matrix calculation करता है। चलाने से पहले पूरा import graph load, check और link होता है। `pub` declaration दूसरी files में दिखाई देती है; private helper केवल अपने module में उपयोग किया जा सकता है।

### Alpha.1 compiler से कैसे चलाएँ?

पूरे `modules/` folder और `module_demo.srp` को साथ रखें। **Alpha.1** executable से चलाएँ:

~~~sh
scarp --version
scarp check module_demo.srp
scarp run module_demo.srp
~~~

सफल `check` चुप रहता है, जबकि `run` ऊपर की तीन lines देता है। `check` को alpha.3 के static-only `verify` जैसा नहीं समझें। [पुराना modules reference](/hi/language/modules) और [loading/security नियम](/hi/reference/source-loading) पढ़ें।

## 2. Public और private declarations देखें (alpha.2)

यह उदाहरण प्रकाशित [alpha.2 inspector entry](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/module_inspection.srp) से लिया गया है।

पहले `modules/inspection.srp` बनाएँ:

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

फिर `module_inspection.srp`:

~~~scarp
import "modules/inspection.srp" as tools;
print(tools.label, tools.adjusted(39));
~~~

**केवल program `run` करने पर expected stdout:**

~~~text
module tools 42
~~~

Library में public `label` और `adjusted` उपलब्ध हैं, जबकि `offset` और `helper` **private** हैं। Public function अपने private helper को call कर सकता है। Entry में `tools.adjusted(39)` चलेगा, लेकिन `tools.helper(...)` अथवा `tools.offset` की external access नहीं मिलेगी।

**महत्त्वपूर्ण अंतर:** `scarp modules module_inspection.srp` imports, dependency graph, public/private symbols, function purity, parameter types और defaults की *static सूची* बनाता है। यह entry का `print` या सामान्य function body **execute नहीं** करता। Private symbols inspection में दिख सकते हैं, लेकिन इससे वे public **नहीं** हो जाते। ऊपर दिया stdout केवल `run` से मिलेगा।

## 3. Alpha.2 JSON metadata समझें

आधिकारिक [`inspection_json.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.srp) फ़ाइल बनाएँ:

~~~scarp
pub bind base: integer = 6;
pub bind answer: integer = base * 7;
pure funcra echo(value: integer = answer) -> integer {
    return value;
}
print(echo());
~~~

**`scarp run inspection_json.srp` का output:**

~~~text
42
~~~

प्रकाशित [module JSON snapshot](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.modules.json) में runtime output नहीं, केवल source metadata होता है:

~~~json
{"schema_version":1,"entry":0,"modules":[{"id":0,"path":"inspection_json.srp","imports":[],"dependencies":[],"dependents":[],"symbols":[{"name":"base","public":true,"span":[9,13],"kind":"constant","type":"integer"},{"name":"answer","public":true,"span":[37,43],"kind":"constant","type":"integer"},{"name":"echo","public":false,"span":[77,81],"kind":"function","pure":true,"result":"integer","parameters":[{"name":"value","type":"integer","has_default":true,"span":[82,87]}]}]}],"constant_dependencies":[{"source":0,"declaration":[37,43],"target":0,"target_declaration":[9,13],"span":[55,59]}]}
~~~

- `schema_version: 1` JSON format का version है।
- `modules` में module IDs, imports, dependencies, dependents तथा symbols हैं।
- `symbols` में `public: true` और `public: false`, घोषित types तथा function parameters दर्ज हैं।
- `constant_dependencies` बताता है कि `answer`, `base` पर निर्भर है।
- `span` entries **source-local UTF-8 bytes की half-open ranges** हैं, Unicode character index नहीं।
- Published snapshot in-memory loader का है। Filesystem CLI का `path` label अलग दिख सकता है; इसे **cross-machine स्थायी ID** न मानें।

`base * 7` जैसे computed module constants **alpha.2** में समर्थित हैं। मूल **alpha.1** में module constant के लिए केवल सीमित literal forms थीं। `modules` command static import/type जाँच करता है, program execute नहीं करता। इससे package manager, native compiler या Scarp के लिए JSON parser उपलब्ध नहीं हो जाता।

### Alpha.2 compiler पर run और inspect करें

`module_inspection.srp`, `inspection_json.srp` और उसका `modules/` folder साथ रखें। **Alpha.2** executable चलाएँ:

~~~sh
scarp --version
scarp check module_inspection.srp
scarp run module_inspection.srp
scarp modules module_inspection.srp
scarp modules --json inspection_json.srp
scarp run inspection_json.srp
~~~

`modules --json` static machine-readable metadata देता है, `run` actual program output देता है। [Alpha.2 tooling reference](/hi/tooling/alpha2-inspection) और [three-file constants tutorial](/hi/tutorials/alpha2-module-constants-and-inspection) देखें।

## 4. असफल example: private symbol access (alpha.2 E0041)

Visibility compiler द्वारा लागू की जाती है। प्रकाशित [`library.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/library.srp) को `private.srp` के साथ एक directory में रखें:

~~~scarp
// café 🌍
bind secret = 3;
pub bind value = 4;
pub pure funcra take(x: integer) -> integer { return x; }
~~~

अब प्रकाशित [`private.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/private.srp) बनाएँ:

~~~scarp
import "library.srp" as library;
print(library.secret);
~~~

**Exact published compiler stderr:**

~~~text
error[E0041]: library.secret is private
 --> private.srp:2:7
  |
2 | print(library.secret);
  |       ^^^^^^^^^^^^^^
 = note: the private declaration is here
 --> library.srp:2:6
  |
2 | bind secret = 3;
  |      ^^^^^^
 = help: mark the declaration pub in its defining module
~~~

**गलती क्यों हुई?** `library.secret` मौजूद है, लेकिन उसके आगे `pub` नहीं है। `E0041` गलत access और मूल declaration दोनों की जगह दिखाता है। ज़रूरत होने पर `pub` के माध्यम से API export करें; अन्यथा private member को private ही रखें। इस tagged fixture में `check` और `run` दोनों का exit code **1** तथा stdout **खाली** है।

## 5. असफल example: circular import (alpha.2 E0039)

दो modules एक-दूसरे को import करें तो dependency cycle बनती है, भले किसी symbol का उपयोग न किया जाए। पहले प्रकाशित [`loop.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/loop.srp) बनाएँ:

~~~scarp
import "cycle.srp" as cycle;
~~~

फिर प्रकाशित [`cycle.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/cycle.srp):

~~~scarp
import "loop.srp" as loop;
~~~

**Exact compiler stderr:**

~~~text
error[E0039]: circular import reaches "cycle.srp"
 --> loop.srp:1:8
  |
1 | import "cycle.srp" as cycle;
  |        ^^^^^^^^^^^
 = note: this import continues the cycle
 --> cycle.srp:1:8
  |
1 | import "loop.srp" as loop;
  |        ^^^^^^^^^^
 = help: remove an import edge; mutually recursive functions belong in one module
~~~

**गलती क्यों हुई?** `cycle.srp` → `loop.srp` → फिर `cycle.srp` import होने से cycle बनती है। `E0039` दोनों संबंधित import edges दिखाता है। एक import हटाएँ या जुड़े हुए functions को एक ही module में रखें। इस fixture पर भी `check` और `run` दोनों exit code **1** तथा खाली stdout देते हैं।

## 6. याद रखने वाले module नियम

| नियम | अर्थ |
| --- | --- |
| `import "file.srp" as alias;` | Explicit local file import; wildcard/network/package import नहीं |
| `pub bind name = ...;` | Immutable scalar constant export; **alpha.1 literal-only**, **alpha.2 में restricted scalar expressions** |
| `pub pure funcra ...` | Public function export; उसी module के private helpers उपयोग कर सकता है |
| `alias.member` | Imported member का नाम; automatic re-export या unqualified import नहीं |
| `scarp modules <path>` | Alpha.2 में static inventory; program execution नहीं |
| `scarp modules --json <path>` | Alpha.2 schema-v1 metadata; runtime stdout नहीं |
| `E0041` | Private symbol दूसरे module से उपलब्ध नहीं |
| `E0039` | Circular import, dependency graph को बदलें |

Imports trusted source root तक सीमित हैं। Unsafe traversal, absolute/URI paths और network से files लाना समर्थित नहीं है। Filesystem loader **hostile concurrent changes के विरुद्ध पूर्ण security sandbox नहीं** है। अधिक जानकारी [source loading](/hi/reference/source-loading), [runtime budgets](/hi/reference/budgets) और [published feature matrix](/hi/reference/status) में है।

**प्रमाण:** पाँचों published program/error cases और JSON snapshot को release-specific fixtures से मिलाया जाता है। TypeScript English और Hindi में पूरे source/output blocks सत्यापित करता है; GitHub CI अलग compiler versions पर success, failure तथा static inspection के tests चलाती है।
