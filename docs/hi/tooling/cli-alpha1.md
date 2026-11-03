# CLI का पुराना संदर्भ: Scarp v0.0.5-alpha.1

यह **केवल alpha.1 का ऐतिहासिक CLI संदर्भ** है, वर्तमान compiler की command सूची नहीं। नया प्रोग्राम बनाने के लिए [प्रकाशित alpha.3 CLI संदर्भ](/hi/tooling/cli) पढ़ें। नीचे कोई command अनुपलब्ध लिखी है तो वह दावा **केवल alpha.1** के लिए है।

यह reference प्रकाशित Scarp **v0.0.5-alpha.1** पर आधारित है। पुराने versions में commands और syntax में अंतर हो सकता है।

| कमांड | क्या करता है? |
| --- | --- |
| `scarp run file.srp` | फ़ाइल जाँचे और चुना गया execution चलाए |
| `scarp check file.srp` | बिना user output लिखे स्रोत, प्रकार तथा चयनित runtime सत्यापन |
| `scarp tokens file.srp` | केवल lexer tokens दिखाए; यह पूरा validation नहीं है |
| `scarp --help` या `-h` | सहायता |
| `scarp --version` या `-V` | वर्ज़न |

`scarp build`, `scarp compile`, `scarp exec`, `scarp inspect` या `scarp verify` अभी मान्य CLI commands नहीं हैं। Rust का `cargo build` interpreter को बनाता है, `.srp` को native binary नहीं।

## Source checkout से चलाएँ

~~~sh
cargo run -- run examples/hello.srp
cargo run -- check examples/scopes.srp
cargo run -- tokens examples/hello.srp
~~~

फ़ाइल नाम में खाली जगह हो तो quotes लगाएँ। `-` से शुरू होने वाले फ़ाइल नाम के पहले `--` separator रखें। फ़ाइल UTF-8 होनी चाहिए; `.srp` विस्तार प्रचलित है लेकिन CLI entry फ़ाइल में अनिवार्य नहीं।

## रनटाइम विकल्प

`run` और `check` में फ़ाइल के **पहले** `--max-steps`, `--max-prints`, `--max-call-depth`, `--max-calls`, `--max-live-slots`, `--max-capture-bytes` और `--max-vector-bytes` का उपयोग कर सकते हैं। `tokens` इन्हें स्वीकार नहीं करता। उदाहरण:

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/repeat.srp
~~~

## Exit codes

सफलता `0`, स्रोत/फ़ाइल/execution/output error `1`, तथा गलत CLI उपयोग `2` है। त्रुटियों का विवरण stderr पर और सामान्य आउटपुट stdout पर होता है। स्रोत त्रुटि में user program का partial output नहीं लिखा जाता। अधिक [बजट](/hi/reference/budgets) और [diagnostics](/hi/reference/diagnostics) पढ़ें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~sh
cargo run --locked -- run examples/hello.srp
cargo run --locked -- check examples/scopes.srp
cargo run --locked -- tokens examples/hello.srp
~~~

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/loops.srp
scarp check --max-vector-bytes 8388608 examples/vectors.srp
~~~

~~~sh
scarp run -- -example.srp
~~~
