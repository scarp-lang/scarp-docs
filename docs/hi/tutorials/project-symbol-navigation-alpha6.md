# पहला Scarp project बनाएँ और symbols समझें (alpha.6)

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-project-lab: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

यह शुरुआती लोगों के लिए **पूरा project tutorial** है, जो [प्रकाशित Scarp v0.0.6-alpha.1 prerelease](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) पर आधारित है। इसमें tag से जाँचे गए [मुख्य उदाहरण](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/symbol_navigation.srp), [module source](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/modules/navigation_values.srp) और [ठीक stdout](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/symbol_navigation.stdout) हैं। स्रोत commit [`aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`](https://github.com/scarp-lang/scarp/commit/aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8) है।

हम एक असली project बनाएँगे, दो `.srp` files रखेंगे, बिना program चलाए जाँच करेंगे, definitions/references देखेंगे और अंत में project execute करेंगे। **यह Rust-आधारित Scarp interpreter है, `.srp` से native executable बनाने वाला compiler नहीं।** नया compiler लेने के लिए पहले [alpha.6 release तथा checksum guide](/hi/releases/v0.0.6-alpha.1) देखें। पुराने alpha.5 version में symbols/references inspector नहीं है।

## 1. फ़ोल्डर की रचना समझें

*Project* ऐसा directory है जिसमें `Scarp.project` नाम की छोटी manifest file होती है। *Module* दूसरी `.srp` file होती है, जिसे मुख्य code import करता है। `src/main.srp` entrypoint रहेगा और `src/modules/` में उसका module होगा।

~~~text
navigation-lab/
  Scarp.project
  src/
    main.srp
    modules/
      navigation_values.srp
~~~

जिस जगह project बनाना है, उसके **parent directory** से पहले scaffold बनाएँ:

~~~sh
scarp create navigation-lab
~~~

`navigation-lab` पहले से मौजूद **नहीं** होना चाहिए—खाली folder पर भी create overwrite नहीं करता। Command `Scarp.project` तथा `src/main.srp` बनाता है। इसके बाद `src/modules/` directory खुद बनाएँ और नीचे दिए पूरे code से generated `main.srp` को बदलें।

बनने वाली manifest का exact format:

~~~text
scarp-project: 1
name: navigation-lab
entry: src/main.srp
~~~

यह manifest version `1` है। `entry` project के अंदर relative `.srp` path होना चाहिए। यह सिर्फ़ development manifest है, package manager या dependencies registry नहीं है।

## 2. उपयोगी module बनाएँ

`navigation-lab/src/modules/navigation_values.srp` file बनाएँ और यह **पूरा** code रखें:

~~~scarp
bind private_seed = 2;
pub bind offset = private_seed;
pub pure funcra adjust(n: integer) -> integer { return n + offset; }
~~~

`bind private_seed` केवल इसी module में प्रयोग होता है। `pub` से `offset` और `adjust` दूसरे files के लिए सार्वजनिक होते हैं। `pure funcra adjust` typed function है, जिसमें output side effects नहीं हैं। `offset` module scalar constant है, mutable runtime global नहीं।

## 3. मुख्य प्रोग्राम लिखें

Generated `navigation-lab/src/main.srp` को प्रकाशित example के इस पूरे code से बदलें:

~~~scarp
import "modules/navigation_values.srp" as library;

bind base = library.offset;
pure funcra twice(value: integer = library.offset) -> integer
    needs value >= 0;
    ensures result == value * 2;
{
    return value * 2;
}

var total = 0;
repeat 3 as step {
    bind base = twice(value: library.adjust(n: base + step));
    total += base;
}
print(total);
~~~

इसको क्रम से समझें: `import "...srp" as library` module का local नाम बनाता है; `library.offset` सार्वजनिक symbol पढ़ता है; `pure funcra twice` typed function है; `needs` तथा `ensures` runtime पर शर्तें जाँचते हैं, static mathematical proof नहीं देते; `var total` में assignment होता है; और `repeat` गिनती के अनुसार loop चलाता है। भीतर वाला `bind base` बाहरी `base` के नाम को shadow करता है, पर बाहरी binding नहीं बदलता।

Import का path **`src/main.srp` के स्थान से** तय होता है, terminal के current folder से नहीं। Module को ठीक `src/modules/` में रखें।

## 4. पहले verify, फिर inspect और launch

`navigation-lab` के **parent directory** से प्रकाशित alpha.6 executable के साथ ये commands चलाएँ:

~~~sh
scarp version
scarp verify navigation-lab
scarp inspect modules --json navigation-lab
scarp inspect symbols --json navigation-lab
scarp inspect references --json navigation-lab
scarp launch navigation-lab
scarp exec navigation-lab/src/main.srp
~~~

इनका काम अलग-अलग है:

| Command | उद्देश्य | सामान्य statements चलती हैं? |
| --- | --- | --- |
| `scarp create navigation-lab` | नया project scaffold बनाए | नहीं; सिर्फ़ नई files लिखता है |
| `scarp verify navigation-lab` | Entry तथा imported modules की static जाँच | **नहीं**; सफलता पर कोई stdout नहीं |
| `scarp inspect modules --json navigation-lab` | Loaded modules की static सूची | नहीं |
| `scarp inspect symbols --json navigation-lab` | Definitions और declarations की सूची | नहीं |
| `scarp inspect references --json navigation-lab` | इन symbols का उपयोग कहाँ हुआ | नहीं |
| `scarp launch navigation-lab` | Manifest के entrypoint को execute करे | **हाँ**, interpreter से |
| `scarp exec navigation-lab/src/main.srp` | उसी entry file को सीधे चलाए | **हाँ**, interpreter से |

**ध्यान दें:** `create` केवल एक बार चलाएँ। **दोनों source files edit करने के बाद ही `verify` और बाकी commands चलाएँ।** `verify` constants की compile-time जाँच कर सकता है, लेकिन सामान्य runtime statements तथा contracts execute नहीं करता।

`launch` तथा `exec` दोनों का ठीक-ठीक stdout यह है:

~~~text
30
~~~

## 5. Symbols और references क्या हैं?

*Symbol* किसी नाम की definition है, जैसे `library`, `twice`, `total`, `offset` या `adjust`। *Reference* code में उस symbol का **उपयोग** है। Alpha.6 के दोनों JSON inspectors अलग जानकारी देते हैं:

| Inspector | JSON kind | क्या पता चलता है? |
| --- | --- | --- |
| `inspect symbols --json` | `scarp.symbols` | Functions, imports, constants, parameters और bindings कहाँ घोषित हुए |
| `inspect references --json` | `scarp.references` | कौन से reads, writes, calls तथा named arguments उन definitions का उपयोग करते हैं |

दोनों JSON में `schema_version: 1` होता है। `files` array में source files, `symbols` में definitions और दूसरे inspector के `references` में उपयोग की जगहें मिलती हैं। Reference का `target` **उसी snapshot** के symbol ID से जुड़ता है। Byte span UTF-8 half-open offsets हैं; line/column 1 से शुरू होने वाली Unicode scalar positions हैं।

अलग scopes में मौजूद `base` की अलग definitions देखें। `library` import alias और `adjust` function खोजें। Named argument `n:` अपने parameter से जुड़ता है। Source edit करने पर symbol IDs बदल सकते हैं; यह कोई पूर्ण LSP server या rename tool नहीं है। विस्तार से [alpha.6 CLI symbols reference](/hi/tooling/cli-alpha6) देखें।

## 6. गलतियाँ ठीक करें

| समस्या | कारण और सुरक्षित समाधान |
| --- | --- |
| `create` folder स्वीकार नहीं करता | Folder पहले से है; **उसे बिना जाँच delete न करें**। अपनी बनाई files रखें या नए नाम तथा सही manifest से नया project बनाएँ |
| `verify` module नहीं ढूँढ़ता | `src/modules/navigation_values.srp` का नाम और location जाँचें |
| Project directory अमान्य है | उसी directory में `Scarp.project` तथा ठीक तीन manifest fields रखें। Parent directories में automatic search नहीं होती |
| `inspect symbols` unknown command है | `scarp version` देखें; alpha.5 की जगह alpha.6 चाहिए |
| Inspection error पर JSON नहीं आया | Error stderr पर आता है; असफल होने पर आधा सफल index नहीं मिलता |

गलत CLI usage के लिए सामान्यतः exit **2**, invalid manifest/source या runtime error के लिए exit **1** है। `--diagnostic-format=json` **stderr errors** के लिए और `--json` **successful stdout inspection** के लिए है।

## 7. अपना ज्ञान जाँचें

1. Public `pub` क्यों आवश्यक है, जब दूसरे module को किसी नाम तक पहुँचना हो?
2. `verify` और `launch` में क्या अंतर है?
3. `twice` के सभी calls जानने के लिए कौन सा inspector चलाएँगे?
4. Code edit करने के बाद editor को symbol IDs दोबारा क्यों बनाने चाहिए?

उत्तर जानने के लिए files और JSON देख सकते हैं। किसी नई या अप्रकाशित भाषा-सुविधा की जरूरत नहीं।

**पुनः सत्यापन:** यही `Scarp.project`, दो पूरे source files तथा stdout [`conformance/alpha6-project/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha6-project) में रखे हैं। TypeScript checker हिन्दी/अंग्रेज़ी code और published tag की तुलना करता है। CI ठीक release source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` से बनी compiler CLI में project चलाती है। [Alpha.6 release guide](/hi/releases/v0.0.6-alpha.1) में बाकी सीमाएँ दी हैं।
