# अपना पहला Scarp प्रोग्राम

**पहली बार Scarp सीख रहे हैं?** नए compiler, checksum जाँच और static `verify` command के लिए [प्रकाशित alpha.3 quickstart](/hi/guide/quickstart-alpha3) से शुरू करें। यह पुरानी guide जानबूझकर alpha.1 पर आधारित है।

यह मुख्य शुरुआती गाइड **v0.0.5-alpha.1** के लिए है। प्रकाशित **alpha.2** पर पुराने 11 compiler examples को बिना बदले चलाने वाली [सत्यापित अपग्रेड गाइड](/hi/reference/upgrade-readiness) पढ़ें। इससे हर अन्य program के compatible होने की गारंटी नहीं है।

## फ़ाइल बनाएँ

UTF-8 में `hello.srp` नाम की फ़ाइल बनाएँ और यह कोड लिखें:

~~~scarp
print("नमस्ते Scarp!");
print(1 + 2 * 3);
~~~

`print` हर आउटपुट के बाद नई पंक्ति जोड़ता है। गुणा को जोड़ से पहले किया जाता है, इसलिए दूसरी पंक्ति का परिणाम `7` है। हर statement के अंत में `;` लिखना आवश्यक है।

## फ़ाइल चलाएँ

इंस्टॉल किए गए interpreter से `scarp run hello.srp` चलाएँ। Source checkout में `cargo run -- run hello.srp` इस्तेमाल करें।

## बिना आउटपुट सत्यापन

`scarp check hello.srp` नाम, प्रकार और चयनित execution path की जाँच करता है, लेकिन सफल होने पर कोई प्रोग्राम आउटपुट नहीं देता। `scarp tokens hello.srp` केवल lexer के टोकन दिखाता है और पूरे प्रोग्राम का सत्यापन नहीं करता।

## मान बदलें

`bind count = 3;` अपरिवर्तनीय मान बनाता है, जबकि `var count = 3;` को बाद में `count += 1;` से बदला जा सकता है। स्कोप की पूरी व्याख्या [वेरिएबल](/hi/language/variables) में है।

## आगे क्या पढ़ें?

सबसे पहले वास्तविक फ़ंक्शन कोड वाला [सत्यापित फ़ंक्शन ट्यूटोरियल](/hi/tutorials/verified-functions) पढ़ें। उसके बाद [सत्यापित उदाहरण](/hi/examples/) और [कंट्रोल फ्लो](/hi/language/control-flow) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
// hello.srp
bind language = "Scarp";
print("Hello from", language);
print(1 + 2 * 3);
~~~

~~~sh
scarp run hello.srp
~~~

~~~text
Hello from Scarp
7
~~~

~~~sh
scarp check hello.srp
~~~

~~~sh
scarp tokens hello.srp
~~~

~~~scarp
var visits = 1;
visits += 1;
print("Visits:", visits);
~~~
