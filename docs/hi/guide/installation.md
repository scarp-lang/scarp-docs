# Scarp इंस्टॉल करें

**नवीनतम प्रकाशित रिलीज़: [v0.0.5-alpha.2](/hi/releases/v0.0.5-alpha.2) (2 नवंबर 2026)।** इस पृष्ठ का विस्तृत installation क्रम अभी सत्यापित **alpha.1** baseline का है। Alpha.2 की नई सुविधाएँ चलाने के लिए [नए रिलीज़ archives](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) और उसी release का checksum व version चुनें।

यदि आपने alpha.1 पहले से स्थापित किया है, तो [alpha.1 → alpha.2 अपग्रेड परीक्षण](/hi/reference/upgrade-readiness) में देखें कि कौन से पुराने examples को नए compiler पर पुनः सत्यापित किया गया है। Archive और checksum जाँच भी आवश्यक है।

इस मार्गदर्शिका का आधार प्रकाशित **v0.0.5-alpha.1 prerelease** है। Scarp इस समय `.srp` से native executable नहीं बनाता। इसे interpreter की तरह चलाएँ।

## विकल्प A: प्रकाशित बाइनरी डाउनलोड करें

[आधिकारिक रिलीज़ पेज](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) पर Windows x64, Linux x64 और macOS ARM64 के लिए दर्ज पैकेज उपलब्ध हैं। अपने सिस्टम के अनुकूल archive चुनें और साथ दी गई SHA-256 checksum से सत्यापन करें। Archive निकालें और उसमें शामिल `examples/` फ़ोल्डर को बनाए रखें।

Windows PowerShell में executable को `./scarp.exe` के रूप में चलाएँ। Unix shell में `./scarp` लिखें। डाउनलोड किए गए पैकेज को उपयोग करने के लिए Rust compiler की आवश्यकता नहीं है।

## विकल्प B: सोर्स से बनाएँ

[rustup](https://rustup.rs/) से Rust और Cargo इंस्टॉल करें। Windows पर आवश्यक होने पर MSVC C++ build tools इंस्टॉल करें। नीचे दिए गए कमांड आधिकारिक repository को बनाते और परखते हैं:

~~~sh
git clone https://github.com/scarp-lang/scarp.git
cd scarp
cargo build --locked
cargo run -- --version
cargo run -- run examples/hello.srp
~~~

Compiler में तृतीय-पक्ष Rust crate निर्भरताएँ नहीं हैं। Rust toolchain मौजूद हो तो `cargo build --locked --offline` और `cargo test --locked --offline` भी चल सकते हैं। `cargo install --path . --locked` से `scarp` कमांड इंस्टॉल कर सकते हैं।

## समस्या होने पर

`scarp` command नहीं मिले तो executable का पूरा path इस्तेमाल करें या `PATH` जाँचें। पुरानी बाइनरी में `let` और `println` का व्यवहार अलग हो सकता है; `scarp --version` से संस्करण देखें। आगे [समस्या निवारण](/hi/tooling/troubleshooting) पढ़ें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~sh
./scarp --version
./scarp run examples/hello.srp
~~~

~~~sh
git clone https://github.com/scarp-lang/scarp.git
cd scarp
cargo build --locked
cargo run -- --version
cargo run -- run examples/hello.srp
~~~

~~~sh
cargo build --locked --offline
cargo test --locked --offline
~~~

~~~sh
cargo install --path . --locked
scarp --version
scarp run examples/hello.srp
~~~
