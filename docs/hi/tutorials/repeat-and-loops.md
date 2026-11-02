# `repeat` और `while` लूप: सत्यापित उदाहरण

Scarp के प्रयोगात्मक **v0.0.5-alpha.1** इंटरप्रेटर में दो प्रकार के लूप हैं। `repeat` किसी संख्या के अनुसार निश्चित बार चलता है और `while` हर बार चलने से पहले boolean शर्त जाँचता है। इस पृष्ठ के पूरे प्रोग्राम और आउटपुट आधिकारिक compiler fixtures से लिए गए हैं।

## 1. `repeat`: निश्चित संख्या में दोहराना

`repeat.srp` फ़ाइल में नीचे का **पूरा कोड** लिखें:

~~~scarp
// The count is saved once; changing count does not shorten this loop.
var count = 5;
var total = 0;
repeat count as index {
    count = 0;
    if index == 2 { continue; }
    total += index;
}
print(total);
print(count);
~~~

अब `scarp check repeat.srp` और फिर `scarp run repeat.srp` चलाएँ। अपेक्षित आउटपुट:

~~~text
8
0
~~~

**समझें:** शुरुआत में `count` का मान `5` एक बार सुरक्षित कर लिया जाता है। बाद में लूप के अंदर `count = 0` लिखने से पाँच iterations की तय संख्या नहीं बदलती। `index == 2` होने पर `continue;` उस बार का जोड़ छोड़ देता है। इसलिए `0 + 1 + 3 + 4 = 8` और आखिर में `count` का मान `0` होता है।

`as index` से मिला index बदला नहीं जा सकता और केवल लूप के अंदर रहता है। गिनती शून्य हो तो लूप नहीं चलता; नकारात्मक गिनती में **E0019** error आता है। भले ही count शून्य हो, कोड का type सही होना चाहिए।

**प्रमाण:** [repeat.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.srp) तथा [repeat.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/repeat.stdout)।

## 2. `while`: शर्त सही रहने तक दोहराना

दूसरे उदाहरण को `loops.srp` में सेव करें:

~~~scarp
// Iteration with nearest-loop control and checked accumulator arithmetic.
var index = 0;
var total = 0;
while index < 10 {
    index += 1;
    if index == 3 { continue; }
    if index > 5 { break; }
    total += index;
}
print(total);
~~~

पहले `scarp check loops.srp` फिर `scarp run loops.srp` चलाएँ। अपेक्षित आउटपुट:

~~~text
12
~~~

यहाँ `index` आगे बढ़ता है। `continue;` के कारण 3 नहीं जुड़ता। `index > 5` होने पर `break;` लूप रोक देता है। इसीलिए `1 + 2 + 4 + 5 = 12` छपता है।

`while` की शर्त का प्रकार `boolean` होना चाहिए; integer को अपने-आप true/false नहीं माना जाता। `break;` निकटतम लूप से बाहर आता है, `continue;` अगले iteration पर जाता है। दोनों में `;` आवश्यक है।

**प्रमाण:** [loops.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.srp) और [loops.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/loops.stdout)।

## 3. काम की सीमा (work budget)

अगर आपने Scarp compiler repository को checkout किया है, तो दोनों प्रोग्राम `examples/` फ़ोल्डर में मिलेंगे:

~~~sh
scarp check --max-steps 2000000 examples/repeat.srp
scarp run --max-steps 2000000 examples/loops.srp
~~~

`check` चुने हुए code path को जाँचता है, लेकिन उसका आउटपुट नहीं छापता। work budget बहुत अधिक computation को सीमित करता है; यह **हर संभावित रास्ते के समाप्त होने का प्रमाण** या wall-clock timeout नहीं है। [रनटाइम बजट](/hi/reference/budgets), [त्रुटियाँ](/hi/reference/diagnostics) और [फ़ंक्शन ट्यूटोरियल](/hi/tutorials/verified-functions) देखें।

यहाँ लिखे पूरे सोर्स और अपेक्षित आउटपुट [स्थानीय conformance fixtures](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs) में मौजूद हैं। TypeScript checker हिन्दी और अंग्रेज़ी दोनों पृष्ठों में इनकी समानता की पुष्टि करता है।

::: warning प्रयोगात्मक संस्करण
ये नियम प्रकाशित v0.0.5-alpha.1 के लिए हैं। अन्य संस्करणों में व्यवहार बदल सकता है। [फ़ीचर स्थिति](/hi/reference/status) देखें।
:::
