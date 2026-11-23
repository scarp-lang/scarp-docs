# नवीनतम प्रकाशित Scarp इंस्टॉल करें

**आधिकारिक डाउनलोड:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/)।

23 नवंबर 2026 तक नवीनतम सत्यापित प्रकाशित compiler **[Scarp v0.0.6-alpha.18](/hi/releases/v0.0.6-alpha.18)** है। यह experimental interpreter prerelease है। भविष्य के नए प्रकाशित संस्करणों के लिए पुराने इंस्टॉलेशन पेज नहीं, आधिकारिक Downloads वेबसाइट इस्तेमाल करें।

## अपना सिस्टम चुनें

| ऑपरेटिंग सिस्टम | हमेशा नवीनतम डाउनलोड लिंक | उपलब्ध architecture |
| --- | --- | --- |
| Windows | [Windows के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Linux के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [macOS के लिए नवीनतम Scarp](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

ये स्थायी लिंक प्रकाशित releases, जिनमें prereleases भी शामिल हैं, में नवीनतम पैकेज खोजते हैं। इनके लिए JavaScript आवश्यक है। Windows ARM64, Linux ARM64 और Intel macOS के लिए binary उपलब्ध होने का दावा नहीं किया गया है।

## चलाने से पहले SHA-256 जाँचें

[आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) पर archive का वास्तविक version जाँचें। Extract या execute करने से पहले **उसी version** की प्रकाशित SHA-256 value से मिलाएँ। नए संस्करण के लिए पुराने alpha.18 checksum का उपयोग न करें।

| सत्यापित alpha.18 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.6-alpha.18-x86_64-pc-windows-msvc.zip` | `1dbd8e9f6dbb3e727fb765b5a1bf184f8574c8b139289269b65a7d889d60e6b0` |
| Linux x64 `scarp-0.0.6-alpha.18-x86_64-unknown-linux-gnu.tar.gz` | `175fc419b1469e80dbf3cd7ccee273eb573a9113e27467801ef7095c064b289f` |
| macOS ARM64 `scarp-0.0.6-alpha.18-aarch64-apple-darwin.tar.gz` | `30aed1c56fc666f86dca6c08234d8ac17d9f5ee513a4270d7a65f80544dc2c52` |

ये hash **सिर्फ** [प्रकाशित alpha.18 archives](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.18) के लिए हैं। Hash सही होना experimental software के production-ready होने की गारंटी नहीं है। Mismatch होने पर **आगे न बढ़ें**।

## डाउनलोड किया interpreter जाँचें

सत्यापित archive को अपने folder में extract करें और उसी के executable को चलाएँ, `PATH` के किसी पुराने binary को नहीं:

~~~powershell
# Windows PowerShell: extracted binary folder से
.\scarp.exe version
~~~

~~~sh
# Linux / macOS: extracted binary folder से
./scarp version
~~~

Output में version डाउनलोड किए archive से मिलना चाहिए। Alpha.18 में `scarp exec` valid project manifest, फिर `src/main.srp`, और उसके बाद `main.srp` को प्राथमिकता से चुनता है। खराब manifest त्रुटि देता है। सही project directory में, जब executable उपलब्ध हो:

~~~sh
scarp exec
~~~

सत्यापित व्यवहार के लिए [alpha.18 Exec और Lifetime](/hi/guide/exec-and-lifetime-alpha18), सीमाओं के लिए [फीचर स्थिति](/hi/reference/status) और आगे पढ़ने के लिए [सीखने का मार्ग](/hi/guide/learning-path) देखें।

> पुराने release पेज अपने मूल compiler के परीक्षण सुरक्षित रखने के लिए हैं; वे नई binary इंस्टॉल करने की सलाह नहीं हैं।
