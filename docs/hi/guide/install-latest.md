# नवीनतम प्रकाशित Scarp इंस्टॉल करें

<!-- scarp-cli-release: v0.0.7-alpha.3 -->

**आधिकारिक डाउनलोड:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/)।

27 नवंबर 2026 तक नवीनतम सत्यापित प्रकाशित compiler **[Scarp v0.0.7-alpha.3](/hi/releases/v0.0.7-alpha.3)** है। यह experimental interpreter prerelease है। भविष्य के नए प्रकाशित संस्करणों के लिए पुराने इंस्टॉलेशन पेज नहीं, आधिकारिक Downloads वेबसाइट इस्तेमाल करें।

## अपना सिस्टम चुनें

| ऑपरेटिंग सिस्टम | हमेशा नवीनतम डाउनलोड लिंक | उपलब्ध architecture |
| --- | --- | --- |
| Windows | [Windows के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Linux के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [macOS के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

ये स्थायी लिंक प्रकाशित releases, जिनमें prereleases भी शामिल हैं, में नवीनतम पैकेज खोजते हैं। इनके लिए JavaScript आवश्यक है। Windows ARM64, Linux ARM64 और Intel macOS के लिए binary उपलब्ध होने का दावा नहीं किया गया है।

## चलाने से पहले SHA-256 जाँचें

[आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) पर archive का वास्तविक version जाँचें। Extract या execute करने से पहले **उसी version** की प्रकाशित SHA-256 value से मिलाएँ। नए संस्करण के लिए पुराने v0.0.7-alpha.3 checksum का उपयोग न करें।

| सत्यापित v0.0.7-alpha.3 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.7-alpha.2-x86_64-pc-windows-msvc.zip` | `b92da1ab3f2c0e57daee46b494c66f67165843e8b4040aad02262062a2bbe310` |
| Linux x64 `scarp-0.0.7-alpha.2-x86_64-unknown-linux-gnu.tar.gz` | `61de8af415f9e9650c3d6865f1821eba799a6fab45e8ff57bc5f4a115f82b989` |
| macOS ARM64 `scarp-0.0.7-alpha.2-aarch64-apple-darwin.tar.gz` | `7bc234c84b7d21ff359ff2440d5bd179b8c2c3a5105c7cd2e2af7faceb1b2e4e` |

ये hash **सिर्फ** [प्रकाशित v0.0.7-alpha.3 archives](https://github.com/scarp-lang/scarp/releases/tag/v0.0.7-alpha.3) के लिए हैं। Hash सही होना experimental software के production-ready होने की गारंटी नहीं है। Mismatch होने पर **आगे न बढ़ें**।

## डाउनलोड किया interpreter जाँचें

सत्यापित archive को अपने folder में extract करें और उसी के executable को चलाएँ, `PATH` के किसी पुराने binary को नहीं:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

Output में version डाउनलोड किए archive से मिलना चाहिए। v0.0.7-alpha.3 में `scarp exec` valid project manifest, फिर `src/main.srp`, और उसके बाद `main.srp` को प्राथमिकता से चुनता है। खराब manifest त्रुटि देता है। सही project directory में, जब executable उपलब्ध हो:

~~~sh
scarp exec
~~~

[वर्तमान संदर्भ](/hi/reference/current) और [वर्तमान release guide](/hi/guide/alpha7-first) में वर्तमान व्यवहार और सीमाएँ देखें।

> पुराने release पेज अपने मूल compiler के परीक्षण सुरक्षित रखने के लिए हैं; वे नई binary इंस्टॉल करने की सलाह नहीं हैं।
