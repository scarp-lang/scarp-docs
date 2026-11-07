# Scarp v0.0.6-alpha.1 कैसे इंस्टॉल करें

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-install-release: v0.0.6-alpha.1 -->
<!-- scarp-install-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

यह **पुराने प्रकाशित Scarp compiler prerelease का version-specific guide** [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) (5 नवंबर 2026) की installation guide है। इसका सही source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` है। Scarp अभी **प्रयोगात्मक interpreter** है, न कि stable package manager या `.srp` को native executable में बदलने वाला compiler।

**नवीनतम प्रकाशित v0.0.6-alpha.3 packages और checksum के लिए [नई release guide](/hi/releases/v0.0.6-alpha.3) पढ़ें।** नीचे के archive नाम, hash और source commit जानबूझकर पुराने **alpha.1** के हैं; इन्हें alpha.2 की files से न मिलाएँ।

इस संस्करण में [symbols और references की static जाँच](/hi/tooling/cli-alpha6), [RMS गणना](/hi/language/rms-alpha6), और [दो source files वाला पूरा project tutorial](/hi/tutorials/project-symbol-navigation-alpha6) उपलब्ध हैं।

## 1. सही आधिकारिक पैकेज डाउनलोड करें

| System | Official archive | Matching SHA-256 file |
| --- | --- | --- |
| Windows x64 (MSVC) | [`scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip) | [`scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip.sha256) |
| Linux x64 (GNU/glibc) | [`scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz) | [`scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256) |
| macOS Apple Silicon (ARM64) | [`scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz) | [`scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256) |

आधिकारिक release में **तीन archives**, उनकी तीन `.sha256` files और [`SHA256SUMS`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/SHA256SUMS) उपलब्ध हैं। ये केवल प्रकाशित platforms हैं। Windows ARM64, Linux ARM64 या Intel macOS के लिए इस release में कोई native archive प्रकाशित नहीं है।

अपने **OS और CPU से मेल खाने वाली archive** और उसी नाम की `.sha256` file **एक ही folder** में डाउनलोड करें। Extract करने से **पहले hash जाँचें**। `.sha256` checksum है, **digital signature नहीं**; यह अकेला publisher की पहचान साबित नहीं करता। आधिकारिक GitHub release इस्तेमाल करें, अनजान mirror नहीं।

## 2. Windows x64 — PowerShell

Download folder में **PowerShell** खोलें; Command Prompt नहीं। शुरू की चार पंक्तियाँ archive का SHA-256 official checksum से मिलाती हैं। अंतर होने पर आगे बढ़ने की बजाय command रुकती है।

~~~powershell
$archive = 'scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip'
$expected = ((Get-Content "$archive.sha256" -Raw).Trim() -split '\s+')[0]
$actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
if ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }
Expand-Archive -LiteralPath $archive -DestinationPath '.\scarp-alpha6'
Set-Location '.\scarp-alpha6\scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc'
.\scarp.exe version
.\scarp.exe create hello-world
.\scarp.exe verify hello-world
.\scarp.exe launch hello-world
~~~

Version `scarp 0.0.6-alpha.1` दिखना चाहिए और नया project `Hello from Scarp!` print करेगा। Extracted folder से `.\scarp.exe` चलाने पर `PATH` में मौजूद पुराना compiler गलती से नहीं चलेगा।

## 3. Linux x64 — Bash

Linux archive और checksum वाली directory से:

~~~bash
sha256sum --check scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256
mkdir -p scarp-alpha6
tar -xzf scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz -C scarp-alpha6
cd scarp-alpha6/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

Extract से पहले `sha256sum --check` में **OK** आना जरूरी है। Tarball के अंदर इसी version के नाम वाला folder और `scarp` executable होगा।

## 4. macOS Apple Silicon — Terminal

**ARM64 Apple Silicon Mac** के लिए:

~~~bash
shasum -a 256 -c scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256
mkdir -p scarp-alpha6
tar -xzf scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz -C scarp-alpha6
cd scarp-alpha6/scarp-0.0.6-alpha.1-aarch64-apple-darwin
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

`shasum -a 256 -c` सफल होने पर ही आगे बढ़ें। ये commands Intel Mac के लिए नहीं हैं। macOS सुरक्षा चेतावनी दिखाए तो binary के स्रोत की जाँच करें; बिना समझे सुरक्षा बंद न करें।

## 5. विकल्प: प्रकाशित source से build

पहले Rust और Cargo install करें; Windows पर उचित MSVC build toolchain भी चाहिए। Scarp, Rust 2021 प्रयोग करता है। बदलती `main` branch के बजाय **निर्धारित release tag** checkout करें और build से पहले पूरा 40-character commit hash जाँचें। प्रकाशित source का offline Cargo build इस्तेमाल करें।

Linux या macOS:

~~~bash
git clone https://github.com/scarp-lang/scarp.git
cd scarp
git checkout v0.0.6-alpha.1
test "$(git rev-parse HEAD)" = "aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8" || exit 1
cargo build --locked --offline
./target/debug/scarp version
~~~

Windows PowerShell:

~~~powershell
git clone https://github.com/scarp-lang/scarp.git
Set-Location scarp
git checkout v0.0.6-alpha.1
if ((git rev-parse HEAD).Trim() -ne 'aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8') { throw 'Unexpected source commit' }
cargo build --locked --offline
.\target\debug\scarp.exe version
~~~

इससे Rust-आधारित Scarp **interpreter/CLI** बनेगा, किसी `.srp` program की native executable नहीं। नया folder इस्तेमाल करें और पहले Rust toolchain install करें। Offline build स्वयं Rust install नहीं करता।

इंस्टॉल होने के बाद [compiler capability check](/hi/tooling/diagnose-alpha6) में `scarp diagnose --json` द्वारा सही executable की read-only जाँच समझाई गई है। इससे project files नहीं बदलतीं।

## 6. स्थापना जाँचें और आगे सीखें

Version तथा नए project के परीक्षण के बाद इसी **alpha.6 executable** से [पूरा source-navigation project](/hi/tutorials/project-symbol-navigation-alpha6) चलाएँ। इसमें `scarp inspect symbols --json` और `scarp inspect references --json` समझाए गए हैं; ये अभी LSP या automatic rename engine नहीं हैं। [प्रकाशित release](/hi/releases/v0.0.6-alpha.1) और [सात-चरण सीखने का रास्ता](/hi/guide/learning-path) भी देखें।

Checksum गलत मिले तो **तुरंत रुकें** और archive व checksum दोनों उसी official release से दोबारा लें। `scarp version` पुराना version दिखाए तो extracted folder की executable सीधे चलाएँ। `create` किसी पहले से बने folder को overwrite नहीं करेगा—नया folder नाम दें। आपके CPU के लिए archive न हो तो दूसरे CPU की file इस्तेमाल करने के बजाय प्रकाशित tag से source build पर विचार करें।

**प्रमाण:** [आधिकारिक प्रकाशित release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1), [tagged packaging code](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/scripts/package.ps1), [release verification script](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/scripts/verify-release.py), और [tagged source](https://github.com/scarp-lang/scarp/tree/v0.0.6-alpha.1)। Documentation CI exact version, installation commands और हिन्दी/अंग्रेज़ी parity की जाँच करती है।
