# Scarp alpha.8 calculator प्रोजेक्ट: बनाएँ, चलाएँ, verify और test करें

<!-- scarp-current-release: v0.0.6-alpha.8 -->
<!-- scarp-cli-release: v0.0.6-alpha.8 -->
<!-- scarp-current-source: 37253e7805c0ca594560700dd1deb3928458e60d -->

यह **प्रकाशित Scarp v0.0.6-alpha.8** का पूरा, runnable उदाहरण है; कोई प्रस्तावित feature नहीं। नीचे के manifest, module, entrypoint, दो tests और UTF-8 input fixture आधिकारिक compiler के [calculator example](https://github.com/scarp-lang/scarp/tree/37253e7805c0ca594560700dd1deb3928458e60d/examples/projects/calculator) से **बिना code बदलाव के** लिए गए हैं। सही release source commit `37253e7805c0ca594560700dd1deb3928458e60d` है।

## 1. Project की directory structure

~~~text
calculator/
  scarp.project
  src/
    main.srp
    math.srp
  tests/
    addition.srp
    input.srp
    input.stdin
~~~

[प्रकाशित compiler tag](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.8) से पूरे project की files लें। नया खाली project शुरू करने के लिए केवल तब `scarp init calculator` चलाएँ जब यह directory **पहले से न बनी हो**। उसके बाद compiler के pinned calculator example की source files रखें।

## 2. प्रकाशित project की ठीक वही files

**`scarp.project`** Scarp का अपना declarative manifest format है; यह TOML, JSON या executable `.srp` source नहीं है। `dependencies {}` जानबूझकर खाली रहता है; alpha.8 में **package installer नहीं** है।

~~~text
project "calculator" {
    version: "0.1.0"
    entry: "src/main.srp"
    type: "application"
    dependencies {}
}
~~~

~~~scarp
pub pure funcra add(left: integer, right: integer) -> integer {
    return left + right;
}
~~~

~~~scarp
import "math.srp" as math;

print(math.add(2, 3));
~~~

~~~scarp
import "../src/math.srp" as math;

assert(math.add(2, 3) == 5);
assert(math.add(-3, 3) == 0, "opposites should cancel");
~~~

~~~scarp
import "../src/math.srp" as math;

bind left = text_to_integer(read_line());
bind right = text_to_integer(read_line());
assert(math.add(left, right) == 42, "the supplied inputs should sum to 42");
~~~

~~~text
17
25
~~~

~~~text
5
~~~

~~~sh
scarp verify examples/projects/calculator
scarp run examples/projects/calculator
scarp project info --json examples/projects/calculator
scarp test --list examples/projects/calculator
scarp test --require-tests examples/projects/calculator
scarp test --json --filter input examples/projects/calculator
~~~

ऊपर code fences में manifest, public `math.srp` function, `main.srp` entrypoint, `addition.srp` test, `input.srp` test, matching `input.stdin`, program output और shell commands इसी क्रम में हैं। Tests, source module को relative import से इस्तेमाल करते हैं।

## 3. Code चलाना और tests समझना

उपर्युक्त commands **tagged compiler checkout** के root से चलाएँ, जहाँ `examples/projects/calculator` folder हो। `scarp verify` runtime execute किए बिना static check करता है। `scarp run` प्रोग्राम चलाकर **5** print करता है। `scarp project info --json` source चलाए बिना validated project metadata लौटाता है। `scarp test --list` सिर्फ tests की सूची दिखाता है; सामान्य `scarp test` तथा `--require-tests` code execute करते हैं।

`addition.srp` में boolean assertion है। `input.srp` को matching `input.stdin` से दो input lines `17` और `25` मिलती हैं। `text_to_integer(read_line())` से इन्हें integer में बदलकर योग `42` सत्यापित होता है। हर test की input अलग रहती है और test report में application output नहीं मिलाया जाता।

`--filter input` सिर्फ filename में मौजूद **literal, case-sensitive** substring देखता है, regex नहीं। `--json` structured test report देता है। गलत `assert` पर **E0065** diagnostic मिलता है। CI में `--require-tests` इस्तेमाल करने पर खाली tests folder success नहीं मान लिया जाता।

## 4. सीमाएँ और compatibility

सिर्फ सीधे `tests/*.srp` files खोजे जाते हैं, अधिकतम **64**। खाली test suite सामान्यतः zero-test report देता है, पर `--require-tests` के साथ असफल होता है। Input fixture अलग-अलग test की होती है, आकार सीमित है और project root के अंदर ही रहनी चाहिए। Tests **वास्तव में code चलाते हैं**; केवल भरोसेमंद files चलाएँ। पुराने `Scarp.project`, `create`, `launch`, `exec` बने रहते हैं।

यह interpreter-आधारित project है, native `scarp compile` या dependency install नहीं। नया `assert` reserved word है; पुराने code में इस नाम के identifier को बदलना पड़ सकता है। [Alpha.8 release](/hi/releases/v0.0.6-alpha.8) · [Alpha.8 CLI commands](/hi/tooling/project-alpha8) · [Compatibility](/hi/reference/compatibility) · [English tutorial](/tutorials/calculator-alpha8)।
