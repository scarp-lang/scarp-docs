# Scarp alpha.3 से alpha.4 में माइग्रेशन

<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->

यह मार्गदर्शिका प्रकाशित [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3) से [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) तक बदलाव बताती है। यह **stable release में अपग्रेड नहीं** है। दोनों प्रायोगिक interpreter prereleases हैं। आधिकारिक source commit `7715c28df09c7703b39e14fddb963275b25df476` (alpha.3) और `79141329176f5dce51457e90a6652902f6432135` (alpha.4) हैं। Directory commands की पुष्टि [alpha.4 के compiler tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/tests/scarp_projects.rs) से होती है।

## क्या नए project की आवश्यकता है?

| काम | v0.0.5-alpha.3 | v0.0.5-alpha.4 |
| --- | --- | --- |
| `scarp verify FILE.srp` | उपलब्ध: static जाँच | अब भी उपलब्ध |
| `scarp exec FILE.srp` | उपलब्ध: file चलाना | अब भी उपलब्ध |
| `scarp create DIRECTORY` | उपलब्ध नहीं | **नया** project folder बनाना |
| `scarp verify DIRECTORY` | उपलब्ध नहीं | project entry की static जाँच |
| `scarp launch DIRECTORY` | उपलब्ध नहीं | project entry को execute करना |

**मौजूदा single-file program को बदलना अनिवार्य नहीं है।** Alpha.4 में file workflow चलता है। अपने-आप project में बदलने या package management की सुविधा अभी नहीं है।

## 1. Version जाँचें और पुराना file workflow बनाए रखें

[आधिकारिक alpha.4 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) से compiler लें। Extract या run करने से **पहले** downloaded archive का SHA-256 official checksum से मिलाएँ। `scarp version` में `0.0.5-alpha.4` दिखना चाहिए। `app.srp` नाम की file के लिए ये commands अब भी सही हैं:

~~~sh
scarp version
scarp verify app.srp
scarp exec app.srp
~~~

यहाँ `verify` source की static जाँच करता है और `exec` program चलाता है। पुराना `check` static `verify` का समान विकल्प **नहीं** है: legacy `check` कुछ runtime paths evaluate कर सकता है। `run`, `check`, `tokens` और `modules` फिलहाल पुरानी scripts के लिए मौजूद हैं, लेकिन नए CLI के लिए सुझाए नहीं जाते।

## 2. जरूरत होने पर ही project folder बनाएँ

ऐसे parent folder में जाएँ जहाँ `hello-world` पहले से **मौजूद न हो**। Published alpha.4 interpreter से चलाएँ:

~~~sh
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
~~~

इससे `hello-world/Scarp.project` तथा `hello-world/src/main.srp` बनती हैं। Manifest का वास्तविक content:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

Compiler द्वारा बनाई गई entry file:

~~~scarp
print("Hello from Scarp!");
~~~

`launch` का अपेक्षित output:

~~~text
Hello from Scarp!
~~~

**ध्यान दें:** `create` पहले से मौजूद folder को, चाहे वह खाली हो, overwrite नहीं करता। यह पुरानी alpha.3 files को अपने-आप project में नहीं बदलता। पहले मूल source का backup लें, **अलग नया** project बनाएँ और जरूरत के अनुसार `src/main.srp` तथा स्थानीय module files की सामग्री सावधानी से कॉपी या edit करें। Relative imports को सही रखें और run करने से पहले verify करें। पुरानी directory को वहीं बदलने की कोशिश न करें।

## 3. Manifest और errors की सीमाएँ समझें

- `Scarp.project` तीन निश्चित पंक्तियों वाला UTF-8 **development manifest** है, dependency file या package lock नहीं। Version 1 में केवल `scarp-project`, `name`, `entry` इसी क्रम में होते हैं।
- कुल आकार **4,096 bytes** तक है। Project name 1–96 UTF-8 bytes का है। `entry` एक मौजूद, project के **अंदर** का relative `.srp` path होना चाहिए, forward slashes के साथ और अधिकतम 512 UTF-8 bytes का। Parent traversal, backslashes, अनजान या duplicate fields और manifest symlinks स्वीकार नहीं होते।
- `verify DIRECTORY` और `launch DIRECTORY` parent folders में manifest नहीं खोजते। Project root का स्पष्ट path दें।
- `verify DIRECTORY` source, imports, constants, names और types जाँचता है, पर सामान्य statements नहीं चलाता। `launch DIRECTORY` interpreter से program चलाता है और runtime error आ सकता है। Execution-budget flags केवल `launch` लेता है।
- गलत manifest पर exit status 1 और गलत CLI उपयोग पर 2 मिलता है। Errors के लिए `--diagnostic-format=json` समर्थित है (stderr में, बिना आंशिक सफल output के)।

Validation और execution के errors अलग-अलग देखने के लिए:

~~~sh
scarp verify --diagnostic-format=json hello-world
scarp launch --diagnostic-format=json hello-world
~~~

इस prerelease में अभी **native compilation, package registry, workspace discovery, dependency installation या `scarp build` / `scarp compile` commands उपलब्ध नहीं हैं**। विस्तृत नियमों के लिए [alpha.4 project quickstart](/hi/guide/quickstart-alpha4), [प्रकाशित alpha.4 release guide](/hi/releases/v0.0.5-alpha.4), और [पुराना alpha.3 CLI संदर्भ](/hi/tooling/cli) पढ़ें।
