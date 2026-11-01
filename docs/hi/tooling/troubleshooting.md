# समस्या निवारण

## `scarp: command not found`

पहले `scarp --version` आज़माएँ। यदि कमांड न मिले तो archive में executable का पूरा path लिखें या Cargo के binary folder को `PATH` में जोड़ें। Source checkout में `cargo run -- --version` से सही build पहचानें।

## Unknown command या पुराना syntax

`scarp build` वर्तमान CLI का command नहीं है; Rust interpreter बनाने के लिए `cargo build` है। पुराने उदाहरणों में `let` बनाम नए `bind`/`var` और `println` बनाम `print` का अंतर हो सकता है। [वर्ज़न तुलना](/hi/reference/compatibility) देखें।

## सफल `check` पर कुछ नहीं दिखता

यह सामान्य है। `check` चुने हुए execution path के मानों का सत्यापन करता है लेकिन user output रोकता है। आउटपुट चाहिए तो `run` उपयोग करें।

## अंकगणित त्रुटि

पूर्णांक overflow E0007, शून्य से भाग E0008 और प्रकार भिन्न होने पर E0015 मिलता है। `1 + 0.5` implicit conversion नहीं करता।

## Import त्रुटि

Import path `.srp` हो, relative हो, importing file के folder के अनुसार लिखा हो और trust root से बाहर न जाए। चक्रीय graph E0039 देता है। [सुरक्षा व loading](/hi/reference/source-loading) देखें।

## Work-budget खत्म हो जाए

E0017 का अर्थ चुनी गई logical work सीमा समाप्त है। पहले loops की समाप्ति और shape जाँचें, फिर आवश्यकता के अनुसार `--max-steps` बदलें। [बजट नियम](/hi/reference/budgets) पढ़ें।
