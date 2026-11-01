# Diagnostics और त्रुटि कोड

Scarp त्रुटि होने पर आमतौर पर `error[E000X]`, स्रोत फ़ाइल, लाइन/कॉलम, caret और सुधार का संकेत दिखाता है। स्रोत/गणना त्रुटि में प्रोग्राम का pending output नहीं लिखा जाता।

## कुछ महत्वपूर्ण त्रुटियाँ

| कोड | अर्थ | पहला सुधार |
| --- | --- | --- |
| `E0004` | अपूर्ण/गलत syntax | `;` और brackets देखें |
| `E0006` | integer literal सीमा से बाहर | `i64` सीमा में रखें |
| `E0007` | integer overflow | मध्यवर्ती परिणाम जाँचें |
| `E0008` | शून्य से भाग | भाजक nonzero रखें |
| `E0010` | अघोषित नाम | पहले घोषित करें |
| `E0011` | एक scope में duplicate नाम | अलग नाम या नया block |
| `E0013` | immutable binding को बदलना | `var` उपयोग करें |
| `E0015` | प्रकार असंगत | समान प्रकार के operands |
| `E0017` | logical work budget समाप्त | loop/budget जाँचें |
| `E0019` | repeat की नकारात्मक गिनती | शून्य या सकारात्मक संख्या |
| `E0026` | फ़ंक्शन contract विफल | `needs`/`ensures` देखें |
| `E0027` | फ़ंक्शन संसाधन सीमा | call depth/slots जाँचें |
| `E0030` | गलत/nonfinite float literal | finite दशमलव लिखें |
| `E0032` | vector length/shape mismatch | dimensions जाँचें |
| `E0033` | vector index सीमा से बाहर | मान्य index लें |
| `E0036` | numeric payload quota समाप्त | नए buffers कम बनाएँ |
| `E0037` | module declaration/API त्रुटि | सही file-level syntax |
| `E0038` | module read/UTF-8 त्रुटि | path और encoding देखें |
| `E0039` | import cycle | dependency graph बदलें |
| `E0041` | private imported symbol | ज़रूरी हो तो `pub` दें |
| `E0042` | गलत alias/member | spelling/type देखें |
| `E0043` | निषिद्ध module path | relative `.srp` path लें |

हर error में फ़ाइल की पहली detected समस्या आती है; बाद में अतिरिक्त समस्याएँ मिल सकती हैं। Syntax/name validation arithmetic evaluation से पहले होता है। [समस्या निवारण](/hi/tooling/troubleshooting) और [official diagnostic reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/diagnostics.md) विस्तृत सूची रखते हैं।
