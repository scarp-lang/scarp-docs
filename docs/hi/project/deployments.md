# GitHub Pages डिप्लॉयमेंट इतिहास

Scarp documentation repository की `main` branch पर परिवर्तन merge होने के बाद GitHub Actions वेबसाइट प्रकाशित करता है। **एक ही deployment** में अंग्रेज़ी और हिन्दी दोनों भाषाओं के पृष्ठ शामिल होते हैं। केवल संख्या बढ़ाने के लिए deployments दोहराना जरूरी नहीं है।

<PagesDeployments />

ऊपर दी गई संख्या GitHub की सार्वजनिक API से आती है। यह `pages.yml` workflow के **सफल runs की संख्या** है, कुल commits या अलग-अलग features की संख्या नहीं। यदि API rate-limit के कारण संख्या उपलब्ध नहीं है, तो नीचे दिया गया workflow इतिहास देखें।

## पिछली deployments कैसे देखें?

- [GitHub Pages workflow इतिहास](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml) — बिल्ड और deploy jobs के परिणाम।
- [Repository deployments](https://github.com/scarp-lang/scarp-docs/deployments) — GitHub पर दर्ज deployment records।
- [अंग्रेज़ी वेबसाइट](https://scarp-lang.github.io/scarp-docs/) और [हिन्दी वेबसाइट](https://scarp-lang.github.io/scarp-docs/hi/) — प्रकाशित पृष्ठ खोलकर जाँचें।

[Documentation CI](https://github.com/scarp-lang/scarp-docs/actions/workflows/ci.yml) source links, अनुवाद parity और compiler conformance जाँचती है। Compiler के लिए [फीचर स्थिति](/hi/reference/status) देखें।

## Deployment के बाद स्वचालित जाँच

Pages प्रकाशित होने के बाद `smoke` job अंग्रेज़ी और हिन्दी के **10 वास्तविक URLs** खोलकर जाँचती है। इसमें nested clean URLs, नवीनतम alpha.6 guide और community pages शामिल हैं। यह HTTP 200, पृष्ठ की भाषा, canonical और परस्पर `hreflang` tags, sitemap तथा JavaScript/CSS assets के उपलब्ध होने की पुष्टि करती है। कुछ देर तक नया deployment दिखाई न देने पर दोबारा प्रयास होता है; लगातार गलती रहने पर workflow असफल होगा। Documentation CI में इसके **बिना नेटवर्क वाले regression tests** भी चलते हैं।

यह HTTP परीक्षण **ब्राउज़र में हाथ से होने वाली जाँच का विकल्प नहीं** है। [Deployment QA issue](https://github.com/scarp-lang/scarp-docs/issues/3) बंद करने से पहले mobile sidebar, keyboard navigation, Ctrl/⌘+K search, dark/light contrast, copy buttons और browser console errors भी जाँचें।
