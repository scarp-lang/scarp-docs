# `read_line()` से program input — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

यह सुविधा **प्रकाशित [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6)** में उपलब्ध है। [Compiler का मूल input contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/program-input.md) देखें। पुराने `v0.0.6-alpha.5` में `read_line()` नहीं चलता।

## एक line पढ़ें

`read_line() -> string` स्पष्ट UTF-8 input source से एक line पढ़ता है। LF या CRLF हटता है, लेकिन बाकी valid text और spaces नहीं बदलते। यह **अपने आप prompt नहीं दिखाता** और input को number में भी नहीं बदलता।

~~~scarp
bind name: string = read_line();
print("Hello", name);
~~~

इस source को `greeting.srp` में और `Ada` व newline को `greeting.txt` में लिखें। Unix-like shell में file redirect करके चलाएँ:

~~~sh
scarp exec greeting.srp < greeting.txt
~~~

अपेक्षित output `Hello Ada` के बाद newline है। यह छोटा उदाहरण [tag के मूल compiler contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/program-input.md) पर आधारित है। Modules, conversion और tuples वाली official fixture [रिलीज़ पेज](/hi/releases/v0.0.6-alpha.6) में पढ़ें।

## कौन सा execution mode input पढ़ता है?

| Mode | व्यवहार |
| --- | --- |
| `exec`, पुराना `run`, project `launch` | Redirected या piped stdin पढ़ते हैं |
| Static `verify` और inspection | Input execute नहीं करते |
| Evaluating `check` | चुने हुए `read_line()` पर E0054 |
| Terminal-connected stdin | E0054: interactive REPL नहीं |
| Rust embedding | Caller द्वारा दिया buffered reader; global stdin नहीं |

Default सीमाएँ **एक line में 65,536 raw bytes**, **कुल 1,048,576 bytes** और **4,096 reads** हैं। इन्हें `--max-input-line-bytes`, `--max-input-bytes`, `--max-input-reads` से source path **के पहले** नियंत्रित कर सकते हैं। Line से LF/CRLF हटने पर भी उनके bytes quota में गिने जाते हैं। अंतिम बिना newline वाली nonempty line स्वीकार की जाती है; अगली read पर EOF होगा।

| Error | अर्थ |
| --- | --- |
| `E0054` | Reader नहीं या इस mode में input प्रतिबंधित |
| `E0055` | नई line से पहले EOF |
| `E0056` | UTF-8 गलत |
| `E0057` | Reader error |
| `E0058` | Input limit या bounded allocation failure |

Input quota के अलावा पुराने work और text-memory limits भी लागू रहते हैं। Program output सफल evaluation के बाद ही बाहर जाता है; पढ़ा गया input वापस नहीं किया जा सकता। Pipe के producer को समय लगने पर read रुक सकती है; work quota, I/O timeout नहीं है।

## आगे सीखें

Line से integer बनाने के लिए `text_to_integer(text_trim(read_line()))` स्पष्ट रूप से लिखें; automatic conversion नहीं है। [Text conversion](/hi/language/text-foundations-alpha6), [Tuples](/hi/language/tuples-alpha6), [प्रकाशित example](/hi/releases/v0.0.6-alpha.6) और [English पाठ](/language/program-input-alpha6) देखें।
