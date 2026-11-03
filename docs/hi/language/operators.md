# ऑपरेटर और एक्सप्रेशन

**नया alpha.2 संस्करण:** [bitwise integers और typed declarations](/hi/releases/v0.0.5-alpha.2) में binary/hex literals, bitwise operators और नए compound assignments प्रकाशित हुए हैं। अब [अलग alpha.2 bitwise operators guide](/hi/language/bitwise-operators-alpha2) में पूरे tagged source/stdout, signed और unsigned shifts तथा वास्तविक E0046/E0006 diagnostics शामिल हैं। पुराने release guide में भी मूल उदाहरण उपलब्ध है। नीचे की सूची पुराने **alpha.1** operators के लिए ही है।

Scarp v0.0.5-alpha.1 में इनका समर्थन है:

| श्रेणी | ऑपरेटर | अर्थ |
| --- | --- | --- |
| गणित | `+`, `-`, `*`, `/` | समान प्रकार के संख्यात्मक operands |
| तुलना | `==`, `!=`, `<`, `<=`, `>`, `>=` | boolean परिणाम; क्रम तुलना संख्याओं की |
| तार्किक | `not`, `and`, `or` | केवल boolean, `and`/`or` short-circuit |
| असाइनमेंट | `=`, `+=`, `-=`, `*=`, `/=` | केवल पहले घोषित mutable `var` पर |
| वेक्टर | `values[index]` | शून्य-आधारित, bounds-checked element |

गुणा और भाग, जोड़ और घटाव से पहले होते हैं। कोष्ठक प्राथमिकता बदलते हैं। समान प्राथमिकता के binary गणितीय ऑपरेटर बाएँ से दाएँ जुड़ते हैं। मिश्रित int/float गणित या chained comparison वैध नहीं हैं।

## Assignment एक statement है

`count += 1;` मान बदलने का statement है, expression नहीं। इसलिए किसी दूसरे expression के भीतर assignment नहीं लिख सकते। `bind` पर assignment E0013 और type mismatch E0015 है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
print(1 + 2 * 3);       // 7
print((1 + 2) * 3);     // 9
print(-7 / 2);          // -3
print(true or false);   // true
~~~

~~~scarp
var x = 2;
x += x + 1;
print(x); // 5
~~~
