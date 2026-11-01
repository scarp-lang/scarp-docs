# GitHub Pages डिप्लॉयमेंट इतिहास

Scarp documentation repository की `main` branch पर परिवर्तन merge होने के बाद GitHub Actions वेबसाइट प्रकाशित करता है। **एक ही deployment** में अंग्रेज़ी और हिन्दी दोनों भाषाओं के पृष्ठ शामिल होते हैं। केवल संख्या बढ़ाने के लिए deployments दोहराना जरूरी नहीं है।

<PagesDeployments />

ऊपर दी गई संख्या GitHub की सार्वजनिक API से आती है। यह `pages.yml` workflow के **सफल runs की संख्या** है, कुल commits या अलग-अलग features की संख्या नहीं। यदि API rate-limit के कारण संख्या उपलब्ध नहीं है, तो नीचे दिया गया workflow इतिहास देखें।

## पिछली deployments कैसे देखें?

- [GitHub Pages workflow इतिहास](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml) — बिल्ड और deploy jobs के परिणाम।
- [Repository deployments](https://github.com/scarp-lang/scarp-docs/deployments) — GitHub पर दर्ज deployment records।
- [अंग्रेज़ी वेबसाइट](https://scarp-lang.github.io/scarp-docs/) और [हिन्दी वेबसाइट](https://scarp-lang.github.io/scarp-docs/hi/) — प्रकाशित पृष्ठ खोलकर जाँचें।

[Documentation CI](https://github.com/scarp-lang/scarp-docs/actions/workflows/ci.yml) source links, अनुवाद parity और compiler conformance जाँचती है। Compiler के लिए [फीचर स्थिति](/hi/reference/status) देखें।
