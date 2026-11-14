# Install Scarp v0.0.5-alpha.4
::: warning Historical alpha.4 release
For a new installation, use the [currently published alpha.9 packages and checksums](/releases/v0.0.6-alpha.10). These alpha.4 archives and checksums remain available only for reproducing historical behavior.
:::

<!-- scarp-cli-release: v0.0.5-alpha.4 -->
<!-- scarp-install-release: v0.0.5-alpha.4 -->

This historical guide installs the **published alpha.4 compiler prerelease**: [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) (November 3, 2026), from source commit `79141329176f5dce51457e90a6652902f6432135`. Scarp is an **experimental interpreter**, not a stable language or native `.srp` executable compiler.

::: tip New here?
After installation, follow the [first project quickstart](/guide/quickstart-alpha4). If you used alpha.3, consult the [migration guide](/guide/migrate-alpha3-to-alpha4). The old [alpha.1 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) is historical, **not** the recommended new install.
:::

## 1. Choose your official download

| Platform | Official archive | Matching checksum |
| --- | --- | --- |
| Windows x64 | [`scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip) | [`scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip.sha256) |
| Linux x64 (glibc) | [`scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz) | [`scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz.sha256) |
| macOS Apple Silicon (ARM64) | [`scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz) | [`scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz.sha256) |

All seven listed assets (three archives, their three individual checksums, and [`SHA256SUMS`](https://github.com/scarp-lang/scarp/releases/download/v0.0.5-alpha.4/SHA256SUMS)) were present on the official published release when this guide was prepared. Use **only the archive matching your OS/CPU**. There is no published Windows ARM64, Linux ARM64, or Intel macOS archive for this release; building from source may be an alternative if a supported Rust target and the necessary build tools are available.

Download **both** the archive and its `.sha256` file to the **same folder**. Run the matching commands below from that folder. The checksum contains the expected SHA-256 digest and archive name; compare or check it **before extracting or running anything**. Obtain checksums from the official GitHub release, not an unrelated mirror. A matching checksum verifies downloaded bytes against the release's posted checksum, not the safety of arbitrary third-party binaries.

## 2. Windows x64 — PowerShell

Use **PowerShell** (not Command Prompt). The script reads the official checksum, compares the calculated archive hash, and stops before extraction if the values differ. It then enters the package's actual nested directory:

~~~powershell
$archive = 'scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip'
$expected = ((Get-Content "$archive.sha256" -Raw).Trim() -split '\s+')[0]
$actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
if ($actual -ine $expected) { throw 'SHA-256 mismatch: stop' }
Expand-Archive -LiteralPath $archive -DestinationPath '.\scarp-alpha4'
Set-Location '.\scarp-alpha4\scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc'
.\scarp.exe version
.\scarp.exe create hello-world
.\scarp.exe verify hello-world
.\scarp.exe launch hello-world
~~~

You should see version `0.0.5-alpha.4`, followed by the starter project's output `Hello from Scarp!`. Using `.\scarp.exe` avoids accidentally running an older `scarp` from your `PATH`.

## 3. Linux x64 — Bash

On a Linux x64 system with the required native runtime support, run:

~~~bash
sha256sum --check scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz.sha256
mkdir -p scarp-alpha4
tar -xzf scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz -C scarp-alpha4
cd scarp-alpha4/scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

`sha256sum --check` must report **OK** before extraction. The publisher's archive contains the named package folder and the executable `scarp` inside it.

## 4. macOS Apple Silicon — Terminal

On a Mac with an Apple Silicon CPU, use:

~~~bash
shasum -a 256 -c scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz.sha256
mkdir -p scarp-alpha4
tar -xzf scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz -C scarp-alpha4
cd scarp-alpha4/scarp-0.0.5-alpha.4-aarch64-apple-darwin
./scarp version
./scarp create hello-world
./scarp verify hello-world
./scarp launch hello-world
~~~

On macOS, `shasum -a 256 -c` checks the published SHA-256 file. The macOS package is **ARM64**; it is not advertised as a native Intel macOS build. If macOS blocks execution, inspect the downloaded file's origin and your system's security message rather than disabling protections blindly.

## 5. Alternatively, build the exact published source

Install a compatible Rust toolchain and Cargo first (see [rustup](https://rustup.rs/)). On Windows use an MSVC Rust toolchain and its required build tools. Build **the tagged source**, not a moving `main` branch; each sequence checks the expected 40-character source commit before building.

Linux or macOS:

~~~bash
git clone https://github.com/scarp-lang/scarp.git
cd scarp
git checkout v0.0.5-alpha.4
test "$(git rev-parse HEAD)" = "79141329176f5dce51457e90a6652902f6432135" || exit 1
cargo build --locked
./target/debug/scarp version
~~~

Windows PowerShell:

~~~powershell
git clone https://github.com/scarp-lang/scarp.git
Set-Location scarp
git checkout v0.0.5-alpha.4
if ((git rev-parse HEAD).Trim() -ne '79141329176f5dce51457e90a6652902f6432135') { throw 'Unexpected source commit' }
cargo build --locked
.\target\debug\scarp.exe version
~~~

`cargo build` compiles the **Rust-based Scarp interpreter**. It does **not** compile a `.srp` program into a native binary. The published release provides no package manager or dependency installer for Scarp projects.

## 6. Diagnose version and installation problems

| Symptom | What to check |
| --- | --- |
| SHA-256 mismatch | **Stop.** Re-download the archive and checksum from the same official release; do not execute the package |
| `scarp` is not recognized | Run `.\scarp.exe` on Windows or `./scarp` on Linux/macOS **from the extracted package directory** |
| Version is alpha.3 or earlier | Use the extracted alpha.4 executable explicitly; `create` and `launch` are new in alpha.4 |
| `create` rejects a folder | Use a **new name**; it never overwrites an existing destination, even an empty folder |
| `verify` succeeds but `launch` fails | Static verification does not execute runtime statements; inspect the runtime error |
| No native binary for your platform | Consider a tagged source build with an appropriate supported Rust target |

After the first successful launch, see the [alpha.4 project tutorial](/guide/quickstart-alpha4), [CLI reference](/tooling/cli), [compatibility guide](/reference/compatibility), and [troubleshooting](/tooling/troubleshooting).

**Evidence:** [published release assets](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4), [tagged packaging script](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/scripts/package.ps1), [tagged release verifier](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/scripts/verify-release.py) and [compiler source at the release tag](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.4). The documentation CI checks the exact commands and bilingual parity, while tagged compiler CI validates project behavior.
