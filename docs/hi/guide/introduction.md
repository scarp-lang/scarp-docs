# Scarp का परिचय

**नवीनतम प्रकाशित compiler [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6) है।** इस प्रयोगात्मक प्री-रिलीज़ में सीमित redirected input, स्पष्ट scalar/text conversion और immutable अलग-अलग प्रकार वाले tuples आए हैं। पुराने [alpha.5 numerical functions](/hi/releases/v0.0.6-alpha.5) तथा [alpha.3 Top-K/softmax](/hi/releases/v0.0.6-alpha.3) अपने ऐतिहासिक versions पर आधारित हैं। [नवीनतम archive और SHA-256 जानकारी](/hi/releases/v0.0.6-alpha.6) तथा [सात चरणों वाला learning path](/hi/guide/learning-path) पढ़ें। सामान्य native compiler, interactive input prompt या stable ABI अभी **नहीं** है।

**Scarp** एक प्रयोगात्मक, Rust में बनाया गया interpreted प्रोग्रामिंग लैंग्वेज है। एक पुराना प्रकाशित compiler **[v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5)** है। इस सामान्य भाषा-परिचय का सत्यापित आधार अभी **v0.0.5-alpha.1** है। पुराने [alpha.4 tagged release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [alpha.4 installation guide](/hi/guide/installation), [alpha.4 project quickstart](/hi/guide/quickstart-alpha4) और [alpha.3 CLI संदर्भ](/hi/tooling/cli) को उनके अपने releases का ऐतिहासिक विवरण समझें। यह अभी स्थिर (stable) भाषा विनिर्देश नहीं है; सिंटैक्स और API भविष्य में बदल सकते हैं। [आधिकारिक compiler](https://github.com/scarp-lang/scarp) ही व्यवहार का मूल स्रोत है।

Scarp प्रोग्राम सामान्यतः UTF-8 `.srp` फ़ाइलों में लिखे जाते हैं। lexer टोकन पढ़ता है, parser संरचना समझता है, resolver नाम और प्रकार की जाँच करता है और interpreter प्रोग्राम चलाता है।

## अभी क्या उपलब्ध है?

`bind` और `var`, 64-बिट पूर्णांक, सीमित `float`, `string`, `boolean`, `if`/`elif`/`else`, `while`, `repeat`, `funcra` फ़ंक्शन, वैक्टर, टाइल तथा source modules उपलब्ध हैं। सभी सुविधाएँ **प्रयोगात्मक** हैं। Native-code compiler, package manager, सामान्य standard library और user-defined classes अभी उपलब्ध नहीं हैं।

किसी keyword या CLI command को ढूँढने के लिए [हिन्दी search और navigation मार्गदर्शिका](/hi/guide/search-and-navigation) खोलें। Search का interface भी हिन्दी में है और पुराने releases के tutorials अलग रहते हैं।

## दस्तावेज़ कैसे पढ़ें?

नए सीखने वालों को पहले [पूरा learning path](/hi/guide/learning-path), फिर [alpha.6 release](/hi/releases/v0.0.6-alpha.1) और [alpha.6 project lab](/hi/tutorials/project-symbol-navigation-alpha6) पढ़ना चाहिए। [पुराना पहला प्रोग्राम](/hi/guide/first-program) alpha.1 संदर्भ के लिए उपलब्ध है। फिर [वेरिएबल](/hi/language/variables), [फ़ंक्शन](/hi/language/functions), [CLI](/hi/tooling/cli) और [फीचर की स्थिति](/hi/reference/status) देखें। अंग्रेज़ी और हिन्दी पृष्ठों में compiler की वास्तविक भाषा और कोड समान रखे जाते हैं।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~
