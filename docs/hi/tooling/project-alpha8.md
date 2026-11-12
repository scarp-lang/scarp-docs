# प्रकाशित Scarp alpha.8 project CLI और tests

<!-- scarp-current-release: v0.0.6-alpha.8 -->
<!-- scarp-cli-release: v0.0.6-alpha.8 -->
<!-- scarp-current-source: 37253e7805c0ca594560700dd1deb3928458e60d -->

यह **v0.0.6-alpha.8** का प्रकाशित command reference है। [ठीक compiler source 37253e7805c0ca594560700dd1deb3928458e60d](https://github.com/scarp-lang/scarp/tree/37253e7805c0ca594560700dd1deb3928458e60d) के अनुरूप लिखा गया है। पुरानी alpha.7 release में ये नए manifest, assert या project-test features **नहीं** थे। वास्तविक files के लिए [calculator tutorial](/hi/tutorials/calculator-alpha8) तथा download/checksum के लिए [प्रकाशित alpha.8](/hi/releases/v0.0.6-alpha.8) देखें।

## नया project बनाएँ, verify करें, चलाएँ और जानकारी देखें

~~~sh
scarp init my-calculator
scarp verify my-calculator
scarp run my-calculator
scarp project info --json my-calculator
~~~

~~~sh
scarp test --list examples/projects/calculator
scarp test --require-tests examples/projects/calculator
scarp test --json --filter input examples/projects/calculator
~~~

~~~scarp
assert(2 + 2 == 4);
assert(2 + 2 == 4, "math should be correct");
~~~

~~~text
project "calculator" {
    version: "0.1.0"
    entry: "src/main.srp"
    type: "application"
    dependencies {}
}
~~~

`scarp init DIRECTORY` एक नया `scarp.project` बनाता है; पहले से मौजूद (खाली भी) directory को overwrite नहीं करता। `scarp verify` सामान्य runtime statements चलाए बिना जाँचता है और `scarp run` configured entrypoint **चलाता है**। जब current working directory में valid project हो, तब बिना directory argument भी ये commands चल सकते हैं। पुराना `scarp exec FILE.srp` मौजूद है।

`scarp project info --json DIRECTORY` program execute किए बिना validated name, version, entrypoint और manifest format देता है। JSON schema version 1 में `schema_version`, `name`, `version`, `entry`, `type`, `manifest` और `format` हैं। गलत manifest पर सफल JSON record नहीं मिलता।

ऊपर दिखा manifest compiler के published calculator example का है। `dependencies {}` अभी सिर्फ reserved syntax है, **packages डाउनलोड नहीं करता**। Entry path project के अंदर relative होना चाहिए। पुराने `Scarp.project` वाले `create`/`launch` projects भी चलते हैं; एक project में दोनों formats न मिलाएँ।

## Test flags कैसे काम करते हैं?

| काम | प्रकाशित command | अर्थ |
| --- | --- | --- |
| Tests execute करें | `scarp test DIRECTORY` | सीधे `tests/*.srp` programs चलें |
| बिना execute के सूची | `scarp test --list DIRECTORY` | सिर्फ filenames दिखें |
| JSON report | `scarp test --json DIRECTORY` | Structured report, program stdout से अलग |
| Filename filter | `scarp test --filter input DIRECTORY` | Literal, case-sensitive substring; regex नहीं |
| खाली suite reject | `scarp test --require-tests DIRECTORY` | Tests नहीं हैं तो CI असफल |

Test discovery filename के अनुसार sorted और **nonrecursive** है, अधिकतम **64** immediate files। खाली `tests/` सामान्यतः zero tests बताकर सफल होता है, मगर CI में `--require-tests` उसे fail करेगा। हर `tests/name.srp` के साथ अपना `tests/name.stdin` optional UTF-8 fixture हो सकता है। यह test का input है, terminal से अपने-आप पढ़ा गया shell stdin नहीं। Resource limits और project-root containment अभी भी लागू हैं।

## Native boolean assertion

`assert(condition);` या `assert(condition, "message");` Scarp का **statement** है, function नहीं। Condition का type `boolean` होना चाहिए और optional message अधिकतम **256 UTF-8 bytes** का quoted string literal। True होने पर output नहीं; false पर source location के साथ **E0065** diagnostic। Static `scarp verify` predicate type जाँचता है, execute नहीं करता; `scarp test` और `run` में assertion चलता है। `assert` reserved word है; पुराने code में इस नाम वाला identifier बदलें। Experimental native backends में यह supported नहीं।

## क्या नहीं आया?

Project tests वास्तव में source execute करते हैं; केवल भरोसेमंद test files चलाएँ। `project info` और `test --list` application code execute नहीं करते। Package registry, automatic dependency installer, native `scarp compile`, हर पुराने version की code compatibility या parent directory से automatic project lookup उपलब्ध नहीं हैं। [Alpha.8 release](/hi/releases/v0.0.6-alpha.8) · [Alpha.4 historical guide](/hi/guide/quickstart-alpha4) · [Command finder](/hi/tooling/command-finder)।
