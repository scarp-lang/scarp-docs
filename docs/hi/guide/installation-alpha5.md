# Scarp v0.0.5-alpha.5 कैसे इंस्टॉल करें
::: tip नया alpha.5 release
इस प्रकाशित संस्करण में project-directory module inspection समर्थित है। [alpha.5 CLI](/hi/tooling/cli-alpha5) और [C11 Rust API की सीमाएँ](/hi/reference/c11-backend-alpha5) पढ़ें। C11 emitter **CLI native compiler नहीं** है।
:::


<!-- scarp-cli-release: v0.0.5-alpha.5 -->
<!-- scarp-install-release: v0.0.5-alpha.5 -->

यह मार्गदर्शिका सबसे नई प्रकाशित Scarp compiler prerelease [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) (4 नवंबर 2026) इंस्टॉल करने के लिए है। इसका source commit `2eeed0aa52ccb59523307841ad8ffbd83f8911a8` है। Scarp अभी **प्रयोगात्मक interpreter** है; यह स्थिर भाषा या `.srp` से native executable बनाने वाला compiler नहीं है।

::: tip पहली बार Scarp इस्तेमाल कर रहे हैं?
इंस्टॉल करने के बाद [पहला project tutorial](/hi/guide/quickstart-alpha5) पढ़ें। Alpha.3 से आ रहे हैं तो [migration guide](/hi/guide/migrate-alpha3-to-alpha5) देखें। पुराना [alpha.1 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) केवल ऐतिहासिक संदर्भ है, नए इंस्टॉलेशन की सलाह नहीं।
:::

## 1. अपने सिस्टम का आधिकारिक पैकेज चुनें

| Platform | Official archive | Matching checksum |
| --- | --- | --- |
| Windows x64 | [`scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip) | [`scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip.sha256) |
| Linux x64 (glibc) | [`scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz) | [`scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz.sha256) |
| macOS Apple Silicon (ARM64) | [`scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz) | [`scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz.sha256) |

यह मार्गदर्शिका बनाते समय आधिकारिक प्रकाशित release में तीन archives, उनकी तीन `.sha256` files और [`SHA256SUMS`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.5/SHA256SUMS) मौजूद थीं। अपने **OS और CPU के अनुसार** ही archive लें। इस रिलीज़ में Windows ARM64, Linux ARM64 या Intel macOS की native archive प्रकाशित नहीं है; उचित Rust target और build tools उपलब्ध हों तो source build विकल्प हो सकता है।

Archive तथा उसी के नाम वाली `.sha256` file **एक ही folder** में डाउनलोड करें। नीचे दिए गए commands उसी folder में चलाएँ। Checksum file में अपेक्षित SHA-256 hash और archive का नाम होता है। **Extract या execute करने से पहले** hash जरूर मिलाएँ। आधिकारिक GitHub release का checksum ही इस्तेमाल करें; किसी अनजान mirror पर भरोसा न करें। सही checksum केवल डाउनलोड किए गए bytes की प्रकाशित value से समानता बताता है, किसी भी third-party binary की सुरक्षा की गारंटी नहीं।

## 2. Windows x64 — PowerShell

**PowerShell** खोलें, Command Prompt नहीं। यह script official checksum पढ़ती है, archive का hash निकालकर तुलना करती है और mismatch होने पर extract करने से पहले रुक जाती है। इसके बाद असली package subfolder में जाती है:

~~~powershell
$archive = 'scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc.zip'
$expected = ((Get-Content "$archive.sha256" -Raw).Trim() -split '\s+')[0]
$actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
if ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }
Expand-Archive -LiteralPath $archive -DestinationPath '.\scarp-alpha5'
Set-Location '.\scarp-alpha5\scarp-0.0.5-alpha.5-x86_64-pc-windows-msvc'
.\scarp.exe version
.\scarp.exe create hello-world
.\scarp.exe verify hello-world
.\scarp.exe launch hello-world
~~~

Version `0.0.5-alpha.5` दिखाई देना चाहिए। नए starter project का output `Hello from Scarp!` होगा। `.\scarp.exe` से चलाने पर `PATH` में मौजूद पुराना compiler गलती से इस्तेमाल नहीं होता।

## 3. Linux x64 — Bash

Native runtime support वाले Linux x64 सिस्टम पर चलाएँ:

~~~bash
sha256sum --check scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz.sha256
mkdir -p scarp-alpha5
tar -xzf scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu.tar.gz -C scarp-alpha5
cd scarp-alpha5/scarp-0.0.5-alpha.5-x86_64-unknown-linux-gnu
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

Extract करने से पहले `sha256sum --check` में **OK** आना चाहिए। आधिकारिक archive के भीतर उसी नाम का package folder और `scarp` executable है।

## 4. macOS Apple Silicon — Terminal

Apple Silicon CPU वाले Mac पर चलाएँ:

~~~bash
shasum -a 256 -c scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz.sha256
mkdir -p scarp-alpha5
tar -xzf scarp-0.0.5-alpha.5-aarch64-apple-darwin.tar.gz -C scarp-alpha5
cd scarp-alpha5/scarp-0.0.5-alpha.5-aarch64-apple-darwin
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

macOS पर `shasum -a 256 -c` प्रकाशित SHA-256 file का मिलान करता है। यह native package **ARM64** के लिए है, Intel Mac के लिए नहीं। अगर macOS execution रोकता है, तो सुरक्षा चेतावनी और डाउनलोड का स्रोत जाँचें; बिना समझे security protections बंद न करें।

## 5. विकल्प: उसी प्रकाशित source से build करें

पहले Rust toolchain तथा Cargo इंस्टॉल करें ([rustup](https://rustup.rs/))। Windows पर आवश्यक MSVC toolchain और build tools भी चाहिए। बदलती `main` branch के बजाय **tagged release source** लें। Build से पहले commands 40-character commit hash की जाँच करती हैं।

Linux या macOS:

~~~bash
git clone https://github.com/scarp-lang/scarp.git
cd scarp
git checkout v0.0.5-alpha.5
test "$(git rev-parse HEAD)" = "2eeed0aa52ccb59523307841ad8ffbd83f8911a8" || exit 1
cargo build --locked
./target/debug/scarp version
~~~

Windows PowerShell:

~~~powershell
git clone https://github.com/scarp-lang/scarp.git
Set-Location scarp
git checkout v0.0.5-alpha.5
if ((git rev-parse HEAD).Trim() -ne '2eeed0aa52ccb59523307841ad8ffbd83f8911a8') { throw 'Unexpected source commit' }
cargo build --locked
.\target\debug\scarp.exe version
~~~

`cargo build` Rust में लिखे **Scarp interpreter** को build करता है, किसी `.srp` program की native executable नहीं बनाता। इस published release में Scarp package manager और project dependency installer मौजूद नहीं हैं।

## 6. आम समस्याएँ और समाधान

| समस्या | समाधान |
| --- | --- |
| SHA-256 hash मेल नहीं खाता | **रुकें।** उसी आधिकारिक release से archive और checksum दोबारा डाउनलोड करें; package न चलाएँ |
| `scarp` command नहीं मिलती | Extracted package folder में Windows पर `.\scarp.exe`, Linux/macOS पर `./scarp` चलाएँ |
| Version alpha.3 या पुराना है | Extracted alpha.5 executable इस्तेमाल करें; `create` और `launch` alpha.5 में आए |
| `create` किसी folder को स्वीकार नहीं करता | **नया** folder name लें; पहले से मौजूद खाली folder को भी overwrite नहीं किया जाता |
| `verify` सफल लेकिन `launch` विफल | Static जाँच runtime statements नहीं चलाती; runtime diagnostic देखें |
| आपके platform का native package नहीं है | उपयुक्त Rust target मिलने पर tagged source से build करने पर विचार करें |

पहला project सफल चलने के बाद [alpha.5 project tutorial](/hi/guide/quickstart-alpha5), [CLI संदर्भ](/hi/tooling/cli), [compatibility](/hi/reference/compatibility) और [समस्या निवारण](/hi/tooling/troubleshooting) पढ़ें।

**प्रमाण:** [published release assets](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5), [tagged packaging script](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/scripts/package.ps1), [release verifier](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/scripts/verify-release.py) तथा [release source](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.5)। Documentation CI commands और दोनों भाषाओं के code examples की समानता जाँचती है; compiler CI वास्तविक project व्यवहार जाँचता है।
