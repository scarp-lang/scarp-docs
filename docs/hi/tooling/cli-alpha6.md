# Symbol navigation और CLI — v0.0.6-alpha.1

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-release: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

यह सुविधा [प्रकाशित v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) में source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` से आई है। [Alpha.5 CLI guide](/hi/tooling/cli-alpha5) पुराने project module inspection के लिए है; उसमें **नए symbols/references commands उपलब्ध नहीं** थे।

चल रहे executable का version, host architecture और सुविधाएँ जाँचने के लिए [compiler diagnose guide](/hi/tooling/diagnose-alpha6) पढ़ें। `scarp diagnose --json` **वर्तमान interpreter** बताता है, native compilation नहीं।

Parser की syntax tree देखनी हो तो [alpha.6 AST debugging मार्गदर्शिका](/hi/tooling/inspect-ast-alpha6) पढ़ें। इसका human-readable debug output symbols/references के versioned JSON से **अलग** है।

## Commands कैसे चलाएँ?

[टैग किए हुए compiler repository](https://github.com/scarp-lang/scarp/tree/v0.0.6-alpha.1) से alpha.6 executable चलाएँ। उदाहरण में `examples/modules/navigation_values.srp` import होता है।

~~~sh
scarp guide inspect symbols
scarp guide inspect references
scarp inspect symbols --json examples/symbol_navigation.srp
scarp inspect references --json examples/symbol_navigation.srp
scarp inspect references --json path/to/project
scarp verify examples/symbol_navigation.srp
scarp exec examples/symbol_navigation.srp
~~~

दोनों नए `inspect` commands **सामान्य program statements नहीं चलाते**। `scarp exec` सचमुच program चलाता है और यहाँ `30` दिखाता है। `guide` से संबंधित help मिलती है।

## JSON का अर्थ

प्रत्येक successful result एक UTF-8 JSON object है, जिसकी आख़िर में newline आती है। सामान्य fields:

~~~json
{
  "schema_version": 1,
  "kind": "scarp.references",
  "span_encoding": "utf-8-bytes",
  "column_encoding": "unicode-scalar",
  "position_base": 1
}
~~~

Symbols output में `kind: "scarp.symbols"`; references में `kind: "scarp.references"` आता है। दोनों में `files` और `symbols` arrays हैं; reference output में अलग `references` array है।

हर symbol में ID, नाम, प्रकार, owner, public/mutable स्थिति, optional module target और declaration location होती है। हर reference अपना target symbol ID, उपयोग का प्रकार और token location बताता है। Byte spans **UTF-8 में half-open offsets** हैं। Line और column **1 से शुरू होने वाली Unicode scalar positions** हैं। अलग कंप्यूटर पर absolute paths बदल सकते हैं।

एक नाम को अलग scope में दोबारा घोषित करने पर symbol IDs अलग होते हैं। Import path module तक और named argument label parameter तक पहुँचाता है। Builtin या implicit `result` का source location `null` हो सकता है; वहाँ नकली definition नहीं बनानी चाहिए। Source bodies या constants के actual values JSON में नहीं भेजे जाते।

## Project और errors

एक स्पष्ट valid `Scarp.project` directory का inspection हो सकता है। Parent folders में project अपने आप नहीं खोजा जाता। CLI usage error exit **2**, source/module/manifest error exit **1** देता है; असफल compilation पर partial index नहीं मिलता। Index quota पर `E0050` आता है, लेकिन वास्तविक compilation error पहले बताया जाता है। `--diagnostic-format=json` error stderr के लिए है; `--json` successful stdout inventory के लिए है।

हर index केवल **एक compilation snapshot** का है। Edit के बाद IDs बदल सकती हैं। Default सीमाएँ: 65,536 symbols, 1,048,576 references, names के 8 MiB UTF-8 bytes और 4,194,304 logical indexing work units। ये process RAM या interpreter steps की गिनती नहीं हैं।

## Rust API और वर्तमान सीमाएँ

Embedding hosts `modules::compile_indexed_file`, `compile_indexed_with_loader`, `resolve_indexed` तथा `goto_definition(source_id, byte_offset)`, `find_references(symbol_id)` का उपयोग कर सकते हैं। ये static immutable navigation जानकारी देते हैं। पूरी schema के लिए [tagged compiler documentation](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/docs/symbol-index.md) देखें।

इसमें LSP server, rename, incremental cache, अधूरे source से recovery या edits के बीच स्थिर IDs **नहीं** हैं। `scarp build` तथा `scarp compile` भी उपलब्ध नहीं। [RMS पाठ](/hi/language/rms-alpha6) और [release प्रमाण](/hi/releases/v0.0.6-alpha.1) पढ़ें।
