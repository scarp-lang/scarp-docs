# समस्या निवारण

**वर्तमान प्रकाशित संस्करण [v0.0.6-alpha.1](/hi/releases/v0.0.6-alpha.1) है।** नए उपयोगकर्ता [alpha.6 इंस्टॉलेशन](/hi/guide/installation-alpha6), [symbols और references CLI](/hi/tooling/cli-alpha6) तथा [AST debugging](/hi/tooling/inspect-ast-alpha6) पढ़ें। पुराने [alpha.5 CLI](/hi/tooling/cli-alpha5) और [C11 Rust-only API](/hi/reference/c11-backend-alpha5) ऐतिहासिक हैं। Alpha.2 diagnostic tests version-pinned रहते हैं।

**प्रकाशित v0.0.5-alpha.2 में:** [छह वास्तविक compiler त्रुटियाँ और सुधार](/hi/tutorials/alpha2-diagnostics-and-repairs) देखकर E0044/E0045, module constant calls, private imports और import cycles समझें। ये published test fixtures से लिए गए हैं और CI में चलाए जाते हैं। नीचे सामान्य troubleshooting नियम हैं।

## `scarp: command not found`

पहले `scarp --version` आज़माएँ। यदि कमांड न मिले तो archive में executable का पूरा path लिखें या Cargo के binary folder को `PATH` में जोड़ें। Source checkout में `cargo run -- --version` से सही build पहचानें।

## Unknown command या पुराना syntax

**प्रकाशित alpha.6** (और पुराने alpha.5 project workflow) में file चलाने के लिए `scarp exec FILE.srp`, static जाँच के लिए `scarp verify FILE.srp`, और project के लिए `scarp create DIRECTORY`, `scarp verify DIRECTORY`, `scarp launch DIRECTORY` उपलब्ध हैं। Project module inspection `scarp inspect modules --json DIRECTORY` से चलती है। Alpha.6 में `scarp inspect symbols --json FILE.srp` तथा `scarp inspect references --json FILE.srp` भी हैं। `scarp build` और `scarp compile` **उपलब्ध नहीं**; `cargo build` केवल Rust interpreter बनाता है। पुराने उदाहरणों में `let` बनाम नए `bind`/`var` और `println` बनाम `print` का अंतर हो सकता है। [वर्ज़न तुलना](/hi/reference/compatibility) देखें।

## सफल `check` पर कुछ नहीं दिखता

पुराना `check` चुने हुए execution paths चलाकर output रोकता है; यह **static-only** command नहीं है। नए compiler में बिना statements चलाए जाँच के लिए `scarp verify FILE.srp` या `scarp verify DIRECTORY` और वास्तविक output के लिए `scarp exec FILE.srp` या `scarp launch DIRECTORY` उपयोग करें।

## `inspect ast` सफल है, लेकिन `verify` विफल है

यह संभव है: **parser** source file को पढ़ सकता है, लेकिन import resolve न हो या type error हो। `scarp inspect ast FILE.srp` केवल entry file parse करता है; modules validate और code execute नहीं करता। [प्रकाशित alpha.6 AST debugging](/hi/tooling/inspect-ast-alpha6) में tokens, syntax tree, checked modules और resolved symbols का अंतर समझाया गया है। `scarp inspect ast --json` उपलब्ध नहीं है। `--diagnostic-format=json` केवल **त्रुटि संदेश** JSON में देता है, successful AST output नहीं।

## अंकगणित त्रुटि

पूर्णांक overflow E0007, शून्य से भाग E0008 और प्रकार भिन्न होने पर E0015 मिलता है। `1 + 0.5` implicit conversion नहीं करता।

## Import त्रुटि

Import path `.srp` हो, relative हो, importing file के folder के अनुसार लिखा हो और trust root से बाहर न जाए। चक्रीय graph E0039 देता है। [सुरक्षा व loading](/hi/reference/source-loading) देखें।

## Work-budget खत्म हो जाए

E0017 का अर्थ चुनी गई logical work सीमा समाप्त है। पहले loops की समाप्ति और shape जाँचें, फिर आवश्यकता के अनुसार `--max-steps` बदलें। [बजट नियम](/hi/reference/budgets) पढ़ें।
