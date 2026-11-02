# Installation

**Latest published release: [v0.0.5-alpha.2](/releases/v0.0.5-alpha.2) (November 2, 2026).** This page retains the tested **alpha.1** installation instructions and their pinned example references until the main documentation baseline is migrated. For new alpha.2 features, select the newer [official release archive](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) and verify its own checksum and version.

If you already use alpha.1, the [alpha.1 → alpha.2 upgrade readiness checks](/reference/upgrade-readiness) document which original examples have been re-tested with the newer compiler. They do not replace the tagged archive and checksum checks here.

Scarp v0.0.5-alpha.1 is a **prerelease**. You can use a published binary package or build the interpreter with Rust. This does not install a native-code compiler for `.srp` files.

## Option A: download a published package

Visit the [official v0.0.5-alpha.1 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1). The compiler's [release verification record](https://github.com/scarp-lang/scarp/blob/main/docs/releases/v0.0.5-alpha.1-validation.md) describes tested packages for Windows x64, Linux x64, and macOS ARM64, and provides checksum evidence.

1. Select the archive that matches your operating system and CPU architecture.
2. Verify its SHA-256 checksum against the checksum supplied with that release.
3. Extract the package, including its `examples/` directory.
4. From the extracted directory, run the executable and verify its version:

~~~sh
./scarp --version
./scarp run examples/hello.srp
~~~

On Windows in PowerShell, use `./scarp.exe` (or `.\scarp.exe`) in place of `./scarp`. Confirm the exact archive contents in the release before running commands. If a different Scarp installation is on your `PATH`, invoking the extracted executable directly avoids ambiguity.

## Option B: build from source

Install a stable Rust toolchain and Cargo from [rustup](https://rustup.rs/). For Windows, use the MSVC toolchain and any C++ build tools the installer requests.

~~~sh
git clone https://github.com/scarp-lang/scarp.git
cd scarp
cargo build --locked
cargo run -- --version
cargo run -- run examples/hello.srp
~~~

The interpreter currently has no third-party Rust crate dependencies. Once the toolchain is present, the project supports offline builds and tests:

~~~sh
cargo build --locked --offline
cargo test --locked --offline
~~~

To install a command from this source checkout:

~~~sh
cargo install --path . --locked
scarp --version
scarp run examples/hello.srp
~~~

The source directory is a Rust package, and `cargo build` builds the **Scarp interpreter**. It does not translate `.srp` code into machine code.

## Troubleshooting installation

If `scarp` is not found, run the executable from its folder or check that Cargo's binary directory is on your `PATH`. A mismatched version can produce misleading syntax errors, especially with older `let`/`println` examples. See [compatibility](/reference/compatibility) and [troubleshooting](/tooling/troubleshooting).

**Verified against:** [getting started in compiler repo](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/getting-started.md), [published release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1).
