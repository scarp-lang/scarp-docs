# आउटपुट और स्ट्रीम

Scarp में आउटपुट **statements** होते हैं; ये सामान्य expression-valued functions नहीं हैं।

| Statement | स्ट्रीम | नई पंक्ति |
| --- | --- | --- |
| `print(...)` | stdout | हाँ |
| `println(...)` | stdout | हाँ; `print` का alias |
| `write(...)` | stdout | नहीं |
| `eprint(...)` | stderr | हाँ |
| `ewrite(...)` | stderr | नहीं |

## उदाहरण

~~~scarp
write("नमस्ते, ");
print("Scarp", 3, true);
print();
~~~

कई arguments के बीच एक ASCII space आती है; वैकल्पिक trailing comma स्वीकार है। `print()` भी एक नई पंक्ति लिखता है।

## stderr और त्रुटियों में अंतर

`eprint`/`ewrite` का output stderr पर जाना अपने-आप failure नहीं है। स्रोत/गणना त्रुटियाँ कार्यक्रम का pending output लिखने से पहले पकड़ी जाती हैं; लिखते समय I/O failure पहले लिखे bytes को वापस नहीं कर सकता। Exit code देखकर वास्तविक असफलता पहचानें।

## जो अभी उपलब्ध नहीं

स्ट्रिंग interpolation, custom format strings और arbitrary formatting APIs मौजूद नहीं हैं। आउटपुट के लिए comma-separated values का उपयोग करें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind language = "Scarp";
write("Hello, ");
print(language, true);
print();
write("done");
~~~
