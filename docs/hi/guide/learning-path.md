# Scarp सीखने का पूरा रास्ता: पहला प्रोग्राम से project tooling तक

<!-- scarp-learning-release: v0.0.6-alpha.1 -->
<!-- scarp-learning-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

**Scarp पहली बार सीख रहे हैं तो यहाँ से शुरुआत करें।** यह मार्गदर्शिका शुरुआती प्रोग्राम से numerical examples, source modules, project और **[प्रकाशित v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)** में आए symbol-navigation tools तक पहुँचाती है। हर पाठ के examples compiler के वास्तविक परीक्षणों पर आधारित हैं।

Scarp अभी **experimental prerelease** है। ऐसा **कोई प्रमाण नहीं** कि हर पुराने tutorial का code एक ही नए binary में बिना बदलाव चलेगा। इसलिए **पढ़ाई इसी क्रम में करें**, लेकिन code चलाते समय **उस tutorial का बताया हुआ exact release** प्रयोग करें या दूसरे release पर स्वयं जाँचें। मुख्य भाषा-संदर्भ अभी v0.0.5-alpha.1 से सत्यापित है; नए features अलग release-specific पाठ में लिखे हैं।

## अपनी शुरुआत चुनें

| आपका लक्ष्य | कौन सा चरण शुरू करें? | कौन सा release चाहिए? |
| --- | --- | --- |
| Scarp बिलकुल नया है | [चरण 1: बुनियाद](#stage-1-foundations) | पुराने fixtures चलाने के लिए **alpha.1** |
| `bind`, `var`, `funcra` समझते हैं | [चरण 2: modules और गणित](#stage-2-modules-and-numerical-examples) | प्रमाणित **alpha.1** |
| Collections और नए data tools चाहिए | [चरण 3: alpha.2](#stage-3-typed-values-collections-and-diagnostics) | **v0.0.5-alpha.2** |
| Compiler से file की static जाँच चाहिए | [चरण 4: CLI](#stage-4-static-compiler-cli) | **v0.0.5-alpha.3** |
| पूरा project directory बनाना है | [चरण 5: project](#stage-5-verified-project-workflow) | **v0.0.5-alpha.4** |
| Project modules को inspect करना है | [चरण 6: inspection](#stage-6-project-module-inspection) | **v0.0.5-alpha.5** |
| नवीनतम प्रकाशित सुविधाएँ सीखनी हैं | [चरण 7: symbols और RMS](#stage-7-source-navigation-and-rms) | **v0.0.6-alpha.1** |

**नए alpha.6 installation** के लिए [प्रकाशित alpha.6 release](/hi/releases/v0.0.6-alpha.1) से Windows x64, Linux x64 या macOS ARM64 archive और उसका checksum लें। डाउनलोड की गई file चलाने **से पहले SHA-256** मिलाएँ। [Alpha.5 की पुरानी installation guide](/hi/guide/installation-alpha5) के archive नाम alpha.6 के लिए नहीं हैं। Terminal में वास्तव में कौन सा compiler चल रहा है, यह जाँचें:

~~~sh
scarp version
~~~

यदि किसी पुराने compiler को नहीं चला सकते, तो उसका ऐतिहासिक पाठ पढ़ सकते हैं। लेकिन बाद वाले compiler में उसी code की compatibility **मानकर न चलें**। अभी के end-to-end प्रयोग के लिए [alpha.6 project lab](/hi/tutorials/project-symbol-navigation-alpha6) अपनाएँ।

## Stage 1: Foundations — बुनियाद

<!-- scarp-learning-stage: foundations v0.0.5-alpha.1 -->

**प्रमाणित sample release: [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1).** पहले जानें कि UTF-8 `.srp` source file क्या होती है और statement के अंत में `;` क्यों लिखा जाता है।

1. [पहला प्रोग्राम](/hi/guide/first-program): एक `.srp` file बनाएँ; पुराने `scarp run` और नए Scarp-first CLI के बीच अंतर समझें।
2. [Variables और scopes](/hi/language/variables): immutable `bind`, mutable `var`, assignment और shadowing।
3. [सत्यापित functions](/hi/tutorials/verified-functions): `funcra`, return value, parameters और contracts।
4. [Repeat तथा while loops](/hi/tutorials/repeat-and-loops): दो loop प्रकार और उनकी सीमाएँ।
5. [Output तथा newline](/hi/tutorials/verified-output): प्रोग्राम stdout कैसे बनाता है।

**अभ्यास:** समझाएँ कि `bind` को दोबारा assign क्यों नहीं कर सकते। Function का return type पहचानें और compiler की `.stdout` fixture देखने से **पहले** output का अनुमान लगाएँ। Alpha.1 का पुराना `check` और alpha.3 का static `verify` एक जैसा व्यवहार नहीं रखते।

## Stage 2: Modules and numerical examples — मॉड्यूल और गणना

<!-- scarp-learning-stage: modules-numerics v0.0.5-alpha.1 -->

**प्रमाणित release: v0.0.5-alpha.1।** यह सीमित लेकिन वास्तविक numerical programming सिखाता है—इसका अर्थ पूर्ण tensor system, automatic differentiation या GPU runtime नहीं है।

1. [Source modules tutorial](/hi/tutorials/modules-walkthrough): relative `import`, `pub` और दूसरी source file से function लेना।
2. [सत्यापित vectors](/hi/tutorials/verified-vectors): `len`, `sum`, `mean`, `dot` और vector operations।
3. [सत्यापित tiles](/hi/tutorials/verified-tiles): वर्तमान सीमित numerical tile representation।
4. [Classification और probabilities](/hi/tutorials/verified-classification): पूरा matrix inference program, `softmax` और `onehot`।

**अभ्यास:** बताइए कि किसी local module को import करना इंटरनेट से package डाउनलोड करना क्यों नहीं है। एक vector या classification example का output **उसके alpha.1 compiler** से पुनः जाँचें। [11 baseline conformance programs](/hi/reference/evidence) वास्तविक परीक्षण हैं, केवल कल्पित syntax नहीं।

## Stage 3: Typed values, collections and diagnostics — नए data प्रकार

<!-- scarp-learning-stage: collections-diagnostics v0.0.5-alpha.2 -->

**प्रमाणित release: [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)।** इन नए features को पिछली alpha.1 release का हिस्सा न समझें।

1. [Typed bindings और conversions](/hi/language/typed-bindings-alpha2): प्रकारों की घोषणा और स्पष्ट numeric conversion।
2. [Bitwise operators](/hi/language/bitwise-operators-alpha2): masks, shifts और errors।
3. [Unicode और text queries](/hi/language/unicode-text): Unicode character बनाम raw bytes।
4. [Integer collections, scores और probabilities](/hi/tutorials/alpha2-collections-and-learning): tag से मिले exact source और stdout।
5. [Diagnostics और सुधार](/hi/tutorials/alpha2-diagnostics-and-repairs): असफल program को पहचानें और सही error समझें।

**अभ्यास:** alpha.2 example का stdout पढ़ें और एक negative test के error को समझाएँ। [Alpha.1 से alpha.2 upgrade check](/hi/reference/upgrade-readiness) ने केवल **11 चुने हुए पुराने programs** जाँचे हैं; पूरे language की compatibility सिद्ध नहीं की है।

## Stage 4: Static compiler CLI — बिना execute किए जाँच

<!-- scarp-learning-stage: static-cli v0.0.5-alpha.3 -->

**प्रमाणित command release: [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)।**

1. [Alpha.3 file quickstart](/hi/guide/quickstart-alpha3): `scarp exec FILE.srp` और `scarp verify FILE.srp`।
2. [Scarp-first CLI reference](/hi/tooling/cli): `inspect`, `diagnose` और structured error format।
3. [प्रकाशित alpha.3 examples](/hi/releases/v0.0.5-alpha.3): source और output का संस्करण-विशिष्ट प्रमाण।

**अभ्यास:** बताइए कि `verify` कोड की static जाँच क्यों है और `exec` उसे वास्तव में क्यों चलाता है। Alpha.3 में `create` या `launch` का दावा न करें; ये अगली प्रकाशित release में आए थे।

## Stage 5: Verified project workflow — पूरा project बनाएँ

<!-- scarp-learning-stage: projects v0.0.5-alpha.4 -->

**प्रमाणित command release: [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4)।**

1. [Project quickstart](/hi/guide/quickstart-alpha4): असली compiler-generated `Scarp.project` और `scarp create`, `verify PROJECT_DIRECTORY`, `launch PROJECT_DIRECTORY`।
2. [File से project migration](/hi/guide/migrate-alpha3-to-alpha4): पुराने alpha.3 file commands तथा नए directory commands का अंतर।
3. [Alpha.4 release evidence](/hi/releases/v0.0.5-alpha.4): manifest format और source loading की सुरक्षा।

**अभ्यास:** बिल्कुल नया folder बनाएँ। `create` पहले से मौजूद खाली directory को भी overwrite नहीं करता। Manifest की `entry` file पहचानें, बिना runtime चलाए verify करें, फिर interpreter से launch करें। यहाँ package registry या native `.srp` executable build नहीं है।

## Stage 6: Project module inspection — मॉड्यूल की static सूची

<!-- scarp-learning-stage: project-inspection v0.0.5-alpha.5 -->

**प्रमाणित command release: [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5)।**

1. [Alpha.5 CLI](/hi/tooling/cli-alpha5): `scarp inspect modules --json PROJECT_DIRECTORY`।
2. [Alpha.5 रिलीज़](/hi/releases/v0.0.5-alpha.5): कौन सा project inspection इसी release में आया।
3. [सीमित C11 Rust API](/hi/reference/c11-backend-alpha5): प्रयोगात्मक emitter सिर्फ **Rust embedding** में है; `scarp compile` command उपलब्ध नहीं है।

**अभ्यास:** समझाएँ कि एक **explicit** project directory और automatic workspace discovery में क्या अंतर है। दूसरा विकल्प अभी उपलब्ध नहीं है। Static inspection को runtime execution trace नहीं मानें।

## Stage 7: Source navigation and RMS — नवीनतम compiler tools

<!-- scarp-learning-stage: navigation-rms v0.0.6-alpha.1 -->

**प्रमाणित release: [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)**, प्रकाशित 5 नवंबर 2026; compiler source `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`।

1. [पूरा दो-files वाला project lab](/hi/tutorials/project-symbol-navigation-alpha6): वर्तमान **पूरी तरह compiler-tested** project, module तथा exact stdout `30`।
2. [Symbols और references](/hi/tooling/cli-alpha6): schema-v1 JSON, definitions, targets और source locations।
3. [Root-mean-square (RMS)](/hi/language/rms-alpha6): प्रकाशित numerical builtin, input सीमा और error व्यवहार।
4. [Alpha.6 रिलीज़ का प्रमाण](/hi/releases/v0.0.6-alpha.1): exact source commit, download assets तथा सीमाएँ।

Project lab के अनुसार नया project बनाने और दोनों source files बदलने **के बाद**, `navigation-lab` के **parent folder** से ये commands चलाएँ:

~~~sh
scarp verify navigation-lab
scarp inspect symbols --json navigation-lab
scarp inspect references --json navigation-lab
scarp launch navigation-lab
~~~

**अभ्यास:** जाँचें कि `launch` का stdout `30` और newline है। दोनों अलग `base` declarations और imported `adjust` definition देखें। बताइए कि compile के बाद symbol IDs हमेशा सुरक्षित क्यों नहीं रहते। **LSP server, automatic rename, incremental cache, सामान्य tensors और native `.srp` code generation अभी उपलब्ध नहीं हैं।**

## अंतिम अभ्यास: सही release वाला capstone

यह आपके सीखने के लिए exercise है, **नया आधिकारिक सत्यापित program नहीं**। वही [alpha.6 project lab](/hi/tutorials/project-symbol-navigation-alpha6) बिना बदले संदर्भ के रूप में लें।

- **Source map:** entry file, imported module, public functions/constants और private declaration पहचानें।
- **Static जाँच:** `verify` तथा दोनों JSON inspectors चलाएँ; कोई code बदलने से पहले definitions और references समझें।
- **Runtime जाँच:** `launch` चलाएँ और बिना बदले project का stdout प्रकाशित `30` से मिलाएँ। Code बदलने के बाद **उसके output को पुराने verified fixture जैसा नहीं मान सकते**।
- **Version समझ:** समझाएँ कि पुराने `run`/`check` tutorials, alpha.4 projects और alpha.6 symbol tools अलग-अलग release guides में क्यों हैं।

आगे [feature status](/hi/reference/status), [version compatibility](/hi/reference/compatibility), तथा [परीक्षण प्रमाण](/hi/reference/evidence) पढ़ें। यहाँ की सभी packages prerelease हैं; यह पूरा path सीखने से unshipped features या स्थिर भाषा API अपने-आप उपलब्ध नहीं हो जाते।
