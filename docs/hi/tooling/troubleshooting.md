# समस्या निवारण

**नया प्रकाशित संस्करण:** [alpha.5 इंस्टॉलेशन](/hi/guide/installation-alpha5), [alpha.5 CLI](/hi/tooling/cli-alpha5), और [C11 Rust-only backend](/hi/reference/c11-backend-alpha5) देखें। पुराने alpha.2 diagnostic tests जानबूझकर version-pinned हैं।

**प्रकाशित v0.0.5-alpha.2 में:** [छह वास्तविक compiler त्रुटियाँ और सुधार](/hi/tutorials/alpha2-diagnostics-and-repairs) देखकर E0044/E0045, module constant calls, private imports और import cycles समझें। ये published test fixtures से लिए गए हैं और CI में चलाए जाते हैं। नीचे सामान्य troubleshooting नियम हैं।

## `scarp: command not found`

पहले `scarp --version` आज़माएँ। यदि कमांड न मिले तो archive में executable का पूरा path लिखें या Cargo के binary folder को `PATH` में जोड़ें। Source checkout में `cargo run -- --version` से सही build पहचानें।

## Unknown command या पुराना syntax

**प्रकाशित alpha.5 में** file चलाने के लिए `scarp exec FILE.srp`, static जाँच के लिए `scarp verify FILE.srp`, और project के लिए `scarp create DIRECTORY`, `scarp verify DIRECTORY`, `scarp launch DIRECTORY` उपलब्ध हैं। पहली बार project module inspection भी `scarp inspect modules --json DIRECTORY` से चलती है। `scarp build` और `scarp compile` **उपलब्ध नहीं**; `cargo build` केवल Rust interpreter बनाता है। पुराने उदाहरणों में `let` बनाम नए `bind`/`var` और `println` बनाम `print` का अंतर हो सकता है। [वर्ज़न तुलना](/hi/reference/compatibility) देखें।

## सफल `check` पर कुछ नहीं दिखता

पुराना `check` चुने हुए execution paths चलाकर output रोकता है; यह **static-only** command नहीं है। नए compiler में बिना statements चलाए जाँच के लिए `scarp verify FILE.srp` या `scarp verify DIRECTORY` और वास्तविक output के लिए `scarp exec FILE.srp` या `scarp launch DIRECTORY` उपयोग करें।

## अंकगणित त्रुटि

पूर्णांक overflow E0007, शून्य से भाग E0008 और प्रकार भिन्न होने पर E0015 मिलता है। `1 + 0.5` implicit conversion नहीं करता।

## Import त्रुटि

Import path `.srp` हो, relative हो, importing file के folder के अनुसार लिखा हो और trust root से बाहर न जाए। चक्रीय graph E0039 देता है। [सुरक्षा व loading](/hi/reference/source-loading) देखें।

## Work-budget खत्म हो जाए

E0017 का अर्थ चुनी गई logical work सीमा समाप्त है। पहले loops की समाप्ति और shape जाँचें, फिर आवश्यकता के अनुसार `--max-steps` बदलें। [बजट नियम](/hi/reference/budgets) पढ़ें।
