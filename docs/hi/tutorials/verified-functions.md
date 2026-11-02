# ट्यूटोरियल: आउटपुट, फ़ंक्शन कॉल और फ़ंक्शन बनाना

यह ट्यूटोरियल Scarp **v0.0.5-alpha.1** के आधिकारिक compiler examples पर आधारित है। नीचे दिए गए पूरे सोर्स कोड और अपेक्षित आउटपुट की तुलना स्वचालित परीक्षणों में प्रकाशित compiler fixtures से होती है। Scarp अभी एक **प्रयोगात्मक इंटरप्रेटर** है, स्थिर native-code compiler नहीं।

शुरू करने से पहले [Scarp इंस्टॉल करें](/hi/guide/installation) और `scarp --version` से संस्करण `0.0.5-alpha.1` देखें। यदि आप Rust सोर्स से चला रहे हैं, तो `scarp` की जगह `cargo run --` लिखें।

## 1. पहला आउटपुट दिखाएँ

UTF-8 फ़ाइल `hello.srp` बनाकर यह **पूरा** प्रोग्राम लिखें:

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

पहले `scarp check hello.srp`, फिर `scarp run hello.srp` चलाएँ। परिणाम:

~~~text
Hello from Scarp!
~~~

**क्या हुआ?** `print` टेक्स्ट के बाद newline भी लिखता है। `check` चुने हुए execution path को जाँचता है लेकिन सफल होने पर प्रोग्राम का आउटपुट नहीं छापता। [आउटपुट streams](/hi/language/output) के बारे में पढ़ें।

**प्रमाण:** प्रकाशित [hello.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/hello.srp) और [stdout fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/hello.stdout)।

## 2. टाइप वाले फ़ंक्शन सीखें

`functions.srp` बनाएँ। नीचे आधिकारिक compiler का **पूरा**, अपरिवर्तित उदाहरण है। `funcra` फ़ंक्शन घोषित करता है, उसके arguments के प्रकार लिखे जाते हैं और `->` के बाद return type होता है। पहले फ़ंक्शन कॉल और फिर definition भी इस संस्करण में समर्थित है।

~~~scarp
// Typed calls, forward declarations, all primitive parameter types, and unit.
print(add(10, square(5)));

funcra add(a: integer, b: integer) -> integer {
    return a + b;
}

funcra square(value: integer) -> integer {
    return value * value;
}

funcra identity(text: string) -> string {
    return text;
}

funcra greet(name: string) -> unit {
    print("Hello", name);
    return;
}

pure funcra choose(value: integer, enabled: boolean) -> integer {
    if enabled { return value * 2; }
    return value;
}

greet(identity("Scarp"));
print(choose(3, true));
~~~

अब `scarp check functions.srp` और `scarp run functions.srp` चलाएँ। अपेक्षित परिणाम:

~~~text
35
Hello Scarp
6
~~~

### परिणाम को समझें

1. `square(5)` से `25` और `add(10, 25)` से `35` आता है।
2. `identity("Scarp")` एक string लौटाता है। `greet` `Hello Scarp` छापकर `unit` लौटाता है, जिसका कोई उपयोगी परिणाम-मान नहीं होता।
3. `choose(3, true)` से `6` मिलता है। `pure` keyword फ़ंक्शन के effects को सीमित करता है।

**प्रमाण:** [functions.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.srp) और [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.stdout)।

## 3. अपना परिवर्तन जाँचें

अब `add` या `square` में इस्तेमाल की गई संख्याएँ बदलें। फिर `scarp check functions.srp` और `scarp run functions.srp` चलाएँ। ऊपर दिखाया उदाहरण मूल **अपरिवर्तित संदर्भ** है, इसलिए आपका बदला आउटपुट अलग होगा। किसी फ़ंक्शन को गलत type वाला argument देकर diagnostic भी देखें। अधिक जानकारी [फ़ंक्शन](/hi/language/functions) और [त्रुटि कोड](/hi/reference/diagnostics) में है।

## इन उदाहरणों की विश्वसनीयता

डॉक्यूमेंटेशन repository में [ये स्रोत और अपेक्षित आउटपुट](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs) प्रकाशित रिलीज़ से कॉपी किए गए हैं। TypeScript validator यह जाँचता है कि यह पेज और इसका [English संस्करण](/tutorials/verified-functions) सोर्स और आउटपुट को क्रम में बिना बदलाव दिखाएँ। अलग GitHub Actions job इन्हीं फ़ाइलों को वास्तविक interpreter से चलाकर परिणाम byte-for-byte परखती है।

इसका अर्थ यह नहीं है कि आपका हर बदला हुआ प्रोग्राम सही चलेगा या भविष्य की रिलीज़ यही syntax रखेगी। [फ़ीचर स्थिति](/hi/reference/status) और [सत्यापन प्रमाण](/hi/reference/evidence) पढ़ें।

आगे [लूप](/hi/tutorials/repeat-and-loops), [मॉड्यूल](/hi/tutorials/modules-walkthrough) या [शब्दावली](/hi/guide/glossary) पढ़ें।
