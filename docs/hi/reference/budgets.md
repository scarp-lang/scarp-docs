# Runtime बजट और संसाधन सीमाएँ

Scarp interpreter तर्कगत काम और आउटपुट की अलग सीमाएँ लागू करता है। ये सीमाएँ **कुल RAM या सुरक्षा sandbox** नहीं हैं।

| CLI विकल्प | डिफ़ॉल्ट | किसकी सीमा है? |
| --- | ---: | --- |
| `--max-steps` | 1,000,000 | चुने हुए operations/expression steps |
| `--max-prints` | 100,000 | चुने गए output statements |
| `--max-call-depth` | 256 | सक्रिय user-function frames |
| `--max-calls` | 100,000 | कुल user-function calls |
| `--max-live-slots` | 1,000,000 | live frames के storage slots |
| `--max-capture-bytes` | 16,777,216 | logical output snapshot storage |
| `--max-vector-bytes` | 8,388,608 | नए vector/tile तत्व payload का कुल quota |

## बजट कैसे दें?

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/repeat.srp
scarp check --max-vector-bytes 8388608 examples/vectors.srp
~~~

विकल्प फ़ाइल नाम से पहले आता है। एक option दो बार देना, negative/अवैध संख्या देना या फ़ाइल के बाद option देना usage error (`2`) है। `tokens` में ये विकल्प मान्य नहीं।

## Source modules की सीमाएँ

Import graph की अलग सीमाएँ हैं: अधिकतम 128 फ़ाइलें, 32 import depth, एक फ़ाइल 1 MiB, कुल source 8 MiB, 1024 imports और expansion text 8 MiB। Rust embedding host इन्हें अलग API से बदल सकता है।

## व्याख्या

Retirement होने पर cumulative `max-vector-bytes` budget वापस नहीं मिलता। `max-live-slots` bytes नहीं, slots गिनता है। `check` चुना runtime path evaluate करता है, इसलिए budget failure उस पर भी लागू है। अधिक जानकारी [memory](/hi/language/memory) में है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/repeat.srp
scarp check --max-calls 200000 --max-call-depth 512 examples/functions.srp
~~~
