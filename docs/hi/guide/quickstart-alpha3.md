# Scarp v0.0.5-alpha.3 से शुरुआत

<!-- scarp-cli-release: v0.0.5-alpha.3 -->

यह **नई प्रकाशित prerelease** [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3) (2 नवंबर 2026) के लिए शुरुआती मार्गदर्शिका है। Scarp अभी **प्रयोगात्मक interpreter** है। यह `.srp` से native executable नहीं बनाता और भाषा की स्थिर compatibility की गारंटी नहीं है। पुराने मुख्य संदर्भ का आधार अब भी [alpha.1](/hi/reference/status) है।

## 1. सही archive चुनें और checksum मिलाएँ

**[आधिकारिक alpha.3 GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)** से अपने कंप्यूटर के लिए archive डाउनलोड करें:

| सिस्टम | डाउनलोड की फ़ाइल |
| --- | --- |
| Windows x64 | `scarp-0.0.5-alpha.3-x86_64-pc-windows-msvc.zip` |
| Linux x64 | `scarp-0.0.5-alpha.3-x86_64-unknown-linux-gnu.tar.gz` |
| macOS Apple Silicon | `scarp-0.0.5-alpha.3-aarch64-apple-darwin.tar.gz` |

उसी release से संबंधित `.sha256` या `SHA256SUMS` फ़ाइल भी लें। Archive extract करने से पहले डाउनलोड की गई फ़ाइल का **SHA-256 hash** निकालें और आधिकारिक hash से पूरी तरह मिलाएँ:

- **Windows PowerShell:** `Get-FileHash -Algorithm SHA256 -Path .\scarp-0.0.5-alpha.3-x86_64-pc-windows-msvc.zip`
- **Linux:** `sha256sum scarp-0.0.5-alpha.3-x86_64-unknown-linux-gnu.tar.gz`
- **macOS:** `shasum -a 256 scarp-0.0.5-alpha.3-aarch64-apple-darwin.tar.gz`

Hash अलग हो तो **उस archive को न चलाएँ**। सही archive extract करें और उसमें मौजूद example फ़ाइलों और folders को साथ रखें। Scarp executable सीधे extracted folder से चला सकते हैं; इसे system `PATH` में जोड़ना अनिवार्य नहीं है।

## 2. Scarp का version जाँचें

Extracted folder में terminal खोलकर उपयुक्त executable चलाएँ:

~~~sh
scarp version
~~~

यदि `PATH` में Scarp नहीं है तो Windows PowerShell में `.\scarp.exe version` और Linux/macOS में `./scarp version` चलाएँ। आगे जाने से पहले यह पुष्टि करें कि version **0.0.5-alpha.3** है। पुरानी binary के साथ नई commands न मिलाएँ।

## 3. सत्यापित Scarp प्रोग्राम बनाएँ

अपनी पसंद के folder में UTF-8 encoding वाली **`text_construction.srp`** फ़ाइल बनाएँ। नीचे का पूरा code वैसे ही लिखें:

~~~scarp
bind greeting: string = text_concat("Hello, ", "🌍");
bind planet = text_slice(greeting, 7, 1);
print(greeting);
print(text_repeat(planet, 3));
print(text_len(greeting), text_bytes(greeting));
~~~

यह उदाहरण [प्रकाशित alpha.3 compiler source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp) से हूबहू लिया गया है; किसी प्रस्तावित syntax पर आधारित नहीं है।

## 4. पहले verify, फिर execute करें

उसी folder में जहाँ फ़ाइल रखी है, ये commands चलाएँ:

~~~sh
scarp verify text_construction.srp
scarp exec text_construction.srp
~~~

`verify` बिना सामान्य statements चलाए source और modules की types जाँचता है। `exec` प्रोग्राम चलाता है। ऊपर दिए गए code का प्रकाशित output यह है:

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

यदि Scarp `PATH` में नहीं है, तो `text_construction.srp` को extracted executable वाले folder में रखें और ऊपर लिखे `scarp` की जगह Windows PowerShell में `.\scarp.exe` या Linux/macOS पर `./scarp` उपयोग करें। वैकल्पिक रूप से executable का पूरा path दें; source फ़ाइल का नाम terminal के वर्तमान folder से resolve होता है।

यहाँ **8** Unicode scalar values की संख्या है, और **11** UTF-8 bytes की। 🌍 एक Unicode scalar value है लेकिन चार bytes लेता है।

::: warning पुरानी CLI से अंतर
प्रकाशित alpha.3 में पुराने `scarp run` और `scarp check` भी compatibility के लिए काम करते हैं। नया `verify` static है, लेकिन पुराना `check` कुछ runtime paths execute कर सकता है। `inspect ast` केवल development के लिए parser का output है, स्थिर JSON API नहीं।
:::

## 5. आगे क्या सीखें?

[प्रकाशित alpha.3 CLI reference](/hi/tooling/cli) में commands तथा exit codes और [Alpha.3 release guide](/hi/releases/v0.0.5-alpha.3) में चार जाँचे गए programs, नई CLI और structured diagnostics पढ़ें। लंबे installation और source-build चरणों के लिए [इंस्टॉलेशन](/hi/guide/installation) पृष्ठ देखें, जिसका विस्तृत आधार अभी **alpha.1** है। किसी भी feature को स्थिर मानने से पहले [भाषा की स्थिति](/hi/reference/status) देखें।

**सत्यापन:** इस पृष्ठ का program और output [alpha.3 conformance fixtures](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3) से TypeScript checks तथा CI में मिलाए जाते हैं।
