# Scarp भाषा का अवलोकन

Scarp के प्रोग्राम UTF-8 `.srp` फ़ाइलों में होते हैं। इस दस्तावेज़ का आधार v0.0.5-alpha.1 है और सभी वर्णित सुविधाएँ प्रयोगात्मक हैं।

## छोटा प्रोग्राम

~~~scarp
bind base = 6;
var height = 7;
print(base * height);
height += 1;
if height > 7 { print("बदला हुआ मान:", height); }
~~~

## स्रोत कोड के नियम

लाइन टिप्पणी `//` से शुरू होती है। नाम ASCII अक्षर या `_` से शुरू होकर अक्षर, अंक और `_` रख सकते हैं; नाम case-sensitive हैं। `;` statements को समाप्त करता है। `{}` lexical blocks बनाते हैं। स्ट्रिंग में `\`, `"`, `
`, `	` और `
` escapes समर्थित हैं।

## संदर्भ अनुभाग

[डेटा प्रकार](/hi/language/types), [वेरिएबल](/hi/language/variables), [ऑपरेटर](/hi/language/operators), [कंट्रोल फ्लो](/hi/language/control-flow), [फ़ंक्शन](/hi/language/functions) और [मॉड्यूल](/hi/language/modules) क्रम से पढ़ें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
pure funcra double(value: integer) -> integer {
    return value * 2;
}
var n = 3;
while n < 6 {
    print(double(n));
    n += 1;
}
~~~

~~~text
6
8
10
~~~
