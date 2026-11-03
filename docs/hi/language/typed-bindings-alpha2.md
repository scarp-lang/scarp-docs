# Typed bindings और सुरक्षित numeric conversions (v0.0.5-alpha.2)

<!-- scarp-language-release: v0.0.5-alpha.2 -->

इस पाठ में 2 नवंबर 2026 को प्रकाशित **[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** की दो वास्तविक सुविधाएँ सीखेंगे: `bind` / `var` में स्पष्ट type annotation और जाँच के साथ numeric conversion। Source का सटीक compiler commit [`e4db8e191cd7ea623123cae7348450ca6c95b170`](https://github.com/scarp-lang/scarp/commit/e4db8e191cd7ea623123cae7348450ca6c95b170) है। यह **release-specific** पाठ है। पुराने [variables](/hi/language/variables) और [types](/hi/language/types) के सामान्य references अब भी अलग **alpha.1** प्रमाण पर आधारित हैं।

::: tip कौन-सा संस्करण?
नीचे की commands **alpha.2 compiler** पर ही चलाएँ। सबसे नया प्रकाशित compiler [alpha.3](/hi/releases/v0.0.5-alpha.3) है, जिसमें नए CLI commands भी हैं। Alpha.1 executable इन annotations और conversion functions को नहीं समझता। इस पाठ के पूरे programs वास्तविक **tagged alpha.2 compiler** पर जाँचे गए हैं; सभी versions के लिए compatibility की गारंटी नहीं दी गई है।
:::

## 1. Type annotation क्या होता है?

Binding किसी मान को नाम देता है। `bind` का मान दोबारा assign नहीं किया जा सकता, लेकिन `var` में **उसी type** का नया मान रख सकते हैं। सामान्यतः Scarp initializer देखकर type पहचानता है। प्रकाशित alpha.2 से आप `=` से पहले `name: type` भी लिख सकते हैं।

**Annotation conversion नहीं है।** यह जाँचता है कि initializer का type घोषित type से मेल खाता है। इससे value बदलता नहीं, `bind` mutable नहीं बनता और initializer लिखना अब भी आवश्यक है।

### प्रकाशित program: typed declarations

फ़ाइल का नाम **`typed_declarations.srp`** रखें। नीचे का source आधिकारिक [alpha.2 compiler example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/typed_declarations.srp) से बिल्कुल मेल खाता है:

~~~scarp
bind samples: vector = [1.0, 2.0, 3.0];
var total: float = sum(samples);
total += 0.5;
bind grid: tile = tile(samples, 1, 3);
bind ready: boolean = width(grid) == 3;
bind label: string = "typed";
print(label, ready, total);
~~~

**प्रकाशित expected stdout:**

~~~text
typed true 6.5
~~~

लाइन दर लाइन समझें:

- `samples: vector` में finite float values वाला immutable vector है।
- `total: float` बदल सकने वाला float है। `sum(samples)` से शुरुआत में इसका मान `6.0` है।
- `total += 0.5` इसे `6.5` बनाता है; `samples` का मान नहीं बदलता।
- `grid: tile` में numerical tile है। `ready: boolean` जाँचता है कि उसकी width तीन है।
- `label: string` में `"typed"` text है। `print` तीनों values एक लाइन में लिखता है।

इस उदाहरण में **integer, float, boolean, string, vector और tile** annotations की सुविधा दिखाई जाती है; इससे classes, custom structs या सामान्य generics उपलब्ध नहीं हो जाते।

## 2. Conversion स्पष्ट क्यों लिखते हैं?

`integer` और `float` दो अलग types हैं। Scarp गणित में या variable declaration के समय integer को अपने-आप float में **नहीं** बदलता। प्रकाशित alpha.2 में दो सुरक्षित built-ins उपलब्ध हैं:

| Built-in | Input और output | मुख्य नियम |
| --- | --- | --- |
| `to_float(value)` | `integer` → `float` | Integer का binary64 float में **बिना precision खोए** बदलना संभव होना चाहिए। |
| `to_integer(value)` | `float` → `integer` | Float पूरा integer हो तथा signed 64-bit integer की सीमा के भीतर हो। |

यदि float का fractional हिस्सा है तो `to_integer` उसे round या truncate **नहीं** करता, बल्कि error देता है। `to_float` भी precision खोने की स्थिति में error देता है। इस प्रकार की conversion त्रुटियों का compiler diagnostic **`E0044`** है।

### प्रकाशित program: scalar conversions

फ़ाइल का नाम **`scalar_conversions.srp`** रखें। नीचे आधिकारिक [tagged compiler example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/scalar_conversions.srp) है:

~~~scarp
bind count: integer = 42;
bind scaled: float = to_float(count) / 4.0;
bind exact: integer = to_integer(12.0);
print(scaled, exact, to_integer(-0.0));
~~~

**Expected stdout:**

~~~text
10.5 12 0
~~~

समझें: `to_float(count)` में integer `42` को float `42.0` बनाया गया। `4.0` से भाग देने पर `10.5` मिलता है। `to_integer(12.0)` से integer `12` और negative floating zero `-0.0` से integer `0` मिलता है। Type annotations हमें उद्देश्य भी स्पष्ट दिखाते हैं।

## 3. दोनों programs कैसे चलाएँ?

दोनों `.srp` files को एक ही folder में रखें और **alpha.2** executable को `PATH` में उपलब्ध कराएँ। फिर चलाएँ:

~~~sh
scarp --version
scarp check typed_declarations.srp
scarp run typed_declarations.srp
scarp check scalar_conversions.srp
scarp run scalar_conversions.srp
~~~

पहले `scarp --version` से **0.0.5-alpha.2** जाँचें। पुराना `check` user output नहीं दिखाता, पर **चुने हुए runtime paths चला सकता है**; यह alpha.3 के static-only `verify` जैसा नहीं है। `run` से प्रोग्राम चलेगा और ऊपर बताया stdout मिलेगा।

यदि `PATH` में Scarp नहीं है तो Linux/macOS पर `./scarp` या Windows PowerShell पर `.\scarp.exe` इस्तेमाल करें। फ़ाइल का relative path terminal की current directory से तय होता है।

## 4. सामान्य गलतियाँ

| गलती | सही समझ |
| --- | --- |
| `bind number: float = 42;` से automatic conversion की उम्मीद | Annotation type जाँचता है, integer को float में नहीं बदलता। |
| `to_integer` से fractional value truncate होने की उम्मीद | Fractional value error देती है, truncate नहीं होती। |
| `var` में हर assignment पर type बदलने की उम्मीद | नया मान उसी घोषित type का होना चाहिए। |
| Alpha.2 binary पर `scarp verify` चलाना | यह command प्रकाशित alpha.3 CLI में आती है। |
| `vector` में integer collection रखने की उम्मीद | `vector` finite float values के लिए है; alpha.2 का अलग `integers` type [collections](/hi/tutorials/alpha2-collections-and-learning) में समझाया गया है। |

**अभ्यास:** Program चलाने से पहले output अनुमान लगाएँ। फिर अपनी कॉपी में `total += 0.5` को किसी दूसरी **float** वृद्धि से बदलकर नया output सोचें। `scarp check` के diagnostic देखें। Published fixtures से मिलान के समय मूल source न बदलें।

## आगे क्या पढ़ें?

[Variable scope](/hi/language/variables), [data types](/hi/language/types), [alpha.2 के 12 verified examples](/hi/reference/status) और नए compiler के लिए [alpha.3 quickstart](/hi/guide/quickstart-alpha3) पढ़ें।

**प्रमाण:** यहाँ दोनों पूर्ण source और stdout प्रकाशित [alpha.2 compiler fixtures](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/examples) से मेल खाते हैं। ये files [`conformance/alpha2/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha2) में भी हैं, जहाँ वास्तविक tagged compiler से CI इन्हें चलाती है। नया TypeScript checker English/Hindi दोनों पाठों का exact source और stdout मिलाता है।
