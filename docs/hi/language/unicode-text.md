# Unicode strings: text को जाँचना और बनाना

<!-- scarp-unicode-release: v0.0.5-alpha.2+v0.0.5-alpha.3 -->
<!-- scarp-cli-release: v0.0.5-alpha.3 -->

इस पाठ में Scarp की **प्रकाशित और सत्यापित** Unicode सुविधाएँ सीखेंगे। दोनों पूरे programs आधिकारिक compiler के tagged examples से लिए गए हैं। Unicode query functions **[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** में उपलब्ध हुए (source commit `e4db8e191cd7ea623123cae7348450ca6c95b170`)। Text जोड़ना, slice करना और repeat करना **[v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)** के प्रकाशित उदाहरण में दिखाया गया है (commit `7715c28df09c7703b39e14fddb963275b25df476`)।

::: warning Version को ध्यान से चुनें
**Alpha.3 नवीनतम प्रकाशित prerelease है; stable भाषा नहीं है।** नीचे दोनों programs का परीक्षण **अपने-अपने tagged compiler** पर हुआ है। [Types और values](/hi/language/types) का मूल संदर्भ अभी alpha.1 पर आधारित है। हर अनुभाग की command उसके बताए संस्करण के साथ चलाएँ। दोनों अलग tests सफल होने से यह सिद्ध नहीं होता कि alpha.2 का हर program alpha.3 पर बिना बदलाव चलेगा।
:::

## 1. Unicode scalar और UTF-8 byte में अंतर

Scarp का `string` UTF-8 text रखता है। **Unicode scalar value** और UTF-8 **byte** एक जैसी गिनती नहीं हैं:

- `café` में **चार scalar values** हैं। `é` UTF-8 में दो bytes लेता है।
- `🌍` एक scalar है, पर UTF-8 में **चार bytes** लेता है।
- स्क्रीन पर दिखने वाला एक अक्षर या emoji कभी-कभी कई scalars से बनता है। इसे *grapheme cluster* कहते हैं। नीचे Scarp के text indices **Unicode scalars** गिनते हैं, स्क्रीन पर दिखने वाले अक्षर या bytes नहीं।

इन functions की text खोज exact है; automatic Unicode normalization या language-specific case folding का वादा नहीं है।

## 2. प्रकाशित alpha.2: Unicode text की जानकारी निकालें

UTF-8 फ़ाइल **`unicode_text.srp`** बनाएँ। नीचे आधिकारिक प्रकाशित [source example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/unicode_text.srp) बिल्कुल उसी रूप में है:

~~~scarp
bind text: string = "café 🌍";
print(text_len(text), text_bytes(text), text_codepoint(text, 5));
print(text_find(text, "🌍"), text_contains(text, "é"));
print(text_starts_with(text, "caf"), text_ends_with(text, "🌍"));
~~~

**प्रकाशित expected stdout:**

~~~text
6 10 127757
5 true
true true
~~~

पहली लाइन के अनुसार `café 🌍` में **6 scalars**, **10 UTF-8 bytes**, और globe का code point **127757** है। दूसरी लाइन में globe का स्थान **scalar index 5** है (गिनती शून्य से शुरू होती है)। तीसरी लाइन exact prefix/suffix match दिखाती है।

### Alpha.2 के query built-ins

| Function | क्या करता है? |
| --- | --- |
| `text_len(text)` | Unicode scalars की संख्या |
| `text_bytes(text)` | UTF-8 bytes की संख्या |
| `text_codepoint(text, index)` | शून्य से शुरू होने वाले scalar index पर code point |
| `text_find(text, needle)` | पहली exact match का scalar index; नहीं मिलने पर `-1` |
| `text_contains(text, needle)` | Exact substring मिलने पर boolean |
| `text_starts_with(text, prefix)` | Exact prefix जाँचना |
| `text_ends_with(text, suffix)` | Exact suffix जाँचना |

`text_codepoint` में negative या सीमा से बाहर scalar index error देता है (compiler diagnostic `E0045`)। खाली needle की खोज index zero से match होती है। ये functions मौजूदा string पढ़ते हैं, बदलते नहीं हैं।

### Alpha.2 CLI से चलाएँ

**v0.0.5-alpha.2** executable चुनें और `unicode_text.srp` वाले folder में ये commands चलाएँ:

~~~sh
scarp --version
scarp check unicode_text.srp
scarp run unicode_text.srp
~~~

पुराना `check` कुछ selected runtime paths चला सकता है, लेकिन user output नहीं दिखाता। यह केवल static verification नहीं है। `run` program का ऊपर दिया stdout दिखाता है। पहले compiler version ज़रूर जाँचें।

## 3. प्रकाशित alpha.3: text बनाएँ और repeat करें

Alpha.3 में string बनाने वाले functions उपलब्ध हैं। प्रकाशित [`text_construction.srp` example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp) की पूरी UTF-8 file:

~~~scarp
bind greeting: string = text_concat("Hello, ", "🌍");
bind planet = text_slice(greeting, 7, 1);
print(greeting);
print(text_repeat(planet, 3));
print(text_len(greeting), text_bytes(greeting));
~~~

**प्रकाशित expected stdout:**

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

इस source में तीन नए कार्य हैं:

- `text_concat("Hello, ", "🌍")` दो strings जोड़कर नई string बनाता है। इसका मतलब यह नहीं कि `+` operator से string जुड़ती है।
- `text_slice(greeting, 7, 1)` **scalar index 7** से **एक scalar** चुनता है। `Hello, 🌍` में वह globe है, भले वह चार UTF-8 bytes लेता हो।
- `text_repeat(planet, 3)` globe को तीन बार जोड़कर नई string बनाता है। अंतिम print के अनुसार greeting में **8 scalars** और **11 UTF-8 bytes** हैं।

Text construction पर allocation और execution work की सीमाएँ लागू हैं। इससे arbitrary string mutation, byte indexing, normalization, interpolation या सामान्य formatting API उपलब्ध नहीं हो जाती।

### Alpha.3 CLI पर verify और execute करें

**v0.0.5-alpha.3** executable चुनें और `text_construction.srp` वाले folder में चलाएँ:

~~~sh
scarp version
scarp verify text_construction.srp
scarp exec text_construction.srp
~~~

नया `verify` सामान्य runtime statements को चलाए बिना static source/type जाँच करता है। `exec` program चलाता है। ये नए Scarp-first commands **alpha.2 में उपलब्ध नहीं** हैं। पूरा विवरण [वर्तमान CLI reference](/hi/tooling/cli) में है।

Scarp को system `PATH` में नहीं जोड़ा है तो Windows PowerShell में `.\scarp.exe` और Linux/macOS में `./scarp` का उपयोग करें। Relative source path terminal की current directory से resolve होता है।

## 4. सामान्य गलतफहमियाँ

| गलत अनुमान | प्रकाशित compiler का सही व्यवहार |
| --- | --- |
| Scalar index और UTF-8 byte index एक ही हैं | `é` तथा `🌍` में ये अलग हैं। |
| हर scalar स्क्रीन पर अलग अक्षर है | Combining marks और emoji sequences कई scalars का एक grapheme बन सकते हैं। |
| Search अपने-आप case folding या normalization करती है | Query functions exact matching करती हैं। |
| `text_slice` तथा `text_repeat` शुरू से alpha.1 में थे | Construction का प्रकाशित प्रमाण **alpha.3** में है। |
| `scarp check` और `scarp verify` एक जैसी commands हैं | पुराना `check` runtime paths चला सकता है; alpha.3 का `verify` static-only है। |
| `+` से string जोड़ना समर्थित है | Alpha.3 में स्पष्ट `text_concat` function इस्तेमाल करें। |

## 5. आगे क्या पढ़ें?

[Types और values](/hi/language/types), [प्रकाशित feature matrix](/hi/reference/status), [alpha.2 रिलीज़ विवरण](/hi/releases/v0.0.5-alpha.2), और [alpha.3 quickstart](/hi/guide/quickstart-alpha3) देखें।

**सत्यापन का स्रोत:** पूरे source और stdout [`conformance/alpha2`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha2) तथा [`conformance/alpha3`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3) में pinned हैं। अलग GitHub CI jobs वास्तविक tagged compiler पर examples चलाती हैं। TypeScript validator जाँचता है कि English और Hindi दोनों पाठ उन published fixtures से बिल्कुल मेल खाते हैं।
