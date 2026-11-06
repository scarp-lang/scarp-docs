# Scarp syntax tree की जाँच — प्रकाशित alpha.6

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-ast-inspection: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

प्रकाशित **[Scarp v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)** में `scarp inspect ast` उपलब्ध है। यह मार्गदर्शिका सही source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` और वास्तविक [AST CLI tests](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/tests/scarp_inspect_ast.rs) पर आधारित है। यह **प्रयोगात्मक developer inspection** है, stable AST API, formatter, type checker या native compiler नहीं।

## 1. वास्तविक source file को inspect करें

पहले [प्रकाशित alpha.6 executable](/hi/guide/installation-alpha6) इंस्टॉल करें। Extracted package या tagged compiler repository की उस root directory से, जहाँ `examples/` folder हो, ये commands चलाएँ:

~~~sh
scarp version
scarp guide inspect ast
scarp inspect ast examples/hello.srp
scarp inspect tokens examples/hello.srp
scarp verify examples/hello.srp
~~~

आधिकारिक example [`examples/hello.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/hello.srp) का वास्तविक source है:

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

`scarp inspect ast` parser का **पढ़ने योग्य Rust debug tree** stdout में दिखाता है, जिसमें `Program` node रहता है। इसका nested debug format **stable नहीं है**। इसे किसी स्थायी JSON schema या external integration के निश्चित output के रूप में इस्तेमाल न करें।

## 2. किस काम के लिए कौन सा command?

| CLI command | क्या जाँचता है? | सामान्य program statements चलाता है? |
| --- | --- | --- |
| `scarp inspect tokens FILE.srp` | Parsing के बिना tokens और UTF-8 source locations | नहीं |
| `scarp inspect ast FILE.srp` | **केवल एक entry source file** का syntax tree | नहीं |
| `scarp verify FILE.srp` | Imports, names, types और compile-time constants | सामान्य runtime execution नहीं |
| `scarp inspect modules --json FILE.srp` | Statically checked modules तथा versioned metadata | नहीं |
| `scarp inspect symbols --json FILE.srp` | Source graph में resolved definitions | नहीं |
| `scarp inspect references --json FILE.srp` | उन definitions के references | नहीं |
| `scarp exec FILE.srp` | Interpreter से program चलाना | **हाँ** |

ये commands [प्रकाशित compiler CLI](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/src/main.rs) में हैं। AST inspection **गायब module import** तथा **runtime division by zero** वाला source भी parse कर सकता है, क्योंकि वह न imports resolve करता है, न expressions या contracts execute। दूसरी ओर `verify` गलत imports अथवा types पर असफल हो सकता है। इसलिए सफल AST output से `verify` या `exec` की सफलता की गारंटी **नहीं** मिलती।

## 3. Diagnostics और गलत flags पहचानें

`broken.srp` नाम की अस्थायी file में यह **जानबूझकर गलत** parser input रखें:

~~~text
print(1 + );
~~~

फिर चलाएँ:

~~~sh
scarp inspect ast --diagnostic-format=json broken.srp
~~~

Lexer/parser error पर `--diagnostic-format=json` से **schema-version-1 diagnostic stderr** में आता है; stdout खाली रहता है। सामान्य error text भी stderr में जाता है। गलत source का exit code **1** होता है। Successful AST का output debug tree है, **JSON नहीं**; error diagnostics का JSON विकल्प सफल AST को JSON नहीं बनाता।

`scarp inspect ast --json FILE.srp`, `scarp ast FILE.srp` तथा runtime budget flag `--max-steps` **समर्थित नहीं** हैं। गलत command/flag पर exit code **2** आता है। `scarp inspect ast` को केवल **file path** दें, `Scarp.project` directory नहीं। Dash से शुरू होने वाले filename के लिए `--` separator दें, जैसे `scarp inspect ast -- -source.srp`। Spaces या Unicode वाले नाम भी मान्य हैं।

## 4. आगे कौन सी जाँच करें?

AST सफल होने पर भी import error मिले तो `scarp verify FILE.srp` चलाकर [module-loading नियम](/hi/reference/source-loading) पढ़ें। Cross-file definitions तथा references के लिए [alpha.6 symbol navigation](/hi/tooling/cli-alpha6) और [दो-file project tutorial](/hi/tutorials/project-symbol-navigation-alpha6) पढ़ें। वास्तविक error code का अर्थ जानने के लिए `scarp explain E####` इस्तेमाल करें।

**सीमाएँ:** AST debug output का स्थिर JSON schema, cross-file resolution, type information या edit operations उपलब्ध नहीं हैं। यह LSP नहीं है और native executable नहीं बनाता। [प्रकाशित release](/hi/releases/v0.0.6-alpha.1), [troubleshooting](/hi/tooling/troubleshooting) तथा [tagged compiler tests](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/tests/scarp_inspect_ast.rs) देखें।
