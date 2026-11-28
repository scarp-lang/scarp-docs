# वर्तमान Scarp compiler से शुरुआत करें

<!-- scarp-cli-release: v0.0.7-alpha.4 -->

नए उपयोगकर्ताओं को **नवीनतम प्रकाशित Scarp prerelease** [आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) से लेना चाहिए। 28 नवंबर 2026 तक सत्यापित प्रकाशित संस्करण **[v0.0.7-alpha.4](/hi/releases/v0.0.7-alpha.4)** है। यह Rust-आधारित **experimental interpreter** है, स्थिर भाषा specification या सामान्य native compiler नहीं।

## चरण 1: सही पैकेज इंस्टॉल करें

अपने सिस्टम का **स्थायी latest-version** लिंक इस्तेमाल करें। ये लिंक पुराने compiler के बजाय नए प्रकाशित version तक पहुँचाते हैं।

- [Windows x64 नवीनतम](https://scarp-lang.github.io/downloads/windows/latest)
- [Linux x64 नवीनतम](https://scarp-lang.github.io/downloads/linux/latest)
- [macOS Apple Silicon नवीनतम](https://scarp-lang.github.io/downloads/macos/latest)

[इंस्टॉलेशन और SHA-256 जाँच](/hi/guide/install-latest) पढ़ें। नए archive की जाँच में किसी पुराने release का checksum इस्तेमाल न करें।

## चरण 2: डाउनलोड किए compiler का version जाँचें

Extracted binary folder से अपने सिस्टम के अनुसार चलाएँ:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

दिखाया गया version archive के असली version से मिलाएँ। मशीन में कई Scarp binaries हों तो `PATH` के अनुमान के बजाय extracted executable को सीधे चलाएँ।

## चरण 3: v0.0.7-alpha.4 में प्रमाणित project चलाएँ

**प्रकाशित v0.0.7-alpha.4** में बिना filename `scarp exec` केवल **वर्तमान directory** जाँचता है। `scarp.project` अथवा पुराना `Scarp.project` manifest मिलने पर उसे validate करके घोषित entrypoint चुनता है। Manifest न हो तो `src/main.srp`, फिर `main.srp` खोजता है। गलत manifest पर fallback नहीं होता।

~~~sh
scarp exec
scarp exec main.srp
scarp verify src/main.srp
~~~

किसी खास source file के लिए `scarp exec path/to/file.srp` इस्तेमाल करें। यह interpreted program चलाता है; native executable नहीं बनाता। नए projects `scarp.project` बनाते हैं; पुराना `Scarp.project` पढ़ा जा सकता है। [वर्तमान release guide](/hi/guide/alpha7-first) देखें।

## चरण 4: वर्तमान सुविधाओं को समझें

वर्तमान alpha.4 release में Rust API से bounded native recursion (CLI से नहीं), nested private aggregates, BigInt wide exponents और file-backed BigInt operations उपलब्ध हैं; generic functions तथा string operators भी समर्थित हैं।

[वर्तमान compiler reference](/hi/reference/current) में इस रिलीज़ के exact decimal, tuple operations, entrypoint चुनाव और Lifetime व्यवहार का सार है। [Release notes](/hi/releases/v0.0.7-alpha.4) में प्रकाशित source और checksums उपलब्ध हैं।

[Systems programming और Rust embedding](/hi/guide/alpha7-first) में array concatenation, integer reductions और native ABI की सीमाएँ पढ़ें।

[वर्तमान type system guide](/hi/guide/current-types) में scalar, composite और nominal types के उदाहरण पढ़ें।

Object-only system programming के लिए [प्रयोगात्मक native-object पाठ](/hi/guide/native-object) पढ़ें।

**दस्तावेज़ नीति:** नए इंस्टॉलेशन में केवल नवीनतम प्रकाशित compiler सुझाया जाएगा। पुराने संस्करणों के पृष्ठ active navigation, search और sitemap से हटा दिए गए हैं। पुराने source और conformance tests Git repository में केवल पुनः परीक्षण के प्रमाण के लिए सुरक्षित हैं।

[Generic functions और strings](/hi/guide/v007-alpha3-generics-strings) तथा [Native aggregate locals](/hi/guide/native-aggregate-locals) के नए पाठ पढ़ें।

[alpha.4 सिस्टम पाठ](/hi/guide/v007-alpha4-systems) और [BigInt wide-exponent पाठ](/hi/guide/v007-alpha4-bigint) से इस प्रकाशित compiler की सीमाएँ जाँचें।
