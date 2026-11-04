# कमांड-लाइन इंटरफ़ेस — v0.0.5-alpha.3

<!-- scarp-cli-release: v0.0.5-alpha.3 -->

**ऐतिहासिक alpha.3 CLI reference:** Scarp [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3) **2 नवंबर 2026** को [निश्चित source commit `7715c28df09c7703b39e14fddb963275b25df476`](https://github.com/scarp-lang/scarp/commit/7715c28df09c7703b39e14fddb963275b25df476) से जारी हुआ। यहाँ लिखी commands उस **प्रकाशित prerelease में मौजूद** हैं, केवल future proposals नहीं हैं। Scarp अभी experimental interpreter है; इससे `.srp` प्रोग्राम का native executable नहीं बनता।

**नया प्रकाशित release:** [v0.0.5-alpha.4](/hi/releases/v0.0.5-alpha.4) में project `create`, directory `verify` और `launch` अब वास्तविक रूप से उपलब्ध हैं। नए project के लिए [alpha.4 quickstart](/hi/guide/quickstart-alpha4) पढ़ें। यह पुराना पृष्ठ सिर्फ **alpha.3** के exact CLI की जानकारी देता है।

वर्तमान सभी CLI commands के लिए [प्रकाशित alpha.4 CLI संदर्भ](/hi/tooling/cli-alpha4) पढ़ें। इसमें file और project commands, budgets तथा JSON error semantics दिए गए हैं। यह पुराना पृष्ठ जानबूझकर alpha.3 पर ही आधारित है।

Alpha.3 के standalone programs सीखने हों तो [alpha.3 quickstart](/hi/guide/quickstart-alpha3) पढ़ें। पुराने scripts के लिए [alpha.1 CLI का ऐतिहासिक संदर्भ](/hi/tooling/cli-alpha1) सुरक्षित रखा गया है।

## उपलब्ध commands

| कमांड | काम | सामान्य program statements चलाता है? |
| --- | --- | --- |
| `scarp version` / `scarp --version` | इंस्टॉल किए गए compiler का वास्तविक version | नहीं |
| `scarp guide` / `scarp guide exec` | CLI help; `inspect tokens` और `inspect modules` के लिए भी help | नहीं |
| `scarp diagnose --json` | बिना नेटवर्क के compiler version, platform और capabilities रिपोर्ट | नहीं |
| `scarp exec FILE` | Imports और types जाँचकर interpreter में प्रोग्राम चलाना | **हाँ** |
| `scarp verify FILE` | Source, नाम, प्रकार और modules की static जाँच | **नहीं** |
| `scarp inspect tokens FILE` | Lexer के tokens और source locations दिखाना | नहीं |
| `scarp inspect ast FILE` | Entry file parse करके अस्थिर, पढ़ने योग्य syntax tree दिखाना | नहीं |
| `scarp inspect modules --json FILE` | Modules की जाँच और schema-version-1 JSON inventory | नहीं |
| `scarp explain E0015` | Source खोले बिना मौजूदा error code समझाना | नहीं |

बिना arguments के `scarp` command guidance देता है। पुराने `run`, `check`, `tokens` और `modules` commands अभी **पुराने code की compatibility** के लिए उपलब्ध हैं। नए tutorial में नए नामों का उपयोग करें।

## सही executable पहचानें

सबसे पहले जाँचें कि आपके executable का version `0.0.5-alpha.3` ही है:

~~~sh
scarp version
scarp guide
scarp diagnose --json
~~~

यदि `PATH` में executable नहीं है तो Windows PowerShell में `.\scarp.exe` या Linux/macOS में `./scarp` लगाएँ। [इंस्टॉलेशन quickstart](/hi/guide/quickstart-alpha3) में archive और SHA-256 checksum मिलाने की पूरी विधि है।

## Source जाँचें, चलाएँ और inspect करें

प्रकाशित release के examples वाले folder में `text_construction.srp`, `collection_module.srp` और उसकी `modules/` dependency साथ रखकर ये commands चलाएँ:

~~~sh
scarp verify text_construction.srp
scarp exec text_construction.srp
scarp inspect tokens text_construction.srp
scarp inspect ast text_construction.srp
scarp inspect modules --json collection_module.srp
scarp explain E0015
~~~

`text_construction.srp` चलाने पर प्रकाशित उदाहरण का stdout बिल्कुल यह है:

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

**`verify` और पुराना `check` एक जैसे नहीं हैं।** नया `verify` सामान्य statements, runtime arithmetic या function contracts चलाए बिना static जाँच करता है। कुछ सीमित compile-time scalar module constants का मूल्यांकन हो सकता है। पुराने `check` में चुने हुए runtime paths जाँचने के दौरान चल सकते हैं, भले user output न मिले।

`inspect tokens` केवल lexer है, पूरे program का validator नहीं। `inspect ast` entry file को parse करता है; यह imports resolve नहीं करता, type checker नहीं है और इसका tree स्थिर machine-readable API नहीं है। Static source/type validation के लिए `verify` इस्तेमाल करें।

## बजट विकल्प और सहायता

`exec` में interpreter की runtime-budget flags एक source filename के **पहले** दे सकते हैं। पुराने `run` में भी यह सुविधा है:

~~~sh
scarp exec --max-steps 2000000 text_construction.srp
scarp guide inspect modules
~~~

बजट की सीमाएँ [runtime reference](/hi/reference/budgets) में हैं। `verify`, `inspect tokens` और `inspect ast` program चलाते नहीं हैं, इसलिए इनमें runtime-budget flags न दें। **Alpha.3 में** project `create` और `launch` उपलब्ध नहीं थे; **प्रकाशित alpha.4 में ये अब उपलब्ध हैं**। दोनों versions में arbitrary program arguments forwarding, `compile`, `build`, package manager तथा native-code generation अभी उपलब्ध नहीं हैं।

Relative path terminal के वर्तमान folder के आधार पर resolve होता है। Spaces वाले path को quotes में लिखें। `-` से शुरू होने वाले filename के पहले `--` separator लगा सकते हैं। Source UTF-8 होना चाहिए और imports स्थानीय relative modules तक सीमित हैं; [source सुरक्षा](/hi/reference/source-loading) देखें।

## JSON आउटपुट के तीन अलग प्रकार

| विकल्प | JSON किस चीज़ का है? |
| --- | --- |
| `diagnose --json` | Offline compiler, platform और capability report (alpha.3 में schema version 1) |
| `inspect modules --json FILE` | सफल **module inventory** (schema version 1) |
| Source command में `--diagnostic-format=json` | असफल validation का **error diagnostic**, stderr पर (schema version 1) |

यह command जानबूझकर प्रकाशित गलत-type वाली fixture पर fail होगी। Program चलाने के बजाय stderr पर `E0015` error मिलेगा:

~~~sh
scarp verify --diagnostic-format=json diagnostics/type_error.srp
~~~

Failure के समय exit code और stderr दोनों देखें। सफल AST के लिए **`inspect ast --json` उपलब्ध नहीं है**। `--diagnostic-format=json` सफल AST को JSON में नहीं बदलता। अधिक जानकारी: [diagnostics](/hi/reference/diagnostics) और [alpha.3 का वास्तविक JSON snapshot](/hi/releases/v0.0.5-alpha.3#structured-diagnostic-schema-version-1)।

## Exit status और compatibility

| Status | अर्थ |
| --- | --- |
| `0` | Command सफल |
| `1` | Source/file/runtime/budget या output error |
| `2` | गलत command, अनुपलब्ध option या argument की कमी |

सफल `verify` शांत रहता है। `exec` सामान्य प्रोग्राम आउटपुट stdout या stderr पर लिख सकता है। Source error पर partial user output नहीं दिया जाता; लेकिन output I/O failure के समय पहले के bytes लिखे जा सकते हैं।

आगे [alpha.3 compiler प्रमाण](/hi/releases/v0.0.5-alpha.3), [alpha.2 module inspection](/hi/tooling/alpha2-inspection) और [alpha.1 पुराना CLI](/hi/tooling/cli-alpha1) देखें।

**सत्यापन:** GitHub CI में इस page के commands प्रकाशित compiler पर जाँचे जाते हैं। प्रदर्शित stdout [`conformance/alpha3/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3) में pinned है।
