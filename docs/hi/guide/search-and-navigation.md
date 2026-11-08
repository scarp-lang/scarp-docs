# Scarp Docs में खोजें और पृष्ठ खोलें

Scarp के सही keyword, compiler command या किसी प्रकाशित release के example को आधिकारिक दस्तावेज़ में खोज सकते हैं। English और हिन्दी पृष्ठों के लिए **Scarp Docs की अपनी local search** उपलब्ध है। Search queries किसी बाहरी search provider को नहीं भेजी जातीं।

## Search कैसे खोलें?

1. ऊपर navigation में **दस्तावेज़ खोजें** चुनें। Windows/Linux पर **Ctrl+K** तथा macOS पर **⌘+K** भी दबा सकते हैं।
2. `funcra`, `Scarp.project`, `inspect ast`, `RMS` या `E0034` जैसे keyword लिखें।
3. Arrow keys से परिणाम बदलें और **Enter** से संबंधित पृष्ठ खोलें। Search बंद करने के लिए **Esc** दबाएँ।
4. **English / हिन्दी** language switcher से दूसरी भाषा के दस्तावेज़ चुनें और फिर खोजें।

Search button के साथ दिखाई देने वाला **K** shortcut, उसके accessible name में भी शामिल है, ताकि screen-reader और keyboard users को एक-समान जानकारी मिले। हिन्दी पृष्ठों में search button, परिणाम न मिलने का संदेश और keyboard सहायता हिन्दी में दिखाई जाती है। Search हिन्दी दस्तावेज़ों को सीधे index करती है; यह English उत्तरों का अपने-आप **अनुवाद नहीं** करती। Scarp code के keywords तथा release tags मूल लिखावट में ही रहते हैं।

## सही compiler version चुनें

Search परिणाम में कोई **पुराना** tutorial भी हो सकता है। Code चलाने से पहले [सात-चरण वाला learning path](/hi/guide/learning-path), [नवीनतम प्रकाशित compiler डाउनलोड](/hi/releases/v0.0.6-alpha.4) और [प्रकाशित feature status](/hi/reference/status) देखें। मुख्य language reference alpha.1 पर आधारित है; नई सुविधाएँ अपने अलग प्रकाशित compiler releases से सत्यापित हैं।

सही CLI command पहचानने के लिए [alpha.6 CLI](/hi/tooling/cli-alpha6), [AST inspection](/hi/tooling/inspect-ast-alpha6) तथा [troubleshooting](/hi/tooling/troubleshooting) पढ़ें। [English search help](/guide/search-and-navigation) भी उपलब्ध है।

## कोई परिणाम न मिले तो

Keyword की spelling जाँचें, छोटा शब्द खोजें या भाषा बदलें। Local search को परिणाम दिखाने के लिए browser में JavaScript चाहिए, क्योंकि index static website से लोड होता है। Offline Chromium परीक्षण में कोई परिणाम न मिलने वाला संदेश और search button से खोलने के बाद **Esc** दबाने पर keyboard focus वापस आने की भी जाँच होती है। Search विफल होने से यह सिद्ध **नहीं** होता कि compiler में कोई सुविधा नहीं है। ऐसे में [learning path](/hi/guide/learning-path) या [प्रकाशित compiler release](/hi/releases/v0.0.6-alpha.4) से सीधे आगे बढ़ें।

## Keyboard और clipboard accessibility

Search में परिणाम आने के बाद **↓** से पहला link, **↑** से आखिरी link चुन सकते हैं। परिणामों में ↑/↓ से आगे-पीछे जाएँ; **Enter** से link खोलें। **Tab** से भी सामान्य क्रम में चल सकते हैं और **Esc** से search बंद कर सकते हैं। Search button से खोलने पर बंद करने के बाद focus उसी button पर लौटता है।

[Version-aware Command Finder](/hi/tooling/command-finder) में keyboard से compiler version चुन सकते हैं। पुराने version में अनुपलब्ध commands का स्पष्ट हिन्दी संदेश मिलता है। **कॉपी करें** काम न करे या browser permission मना कर दे, तो command text चयन के लिए उपलब्ध रहता है। स्वचालित Chromium परीक्षण keyboard, अनुमति-अस्वीकृति, 320px layout और reduced-motion की जाँच करते हैं; इन्हें **manual screen-reader या पूर्ण WCAG certification** न समझें।
