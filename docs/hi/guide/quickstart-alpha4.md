# Scarp में पहला project बनाएँ (v0.0.5-alpha.4)
::: tip नवीनतम प्रकाशित compiler
नए उपयोगकर्ताओं के लिए [प्रकाशित v0.0.6-alpha.9 release और checksum](/hi/releases/v0.0.6-alpha.9) तथा [सही version वाला learning path](/hi/guide/learning-path) हैं। इस पुराने alpha.4 guide का source, binary और stdout जानबूझकर बदला नहीं गया है।
:::


<!-- scarp-project-release: v0.0.5-alpha.4 -->
<!-- scarp-cli-release: v0.0.5-alpha.4 -->

यह पुराने प्रकाशित [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) (3 नवंबर 2026) के लिए **नए project की शुरुआती guide** है। आधिकारिक compiler source commit `79141329176f5dce51457e90a6652902f6432135` है। Scarp अभी प्रयोगात्मक है और **interpreter** से program चलाता है।

## 1. आधिकारिक compiler डाउनलोड और verify करें

[GitHub के published release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) से अपने OS का archive और उसी release की `.sha256` अथवा `SHA256SUMS` file लें।

| OS | आधिकारिक archive |
| --- | --- |
| Windows x64 | `scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip` |
| Linux x64 | `scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz` |
| macOS Apple Silicon | `scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz` |

Archive extract या execute करने से **पहले** SHA-256 hash को official checksum से मिलाएँ। Terminal से `scarp` चलने की व्यवस्था करें। यदि `PATH` में नहीं है तो Windows PowerShell में `.\scarp.exe` और Linux/macOS में `./scarp` का उपयोग करें।

## 2. Project बनाएँ, verify करें और चलाएँ

Terminal को ऐसे parent folder में खोलें जहाँ **`hello-world` नाम का folder पहले से न हो**। ये चार commands क्रम से चलाएँ:

~~~sh
scarp version
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
~~~

`scarp version` का परिणाम `0.0.5-alpha.4` दिखाना चाहिए। `create` किसी पहले से मौजूद **खाली folder** को भी overwrite नहीं करता। `verify` source/type जाँच करता है, सामान्य statements execute नहीं करता। `launch` starter program को वास्तव में चलाता है।

## 3. बनी हुई files देखें

Project की structure:

~~~text
hello-world/
  Scarp.project
  src/
    main.srp
~~~

बनी हुई `hello-world/Scarp.project` file का exact content:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

Compiler द्वारा बनी `hello-world/src/main.srp` file:

~~~scarp
print("Hello from Scarp!");
~~~

Project को **launch** करने पर प्रकाशित compiler का output:

~~~text
Hello from Scarp!
~~~

यह output simulate नहीं किया गया है। Source, manifest और stdout को compiler के वास्तविक [tagged project generator](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/project.rs) से मिलाया जाता है। GitHub CI भी उसी tagged compiler को build करके project create, verify और launch करती है।

## 4. Entry file बदलें

`hello-world/src/main.srp` को UTF-8 text के रूप में edit करें। Manifest का `entry: src/main.srp` project के भीतर इस file को चुनता है। बदलाव के बाद पहले static `verify` और फिर execution `launch` चलाएँ:

~~~sh
scarp verify hello-world
scarp launch hello-world
~~~

`verify` सामान्य program statements, runtime arithmetic या function contracts execute नहीं करता। इसलिए static verification सफल रहने के बाद भी `launch` पर runtime error आ सकती है।

## 5. आम समस्याओं का समाधान

| समस्या | समाधान |
| --- | --- |
| Project folder पहले से है | **नया** नाम चुनें; `create` पहले से मौजूद folder overwrite नहीं करता |
| Manifest नहीं मिली | `Scarp.project` वाली project root स्पष्ट बताएँ; parent folders में अपने-आप खोज नहीं होती |
| Manifest में गलत या अतिरिक्त field | अनुभाग 3 की **तीन ordered version-1 fields** रखें |
| Entry path project से बाहर जाता है | Project के भीतर forward-slash वाला relative `.srp` path रखें |
| `verify` सफल, लेकिन `launch` विफल | Static validation runtime success का वादा नहीं करती; runtime diagnostic पढ़ें |
| `scarp build`/`compile` नहीं मिलता | `.srp` से native executable generation अभी उपलब्ध नहीं है |
| `create` या `launch` पहचानी नहीं गई | **v0.0.5-alpha.4** compiler version जाँचें, alpha.3 या पुराने नहीं |

Flags, manifest limits और error formats के लिए [पूरा alpha.4 release guide](/hi/releases/v0.0.5-alpha.4), [feature status](/hi/reference/status) और पुराना [alpha.3 CLI reference](/hi/tooling/cli) पढ़ें।

**Alpha.3 से आ रहे हैं?** मौजूदा files को बदलने से पहले [migration checklist](/hi/guide/migrate-alpha3-to-alpha4) देखें। Standalone `exec` और `verify FILE.srp` commands अब भी समर्थित हैं।
