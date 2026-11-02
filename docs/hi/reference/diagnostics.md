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
| `E0034` | गलत numerical domain | nonempty input या सही सीमा दें |
| `E0035` | numerical buffer reservation असफल | allocation का आकार कम करें |
| `E0036` | numeric payload quota समाप्त | नए buffers कम बनाएँ |
| `E0037` | module declaration/API त्रुटि | सही file-level syntax |
| `E0038` | module read/UTF-8 त्रुटि | path और encoding देखें |
| `E0039` | import cycle | dependency graph बदलें |
| `E0041` | private imported symbol | ज़रूरी हो तो `pub` दें |
| `E0042` | गलत alias/member | spelling/type देखें |
| `E0043` | निषिद्ध module path | relative `.srp` path लें |

## Tile और matrix की त्रुटियाँ कैसे सुधारें?

सबसे पहले diagnostic code, सोर्स की line/column और संबंधित call trace पढ़ें। सफल `scarp check <path>` कोई आउटपुट नहीं दिखाता; असफल source/runtime validation exit code **1** और stderr पर त्रुटि देता है। ऐसी त्रुटियों के बाद pending program stdout नहीं लिखा जाता।

1. **आकार (E0032):** `tile(values, rows, columns)` में तत्वों की संख्या `rows * columns` होनी चाहिए। `matvec` में tile की चौड़ाई और vector की लंबाई बराबर हों। `matmul` में पहले tile की width और दूसरे की height मेल खाएँ।
2. **इंडेक्स (E0033):** `cell(tile, row, column)` का index शून्य से शुरू होता है। Row की सीमा `height(tile)` और column की सीमा `width(tile)` से कम होनी चाहिए। `lane` भी row जाँचता है।
3. **Domain (E0034):** कुछ गणनाओं के लिए खाली vector मान्य नहीं है; जैसे `mean([])`। आवश्यक input दें, बिना वजह शून्य न मानें।
4. **Budget (E0017/E0036):** work limit और cumulative numerical allocation limit अलग हैं। `--max-steps` बढ़ाने से `--max-vector-bytes` नहीं बढ़ता।
5. **पुराना syntax (E0005/E0004):** आधुनिक Scarp में `let` की जगह `bind` या `var`, और typed functions के लिए `funcra` होता है। [वर्ज़न तुलना](/hi/reference/compatibility) देखें।

पहले [सत्यापित टाइल ट्यूटोरियल](/hi/tutorials/verified-tiles) का पूरा प्रोग्राम चलाएँ। फिर अपनी कॉपी में एक-एक argument बदलकर `scarp check` से त्रुटि समझें। ट्यूटोरियल मूल प्रकाशित compiler source और stdout से जाँचा गया है।

**प्रकाशित प्रमाण:** [न्यूमेरिकल त्रुटियाँ](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/numerical-errors.md) और [टाइल का व्यवहार](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md)। वास्तविक error text और caret स्थान source तथा platform के अनुसार बदल सकते हैं।

हर error में फ़ाइल की पहली detected समस्या आती है; बाद में अतिरिक्त समस्याएँ मिल सकती हैं। Syntax/name validation arithmetic evaluation से पहले होता है। [समस्या निवारण](/hi/tooling/troubleshooting) और [official diagnostic reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/diagnostics.md) विस्तृत सूची रखते हैं।
