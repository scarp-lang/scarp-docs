# Scarp alpha.2: सत्यापित त्रुटियाँ और सुधार

**संस्करण: प्रकाशित v0.0.5-alpha.2 (2 नवंबर 2026)।** इस गाइड में compiler के **छह वास्तविक असफल test fixtures** से debugging सिखाई जाती है। हर source और stderr प्रकाशित tag से लिया गया है। TypeScript जाँच Git blob hashes और दोनों भाषाओं में code/output की समानता देखती है; CI वास्तविक interpreter से failures परखती है।

नीचे के उदाहरण काल्पनिक नहीं हैं। stderr snapshots [प्रकाशित compiler tests](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/tests/fixtures) से आए हैं। पुराना [alpha.1 diagnostic संदर्भ](/hi/reference/diagnostics) अलग है। असफल `check` या `run` की status **1**, stdout खाली और stderr पर error होना चाहिए। अन्य OS पर file paths और formatting अलग हो सकते हैं।

## 1. Integer से float में गलत conversion — E0044

त्रुटि वाला source `scalar_text/conversion.srp`:

~~~scarp
print("hidden");
print(to_float(9223372036854775807));
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0044]: integer cannot be represented exactly as a float
 --> conversion.srp:2:16
  |
2 | print(to_float(9223372036854775807));
  |                ^^^^^^^^^^^^^^^^^^^
 = help: conversions must be exact: use an integral in-range float or an exactly representable integer
~~~

**सुधार**: Signed 64-bit का सबसे बड़ा integer binary64 float में ठीक-ठीक represent नहीं होता। सही represent होने वाला integer लें या मान integer ही रखें। to_float कोई rounding cast नहीं है।

## 2. Fractional float से integer में बदलने पर त्रुटि — E0044

त्रुटि वाला source `scalar_text/fraction.srp`:

~~~scarp
eprint("hidden");
print(to_integer(1.5));
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0044]: float must be integral and within the signed 64-bit integer range
 --> fraction.srp:2:18
  |
2 | print(to_integer(1.5));
  |                  ^^^
 = help: conversions must be exact: use an integral in-range float or an exactly representable integer
~~~

**सुधार**: to_integer(1.5) दशमलव को काटकर integer नहीं बनाता, बल्कि त्रुटि देता है। Integral float दें या supported integer arithmetic का उपयोग करें।

## 3. Unicode scalar index सीमा से बाहर — E0045

त्रुटि वाला source `scalar_text/index.srp`:

~~~scarp
// café 🌍
print(text_codepoint("aé🌍", 3));
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0045]: text scalar index 3 is outside the string
 --> index.srp:2:29
  |
2 | print(text_codepoint("aé🌍", 3));
  |                             ^
 = help: use a nonnegative index below text_len(text); indices count Unicode scalar values, not UTF-8 bytes
~~~

**सुधार**: String में तीन Unicode scalar values हैं। Index शून्य से शुरू होता है, इसलिए 3 अमान्य है। text_len(text) से छोटा index लें; UTF-8 bytes की गिनती अलग है।

## 4. Module constant में function call निषिद्ध — E0037

त्रुटि वाला source `constants/call.srp`:

~~~scarp
pure funcra compute() -> integer { return 42; }
pub bind invalid = compute();
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0037]: calls are not allowed in module constant expressions
 --> call.srp:2:20
  |
2 | pub bind invalid = compute();
  |                    ^^^^^^^
 = note: constant initialized here
 --> call.srp:2:10
  |
2 | pub bind invalid = compute();
  |          ^^^^^^^
 = help: use scalar operators and earlier constants; call functions at runtime
~~~

**सुधार**: Module constant initializer में सीमित scalar expressions मान्य हैं, pure function calls भी नहीं। Function को सामान्य runtime code में चलाएँ।

## 5. Import किया private symbol — E0041

सहायक फ़ाइल `modules/library.srp`:

~~~scarp
// café 🌍
bind secret = 3;
pub bind value = 4;
pub pure funcra take(x: integer) -> integer { return x; }
~~~

त्रुटि वाला source `modules/private.srp`:

~~~scarp
import "library.srp" as library;
print(library.secret);
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0041]: library.secret is private
 --> private.srp:2:7
  |
2 | print(library.secret);
  |       ^^^^^^^^^^^^^^
 = note: the private declaration is here
 --> library.srp:2:6
  |
2 | bind secret = 3;
  |      ^^^^^^
 = help: mark the declaration pub in its defining module
~~~

**सुधार**: Static inventory में private declaration दिख सकती है, लेकिन दूसरे modules उसका उपयोग नहीं कर सकते। आवश्यक declaration पर pub लगाएँ या public function इस्तेमाल करें।

## 6. एक-दूसरे को import करते modules — E0039

सहायक फ़ाइल `modules/loop.srp`:

~~~scarp
import "cycle.srp" as cycle;
~~~

त्रुटि वाला source `modules/cycle.srp`:

~~~scarp
import "loop.srp" as loop;
~~~

प्रकाशित अपेक्षित stderr:

~~~text
error[E0039]: circular import reaches "cycle.srp"
 --> loop.srp:1:8
  |
1 | import "cycle.srp" as cycle;
  |        ^^^^^^^^^^^
 = note: this import continues the cycle
 --> cycle.srp:1:8
  |
1 | import "loop.srp" as loop;
  |        ^^^^^^^^^^
 = help: remove an import edge; mutually recursive functions belong in one module
~~~

**सुधार**: ये दो फ़ाइलें एक-दूसरे को import करती हैं। Shared code को तीसरे acyclic module में रखें या उपयुक्त होने पर mutually recursive functions एक module में रखें।



## त्रुटि को खुद चलाकर देखें

**Alpha.2** executable उपयोग करें। फ़ाइलें बताए गए folders में रखें और उस folder से commands चलाएँ:

~~~sh
scarp check conversion.srp
scarp run conversion.srp
scarp explain E0044
~~~


पहले दो commands **जानबूझकर असफल** होते हैं। `explain` बिना source खोले सामान्य सुधार-सुझाव देता है। E0044 checked numeric conversion और E0045 Unicode scalar index सीमा से संबंधित है। Module उदाहरणों में supporting files साथ रखें।

## ये जाँचें क्या सिद्ध करती हैं?

Documentation validator दोनों भाषाओं में पूरे source/stderr fences, tagged Git blob hashes और supporting files का क्रम जाँचता है। Compiler CI सभी छह negative programs के `run` और `check` पर status **1**, खाली stdout तथा अपेक्षित पूरे stderr की जाँच करती है। Native CLI में imported module के **absolute paths** आ सकते हैं, जबकि published test snapshots में छोटे filenames हैं; केवल इन विशेष path labels को समान करने के बाद बाकी stderr की exact तुलना होती है। ये [12 सफल alpha.2 programs](/hi/tutorials/alpha2-module-constants-and-inspection) से अलग हैं। भविष्य के releases में वही error wording रहने की गारंटी नहीं है।

आगे [alpha.2 diagnostic CLI](/hi/tooling/alpha2-inspection), [compatibility](/hi/reference/compatibility) और [verification policy](/hi/reference/evidence) पढ़ें।
