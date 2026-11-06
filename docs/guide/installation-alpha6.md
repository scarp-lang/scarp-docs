# Install Scarp v0.0.6-alpha.1

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-install-release: v0.0.6-alpha.1 -->
<!-- scarp-install-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

This is the **current published Scarp compiler prerelease**, [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) (November 5, 2026), built from exact source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`. Scarp is an **experimental interpreter**, not a stable package manager or a compiler that turns `.srp` programs into native executables.

The release provides read-only [symbol and reference inspection](/tooling/cli-alpha6), [RMS numerics](/language/rms-alpha6), and a [complete two-file project tutorial](/tutorials/project-symbol-navigation-alpha6).

## 1. Download the correct published archive

| System | Official archive | Matching SHA-256 file |
| --- | --- | --- |
| Windows x64 (MSVC) | [`scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip) | [`scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-pc-windows-msvc.zip.sha256) |
| Linux x64 (GNU/glibc) | [`scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz) | [`scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-x86_64-unknown-linux-gnu.tar.gz.sha256) |
| macOS Apple Silicon (ARM64) | [`scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz) | [`scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/scarp-0.0.6-alpha.1-aarch64-apple-darwin.tar.gz.sha256) |

The official release contains those **three archives**, their three matching `.sha256` files, and [`SHA256SUMS`](https://github.com/scarp-lang/scarp/releases/download/v0.0.6-alpha.1/SHA256SUMS). These are the platforms for which packaged downloads were published; **no Windows ARM64, Linux ARM64, or Intel macOS package** is listed for this release.

Download the archive for your exact OS/CPU **and its corresponding `.sha256` file into the same folder**. Verify the downloaded archive *before* extraction. The `.sha256` value is a checksum, **not a digital signature**, and does not independently establish publisher identity. Use the official release page, not third-party mirrors.

## 2. Windows x64 — PowerShell

Open **PowerShell** in the download folder, not Command Prompt. The first four lines compare the official checksum with the archive and stop on a mismatch.

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

The version command should report `scarp 0.0.6-alpha.1`, and the starter project should print `Hello from Scarp!`. Use `.\scarp.exe` from the extracted package so an older executable on `PATH` cannot be selected accidentally.

## 3. Linux x64 — Bash

From the directory containing the downloaded Linux archive and checksum:

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

Only continue when `sha256sum --check` reports **OK**. The unpacked tarball contains a named package directory with the `scarp` executable.

## 4. macOS Apple Silicon — Terminal

For a Mac with an **ARM64 Apple Silicon CPU**:

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

Only continue when `shasum -a 256 -c` succeeds. These commands are **not** instructions for an Intel Mac. If macOS blocks a binary, inspect its origin and the warning instead of blindly bypassing security controls.

## 5. Alternative: build the exact published source

Install Rust and Cargo first; Windows also needs an appropriate MSVC build toolchain. Scarp uses Rust 2021. Build the immutable release tag **instead of moving `main`** and verify its 40-character commit before building. This exact source uses an offline Cargo build.

Linux or macOS:

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

The result is the Rust-based Scarp **interpreter/CLI**. Source-build commands should be run in a fresh directory. The offline build expects the Rust toolchain to be installed; it does not install Rust automatically.

After installing, the optional [read-only compiler capability check](/tooling/diagnose-alpha6) explains `scarp diagnose --json` and how to confirm the actual executable without changing project files.

## 6. Verify the installed compiler and continue learning

After the version and starter-project test, use the **published alpha.6 executable** to work through [the source-navigation project](/tutorials/project-symbol-navigation-alpha6). Its commands explain `scarp inspect symbols --json` and `scarp inspect references --json` without pretending they are an LSP or rename engine. See the [alpha.6 release notes](/releases/v0.0.6-alpha.1) and [learning path](/guide/learning-path).

If a download hash differs, **stop and re-download both files from the same release**. If `scarp version` reports an older version, invoke the executable from the extracted folder explicitly. If `create` rejects a project directory, use a new folder name; it will not overwrite an existing destination. If the package is missing for your platform, consider the release-tagged source build instead of substituting an archive for another CPU.

**Evidence:** [annotated release tag](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1), [tagged packaging implementation](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/scripts/package.ps1), [tagged release verifier](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/scripts/verify-release.py), and [tagged compiler source](https://github.com/scarp-lang/scarp/tree/v0.0.6-alpha.1). Documentation checks pin release identity, exact installation commands and English/Hindi parity.
