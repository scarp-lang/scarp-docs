# Scarp का परिचय

**नवीनतम प्रकाशित compiler [v0.0.6-alpha.8](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.8) है।** इस experimental prerelease में नया declarative `scarp.project`, project `init/run/verify`, `scarp test`, file-specific `.stdin` fixtures, `scarp project info` और native `assert` statement उपलब्ध हैं। [आधिकारिक package और SHA-256](/hi/releases/v0.0.6-alpha.8), [सत्यापित calculator tutorial](/hi/tutorials/calculator-alpha8), [project CLI](/hi/tooling/project-alpha8) तथा [learning path](/hi/guide/learning-path) देखें। पिछले [alpha.7 conditional expressions और Unicode escapes](/hi/releases/v0.0.6-alpha.7) अलग ऐतिहासिक evidence पर आधारित हैं। सामान्य native compiler, BigInt, package registry या stable ABI अभी प्रकाशित नहीं हुए।

**Scarp** एक प्रयोगात्मक, Rust में बनाया गया interpreted प्रोग्रामिंग लैंग्वेज है। एक पुराना प्रकाशित compiler **[v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5)** है। इस सामान्य भाषा-परिचय का सत्यापित आधार अभी **v0.0.5-alpha.1** है। पुराने [alpha.4 tagged release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [alpha.4 installation guide](/hi/guide/installation), [alpha.4 project quickstart](/hi/guide/quickstart-alpha4) और [alpha.3 CLI संदर्भ](/hi/tooling/cli) को उनके अपने releases का ऐतिहासिक विवरण समझें। यह अभी स्थिर (stable) भाषा विनिर्देश नहीं है; सिंटैक्स और API भविष्य में बदल सकते हैं। [आधिकारिक compiler](https://github.com/scarp-lang/scarp) ही व्यवहार का मूल स्रोत है।

Scarp प्रोग्राम सामान्यतः UTF-8 `.srp` फ़ाइलों में लिखे जाते हैं। lexer टोकन पढ़ता है, parser संरचना समझता है, resolver नाम और प्रकार की जाँच करता है और interpreter प्रोग्राम चलाता है।

## अभी क्या उपलब्ध है?

`bind` और `var`, 64-बिट पूर्णांक, सीमित `float`, `string`, `boolean`, `if`/`elif`/`else`, `while`, `repeat`, `funcra` फ़ंक्शन, वैक्टर, टाइल तथा source modules उपलब्ध हैं। सभी सुविधाएँ **प्रयोगात्मक** हैं। Native-code compiler, package manager, सामान्य standard library और user-defined classes अभी उपलब्ध नहीं हैं।

किसी keyword या CLI command को ढूँढने के लिए [हिन्दी search और navigation मार्गदर्शिका](/hi/guide/search-and-navigation) खोलें। Search का interface भी हिन्दी में है और पुराने releases के tutorials अलग रहते हैं।

## दस्तावेज़ कैसे पढ़ें?

नए सीखने वालों को पहले [पूरा learning path](/hi/guide/learning-path) और फिर [प्रकाशित alpha.8 calculator project](/hi/tutorials/calculator-alpha8) पढ़ना चाहिए। [पुराना v0.0.6-alpha.1 project lab](/hi/tutorials/project-symbol-navigation-alpha6) तथा [पुराना पहला प्रोग्राम](/hi/guide/first-program) अपने-अपने release पर pinned हैं। [वेरिएबल](/hi/language/variables), [फ़ंक्शन](/hi/language/functions), [CLI](/hi/tooling/cli) और [feature status](/hi/reference/status) भी देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~
