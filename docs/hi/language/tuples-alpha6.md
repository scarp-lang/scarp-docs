# Immutable और heterogeneous tuples — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

Tuples पहली बार **प्रकाशित [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6)** में आए हैं। पुराने alpha.5 compiler में नहीं चलते। प्रमाण के लिए [compiler contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/tuples.md), [पूरा tagged source](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.srp), [module](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/modules/tuple_pairs.srp) और [सटीक stdout](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.stdout) उपलब्ध हैं।

## Tuple बनाएँ और member पढ़ें

Tuple तय आकार का, क्रम में रखा हुआ value है। हर member का type अलग हो सकता है। नीचे type annotation और **literal index** का छोटा उदाहरण देखें:

~~~scarp
bind pair: tuple<integer, string> = (7, "नमस्ते");
print(pair, pair[0], pair[1]);
print((42,), (42));
~~~

क्रम महत्वपूर्ण है: `tuple<integer, string>` और `tuple<string, integer>` अलग types हैं। `(42,)` एक singleton tuple है, लेकिन `(42)` केवल grouped integer। Nested `(1, ("x", true))` भी चलता है। `pair[0]` या `pair[1]` जैसे literal indices उपलब्ध हैं; `pair[index]` जैसा computed index tuple पर नहीं चलता। यह Python की सारी tuple सुविधाओं की नकल नहीं है।

## Immutability, तुलना और functions

- `bind` में immutable tuple होता है। `var` पूरी tuple को उसी **exact structural type** वाली नई value से बदल सकता है; कोई member अलग से mutate नहीं होता।
- Function parameters, return values, defaults, recursion, nesting और imported public functions में tuple जा सकता है।
- Equality उसी type के members को structurally compare करती है; tuple ordering या arithmetic नहीं है।
- Nested strings display में quotes और escapes के साथ दिखते हैं; सामान्य top-level string का पुराना format रहता है।

यह छोटा code fence **समझाने के लिए** है। Published compiler से सटीक example/output के लिए [`tuples.srp`](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.srp) और [`tuples.stdout`](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/tuples.stdout) का उपयोग करें।

## सीमाएँ और अभी क्या नहीं है?

Tuple में **1–32** elements, nesting depth **32** तक और structural type shape अधिकतम **4,096 nodes** है। Default कुल payload budget **8 MiB** है जिसे `--max-tuple-bytes` बदल सकता है। पुराने work/output/text quotas भी लागू हैं।

Empty `()`, destructuring, dynamic tuple index, element assignment, tuple iteration और module constants में tuple initializer **नहीं** हैं। सीमित native C11/ELF64 emitters tuple स्वीकार नहीं करते। Rust embedding में `SourceType`, `Value::Tuple`, `ExecutionOptions.max_tuple_bytes` और tuple-signature module inventory के schema 2 की जाँच करें; stable ABI नहीं है।

[Input](/hi/language/program-input-alpha6), [Text conversions](/hi/language/text-foundations-alpha6), [प्रकाशित combined example](/hi/releases/v0.0.6-alpha.6) और [English पाठ](/language/tuples-alpha6) पढ़ें।
