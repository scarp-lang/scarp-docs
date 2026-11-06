# कमांड-लाइन इंटरफ़ेस — प्रकाशित Scarp v0.0.5-alpha.4
::: tip नवीनतम CLI
नवीनतम प्रकाशित compiler [v0.0.6-alpha.2](/hi/releases/v0.0.6-alpha.2) है। इसमें नया CLI command नहीं, केवल वैकल्पिक Rust cache APIs हैं। पुराने project-directory module inspection के लिए [alpha.5 CLI](/hi/tooling/cli-alpha5) पढ़ें। नीचे के commands alpha.4 पर आधारित हैं।
:::


<!-- scarp-cli-release: v0.0.5-alpha.4 -->
<!-- scarp-project-release: v0.0.5-alpha.4 -->
<!-- scarp-alpha4-cli-reference: 79141329176f5dce51457e90a6652902f6432135 -->
यह [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) का **alpha.4 का ऐतिहासिक CLI संदर्भ** है। यह 3 नवंबर 2026 को [source commit `79141329176f5dce51457e90a6652902f6432135`](https://github.com/scarp-lang/scarp/commit/79141329176f5dce51457e90a6652902f6432135) से जारी हुआ। ये commands **वास्तविक प्रकाशित interpreter** में उपलब्ध हैं, केवल प्रस्तावित सुविधाएँ नहीं। भाषा और project manifest अभी प्रयोगात्मक हैं। सही native package और SHA-256 जाँच के लिए [इंस्टॉलेशन](/hi/guide/installation) देखें।

यह alpha.4 का पृष्ठ है। [ऐतिहासिक alpha.3 file CLI](/hi/tooling/cli) और [alpha.1 CLI](/hi/tooling/cli-alpha1) को अलग रखा गया है, ताकि पुराने versions में मौजूद commands की जानकारी सही रहे।

## प्रकाशित commands की सूची

| CLI command | इनपुट | सामान्य program statements चलते हैं? |
| --- | --- | --- |
| `scarp version`, `scarp --version` | कुछ नहीं | नहीं |
| `scarp guide [command]` | वैकल्पिक help topic | नहीं |
| `scarp diagnose --json` | कुछ नहीं; offline capability report | नहीं |
| `scarp create DIRECTORY` | नया project folder | नहीं, मगर **दो नई files लिखता है** |
| `scarp verify DIRECTORY` | स्पष्ट `Scarp.project` root | **नहीं**, static validation |
| `scarp launch DIRECTORY` | स्पष्ट project root | **हाँ**, interpreter |
| `scarp verify FILE.srp` | पहले से मौजूद source file | **नहीं**, static validation |
| `scarp exec FILE.srp` | मौजूद source file | **हाँ**, interpreter |
| `scarp inspect tokens FILE.srp` | Source file | नहीं; केवल lexer |
| `scarp inspect ast FILE.srp` | Source file | नहीं; केवल parser |
| `scarp inspect modules --json FILE.srp` | **File**, directory नहीं | नहीं; module inventory |
| `scarp explain E0015` | उपलब्ध error code | नहीं |

**इस प्रकाशित tag में उपलब्ध नहीं:** `scarp inspect modules --json DIRECTORY` (केवल development source), `scarp build`, `scarp compile`, package manager, arbitrary program arguments, native `.srp` executables और project की स्वतः खोज। पुराने `run`, `check`, `tokens`, `modules` migration के लिए अभी मौजूद हैं, लेकिन **`check` runtime paths चला सकता है** और `verify` का विकल्प नहीं है।

## पहला project बनाएँ और चलाएँ

एक writable parent folder में चलाएँ जहाँ `hello-world` नाम का folder **पहले से न हो**। Extracted archive से चलाते समय Windows PowerShell में `.\scarp.exe` या Linux/macOS में `./scarp` इस्तेमाल करें, ताकि `PATH` के पुराने executable से भ्रम न हो।

~~~sh
scarp version
scarp guide
scarp diagnose --json
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
scarp verify hello-world/src/main.srp
scarp exec hello-world/src/main.srp
~~~

`create` से `hello-world/Scarp.project` और `hello-world/src/main.srp` बनते हैं। यह **किसी भी मौजूदा folder, खाली folder को भी**, overwrite नहीं करता। वास्तविक generated manifest:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

वास्तविक generated source:

~~~scarp
print("Hello from Scarp!");
~~~

`launch hello-world` और `exec hello-world/src/main.srp` दोनों का stdout:

~~~text
Hello from Scarp!
~~~

Source, manifest तथा output [प्रकाशित alpha.4 conformance suite](/hi/releases/v0.0.5-alpha.4) से सत्यापित हैं। [पहला project quickstart](/hi/guide/quickstart-alpha4) भी देखें।

## File और project commands में अंतर

`verify FILE.srp` सामान्य runtime statements चलाए बिना syntax, imports, नाम और types जाँचता है। `verify DIRECTORY` पहले उस directory की स्पष्ट `Scarp.project` file और entrypoint जाँचता है, फिर वही static checks करता है। सफल `verify` चुप रहता है और artifacts नहीं बनाता, पर इससे `launch` की runtime सफलता की **गारंटी नहीं मिलती**। `exec FILE.srp` अलग source file चलाता है; `launch DIRECTORY` manifest में लिखे entrypoint को उसी interpreter से चलाता है।

Manifest UTF-8 में होनी चाहिए और अधिकतम **4096 bytes** की हो सकती है। केवल तीन ordered v1 fields स्वीकार हैं: `scarp-project: 1`, `name:`, `entry:`। Entry project के भीतर relative `.srp` path हो। बाहर जाने वाले paths, unsafe symlinks, गलत या duplicate fields अस्वीकार होते हैं। CLI parent folders में project manifest नहीं खोजता। [source path safety](/hi/reference/source-loading) और [alpha.3→alpha.4 migration](/hi/guide/migrate-alpha3-to-alpha4) देखें।

## Runtime budgets, JSON और exit codes

`launch` और `exec` में path से **पहले** flags दिए जा सकते हैं: `--max-steps`, `--max-prints`, `--max-call-depth`, `--max-calls`, `--max-live-slots`, `--max-capture-bytes`, `--max-vector-bytes`, `--max-text-bytes`। Static `verify` ऐसे runtime flags को **exit status 2** के साथ अस्वीकार करता है। Spaces वाले path quotes में लिखें, dash से शुरू होने वाले path के पहले `--` लगाएँ।

~~~sh
scarp launch --max-steps 500000 hello-world
scarp verify --diagnostic-format=json hello-world
scarp launch --diagnostic-format=json hello-world
scarp inspect modules --json hello-world/src/main.srp
~~~

`diagnose --json` में `"project_workflow":true` और `"native_executable":false` मिलता है। सफल `inspect modules --json FILE` से **schema-v1 inventory** मिलता है। `verify` या `launch` के साथ `--diagnostic-format=json` केवल **stderr के errors** का format बदलता है। सफल `launch` सामान्य program output देता है, **successful JSON नहीं**।

| Status | अर्थ | Output |
| --- | --- | --- |
| `0` | सफलता | `verify` चुप; `launch` program stdout |
| `1` | File, manifest, source, type, runtime या budget error | stderr पर diagnostic |
| `2` | गलत command, flag या argument की कमी | stderr पर usage error |

`inspect tokens` type-check नहीं करता। `inspect ast` मानव-पठनीय, अस्थिर development tree देता है, successful JSON नहीं। [diagnostics](/hi/reference/diagnostics), [runtime budgets](/hi/reference/budgets) तथा [compatibility](/hi/reference/compatibility) देखें।

**स्रोत प्रमाण:** [प्रकाशित release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [tagged CLI](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/main.rs), [project parser](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/project.rs) और [project tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/tests/scarp_projects.rs)। TypeScript CI दोनों भाषाओं के commands और प्रकाशित version boundaries की जाँच करती है; tagged compiler conformance CI वास्तविक executable चलाती है।
