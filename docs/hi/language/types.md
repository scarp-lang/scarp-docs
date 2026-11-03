# डेटा प्रकार और मान

Scarp की वर्तमान प्रायोगिक प्रणाली में `integer`, `float`, `boolean`, `string`, विशेष संख्यात्मक `vector` और `tile` तथा फ़ंक्शन परिणाम `unit` उपलब्ध हैं। Local bindings अपने initializer से प्रकार प्राप्त करते हैं।

## पूर्णांक और सुरक्षित गणित

`integer` signed 64-bit (`i64`) है। वैध सीमा `-9223372036854775808` से `9223372036854775807` है। Overflow (E0007) और शून्य से भाग (E0008) त्रुटि देते हैं। पूर्णांक भागफल शून्य की ओर truncate होता है, जैसे `-7 / 2` का परिणाम `-3`।

## सीमित float

`float` IEEE-754 binary64 का केवल सीमित (finite) मान स्वीकार करता है। `1.5` और `2.5e-3` वैध उदाहरण हैं; `NaN`, infinite परिणाम या `1e309` वैध नहीं। `1` को स्वतः `1.0` में नहीं बदला जाता। लगभग बराबर दशमलव संख्याओं में binary rounding दिखाई दे सकता है।

## स्ट्रिंग और boolean

डबल कोट्स में UTF-8 text रखें। `true`, `false` boolean हैं; `and`, `or`, `not` boolean operands लेते हैं। स्ट्रिंग जोड़ना, indexing और interpolation वर्तमान में समर्थित नहीं हैं। आउटपुट के लिए `print("count:", 3);` लिख सकते हैं।

## विशेष संख्यात्मक संग्रह

`[1.0, 2.0]` immutable floating-point vector है। `tile([...], rows, cols)` immutable 2D संरचना बनाता है। सामान्य-purpose arrays/maps या user-defined types अभी उपलब्ध नहीं हैं। विवरण [वैक्टर/टाइल](/hi/language/numerics) में है।

## नए alpha.2 में integers और type annotations

प्रकाशित [v0.0.5-alpha.2](/hi/releases/v0.0.5-alpha.2) में immutable **`integers`** collection और `bind`/`var` में optional checked type annotations उपलब्ध हैं। [प्रमाणित typed bindings और numeric conversions पाठ](/hi/language/typed-bindings-alpha2) में दोनों पूरे published programs तथा उनकी exact output हैं। यह `float` वाले `vector` से अलग type है। [Compiler-verified collections tutorial](/hi/tutorials/alpha2-collections-and-learning) में range, window, replacement और स्पष्ट float-vector conversion के पूरे उदाहरण हैं। पुरानी alpha.1 सूची में इन्हें उपलब्ध न मानें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind fraction = 0.5;
var total = 1.0;
total += fraction;
print(total, 1 / 2, 1.0 / 2.0);
~~~
