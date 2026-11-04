# Scarp का परिचय

**नवीनतम प्रकाशित compiler [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) है।** इसमें project-directory module inspection उपलब्ध है। नए users [alpha.5 इंस्टॉलेशन](/hi/guide/installation-alpha5) और [alpha.5 CLI](/hi/tooling/cli-alpha5) से शुरू करें। प्रयोगात्मक C11 emitter Rust API में है, Scarp CLI native compiler में नहीं।

**Scarp** एक प्रयोगात्मक, Rust में बनाया गया interpreted प्रोग्रामिंग लैंग्वेज है। पिछला प्रकाशित compiler **[v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4)** है, जिसमें interpreter-आधारित project workflow उपलब्ध है। इस सामान्य भाषा-परिचय का सत्यापित आधार अभी **v0.0.5-alpha.1** है। नए इंस्टॉलेशन के लिए [alpha.4 installation guide](/hi/guide/installation) और [alpha.4 project quickstart](/hi/guide/quickstart-alpha4) देखें। [alpha.3 CLI संदर्भ](/hi/tooling/cli) में individual-file commands का विवरण है। यह अभी स्थिर (stable) भाषा विनिर्देश नहीं है; सिंटैक्स और API भविष्य में बदल सकते हैं। [आधिकारिक compiler](https://github.com/scarp-lang/scarp) ही व्यवहार का मूल स्रोत है।

Scarp प्रोग्राम सामान्यतः UTF-8 `.srp` फ़ाइलों में लिखे जाते हैं। lexer टोकन पढ़ता है, parser संरचना समझता है, resolver नाम और प्रकार की जाँच करता है और interpreter प्रोग्राम चलाता है।

## अभी क्या उपलब्ध है?

`bind` और `var`, 64-बिट पूर्णांक, सीमित `float`, `string`, `boolean`, `if`/`elif`/`else`, `while`, `repeat`, `funcra` फ़ंक्शन, वैक्टर, टाइल तथा source modules उपलब्ध हैं। सभी सुविधाएँ **प्रयोगात्मक** हैं। Native-code compiler, package manager, सामान्य standard library और user-defined classes अभी उपलब्ध नहीं हैं।

## दस्तावेज़ कैसे पढ़ें?

[प्रकाशित alpha.4 इंस्टॉलेशन](/hi/guide/installation) के बाद [alpha.4 project quickstart](/hi/guide/quickstart-alpha4) अपनाएँ। [पुराना पहला प्रोग्राम](/hi/guide/first-program) alpha.1 संदर्भ के लिए उपलब्ध है। फिर [वेरिएबल](/hi/language/variables), [फ़ंक्शन](/hi/language/functions), [CLI](/hi/tooling/cli) और [फीचर की स्थिति](/hi/reference/status) देखें। अंग्रेज़ी और हिन्दी पृष्ठों में compiler की वास्तविक भाषा और कोड समान रखे जाते हैं।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
// Valid in v0.0.5-alpha.1
bind message = "Hello, Scarp!";
print(message);
~~~
