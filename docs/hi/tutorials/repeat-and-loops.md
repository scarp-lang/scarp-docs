# `repeat` और `while` लूप

लूप एक निर्देश को कई बार चलाते हैं। Scarp v0.0.5-alpha.1 में `repeat`, `while`, `break` और `continue` उपलब्ध हैं।

## गिने हुए लूप: `repeat`

~~~scarp
var total = 0;
repeat 5 as index {
    total += index;
}
print(total); // 10
~~~

`repeat` गिनती को **एक ही बार** आँकता है। इंडेक्स 0 से count-1 तक जाता है; नकारात्मक गिनती में E0019 त्रुटि आती है। `index` केवल लूप के भीतर रहता है और बदला नहीं जा सकता।

## शर्त आधारित लूप: `while`

~~~scarp
var n = 0;
while n < 5 {
    n += 1;
    if n == 2 { continue; }
    if n == 4 { break; }
    print(n);
}
~~~

`while` प्रत्येक iteration से पहले boolean शर्त फिर जाँचता है। `break;` निकटतम लूप समाप्त करता है; `continue;` अगले iteration की ओर जाता है।

## सीमाएँ और परीक्षण

अनंत लूप रोकने के लिए work budget है। `scarp check --max-steps 2000000 examples/repeat.srp` चयनित पथ चलाता है, लेकिन print नहीं करता। वास्तविक उदाहरणों के [स्रोत और अपेक्षित आउटपुट](/hi/examples/) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

```scarp
var total = 0;
repeat 5 as index {
    total += index;
}
print(total); // 10
```

```scarp
var count = 5;
var total = 0;
repeat count as index {
    count = 0;
    if index == 2 { continue; }
    total += index;
}
print(total);
print(count);
```

```text
8
0
```

```scarp
var index = 0;
var total = 0;
while index < 10 {
    index += 1;
    if index == 3 { continue; }
    if index > 5 { break; }
    total += index;
}
print(total); // 12
```

```sh
scarp check --max-steps 2000000 examples/repeat.srp
scarp run --max-steps 2000000 examples/loops.srp
```
