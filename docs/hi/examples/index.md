# सत्यापित Scarp उदाहरण

ये उदाहरण प्रकाशित compiler `v0.0.5-alpha.1` की fixtures से जुड़े हैं। केवल सिंटैक्स दिखाने के बजाय CI इनके अपेक्षित stdout की **byte-by-byte** तुलना करता है।

## Hello Scarp

~~~scarp
print("Hello from Scarp!");
~~~

आउटपुट में `Hello from Scarp!` के बाद newline होगा।

## सुरक्षित अंकगणित

`integer` में overflow और शून्य से भाग अस्वीकार किए जाते हैं। `print(1 + 2 * 3);` का आउटपुट `7` होता है।

## फ़ंक्शन और calls

`funcra` में parameters व return types घोषित होते हैं। `examples/functions.srp` में forward declarations, return और `unit` दिखते हैं।

## मॉड्यूल जोड़ना

`examples/module_demo.srp` दो relative source modules (`modules/linear.srp` और `modules/settings.srp`) import करके vector results दिखाता है।

## स्वचालित जाँच

`conformance/manifest.json` में आठ कार्यक्रमों और उनके expected outputs का प्रमाण है: `hello`, `functions`, `loops`, `repeat`, `output`, `vectors`, `module_demo`, `matrix_forward`। `npm run check:fixtures` identities जाँचता है; `npm run test:compiler -- /path/to/scarp` वास्तविक interpreter output जाँचता है। [सत्यापन नीति](/hi/reference/evidence) पढ़ें। [फ़ंक्शन](/hi/tutorials/verified-functions), [लूप](/hi/tutorials/repeat-and-loops), [आउटपुट और newline](/hi/tutorials/verified-output), [न्यूमेरिकल वैक्टर](/hi/tutorials/verified-vectors) तथा [मॉड्यूल](/hi/tutorials/modules-walkthrough) और [टाइल](/hi/tutorials/verified-tiles) के पूरे प्रोग्राम चरणबद्ध चलाएँ। प्रकाशित compiler के आठों conformance उदाहरण दोनों भाषाओं में शामिल हैं।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
print("Hello from Scarp!");
~~~

~~~scarp
print(1 + 2 * 3);            // 7
print((1 + 2) * 3);          // 9
print(-7 / 2);               // -3
~~~

~~~scarp
funcra add(a: integer, b: integer) -> integer {
    return a + b;
}
funcra square(value: integer) -> integer {
    return value * value;
}
print(add(10, square(5))); // 35
~~~

~~~sh
scarp run examples/module_demo.srp
scarp check examples/module_demo.srp
~~~
