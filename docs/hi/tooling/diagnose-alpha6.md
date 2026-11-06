# Scarp compiler और कंप्यूटर की जाँच — प्रकाशित alpha.6

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-diagnose-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

प्रकाशित [Scarp v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) में **`scarp diagnose`** और **`scarp diagnose --json`** से वास्तविक चल रहे executable की जानकारी मिलती है। यह मार्गदर्शिका [tagged CLI implementation](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/src/main.rs) तथा source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` से सत्यापित है। यह report package registry, कंप्यूटर के performance benchmark या native Scarp compilation का प्रमाण **नहीं** है।

## 1. असली executable की जाँच करें

[Alpha.6 installation और checksum guide](/hi/guide/installation-alpha6) के अनुसार compiler इंस्टॉल करने के बाद उसी executable के terminal में चलाएँ:

~~~sh
scarp version
scarp guide diagnose
scarp diagnose
scarp diagnose --json
~~~

`scarp version` binary की पहचान करता है: alpha.6 में `scarp 0.0.6-alpha.1` मिलता है। `scarp guide diagnose` कमांड का help दिखाता है। `scarp diagnose` पढ़ने योग्य report देता है और **`scarp diagnose --json`** एक JSON object तथा आख़िर में newline stdout पर देता है। सफल command stderr पर कुछ नहीं लिखता।

ऊपर की commands तब चलेंगी जब `scarp` आपके `PATH` में हो। Windows PowerShell में extracted executable के folder से चलाएँ:

~~~powershell
.\scarp.exe diagnose --json
~~~

Linux/macOS पर उसी binary folder में चलाएँ:

~~~sh
./scarp diagnose --json
~~~

Extracted folder का सही executable सीधे चलाने से `PATH` में रखे पुराने Scarp version का भ्रम दूर होता है।

## 2. JSON report के fields समझें

प्रकाशित alpha.6 JSON में ये **दस** fields हैं। `host_os` और `host_arch` उस **कंप्यूटर** को बताते हैं जिस पर compiler चल रहा है; ये दूसरे CPU या OS के लिए executable बनाने की सुविधा नहीं हैं।

| JSON field | Type | प्रकाशित alpha.6 में अर्थ |
| --- | --- | --- |
| `schema_version` | integer | `1`: JSON report का schema version |
| `version` | string | इसी binary में `"0.0.6-alpha.1"` |
| `host_os` | string | Rust के अनुसार host OS, जैसे `windows`, `linux`, या `macos` |
| `host_arch` | string | Rust के अनुसार host CPU, जैसे `x86_64` या `aarch64` |
| `execution` | string | `"interpreter"`: `.srp` program interpreter से चलता है |
| `static_verify` | boolean | `true`: `scarp verify` सामान्य program statements चलाए बिना source जाँचता है |
| `module_inspection` | boolean | `true`: static module inspection उपलब्ध है |
| `project_workflow` | boolean | `true`: स्पष्ट `Scarp.project` create/verify/launch workflow उपलब्ध है |
| `native_executable` | boolean | `false`: `.srp` को native executable में बदलना उपलब्ध नहीं |
| `package_manager` | boolean | `false`: built-in package manager या registry उपलब्ध नहीं |

यह broad capabilities की सूची है, सभी CLI subcommands की नहीं। सही release के symbols/references JSON और सीमाएँ [alpha.6 CLI reference](/hi/tooling/cli-alpha6) में हैं। AST का human-readable debug tree स्थिर JSON क्यों नहीं है, यह [AST inspection guide](/hi/tooling/inspect-ast-alpha6) में समझें।

## 3. Report में कुछ अनपेक्षित दिखे तो

यदि `version` का मान `0.0.6-alpha.1` न हो, तो `PATH` और [प्रकाशित release archive](/hi/guide/installation-alpha6) जाँचें। `native_executable: false` और `package_manager: false` बिल्कुल **अपेक्षित** हैं। प्रकाशित compiler में `scarp build`, `scarp compile` और native `.srp` package tool नहीं है। Rust का `cargo build` केवल Scarp **interpreter** को build करता है।

यह report **offline और read-only** है। यह network पर request नहीं भेजती, बाहरी registry नहीं जाँचती, project नहीं बनाती, source file की वैधता नहीं बताती और सभी `.srp` programs के सफल execution की गारंटी नहीं देती। Source जाँचने के लिए `scarp verify` तथा पूरे example के लिए [alpha.6 project tutorial](/hi/tutorials/project-symbol-navigation-alpha6) देखें।

केवल `scarp diagnose`, `scarp diagnose --json` और help forms मान्य हैं। अतिरिक्त गलत argument जैसे `scarp diagnose --format=json` पर **usage error और exit code 2** आता है, stdout पर सफल report नहीं। अन्य समस्याओं के लिए [troubleshooting](/hi/tooling/troubleshooting) देखें। ये निर्देश प्रकाशित alpha.6 binary पर आधारित हैं, unreleased compiler branch पर नहीं।
