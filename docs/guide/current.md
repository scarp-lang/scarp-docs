# Start with the current Scarp compiler

<!-- scarp-cli-release: v0.0.6-alpha.20 -->

The recommended compiler for new users is the **latest published Scarp prerelease**, available from the [official downloads hub](https://scarp-lang.github.io/downloads/). As of November 24, 2026, that verified release is **[v0.0.6-alpha.20](/releases/v0.0.6-alpha.20)**. This is an experimental Rust-powered **interpreter**, not a stable language specification or a general native-code compiler.

## Step 1: Install the correct package

Choose the platform's **permanent latest-version** download. These links track new published releases instead of sending you to an archived interpreter.

- [Windows x64 latest](https://scarp-lang.github.io/downloads/windows/latest)
- [Linux x64 latest](https://scarp-lang.github.io/downloads/linux/latest)
- [macOS Apple Silicon latest](https://scarp-lang.github.io/downloads/macos/latest)

Follow the [installation and SHA-256 verification guide](/guide/install-latest). Do not reuse an old release's checksum with a newer archive.

## Step 2: Check the interpreter you actually downloaded

From its extracted binary directory, run the appropriate command:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

Confirm that the version printed matches the actual downloaded archive. If a machine has several Scarp installations, run the binary directly rather than guessing which `scarp` is on your `PATH`.

## Step 3: Execute a verified alpha.20 project

In the **published alpha.20** CLI, `scarp exec` with no source argument checks the **current directory only**. A present `scarp.project` or legacy `Scarp.project` manifest takes priority and must be valid. With no manifest, it looks for `src/main.srp` and then `main.srp`; otherwise it reports an error. An invalid manifest never silently falls back.

~~~sh
scarp exec
scarp exec main.srp
scarp verify src/main.srp
~~~

For an explicit file, use `scarp exec path/to/file.srp`. `exec` runs interpreted source code; it does **not** produce a native executable. New projects write `scarp.project`; legacy `Scarp.project` remains readable. Read the [exact decimal and tuple guide](/guide/alpha20-language).

## Step 4: Understand the current capabilities

The [current compiler reference](/reference/current) summarizes what is demonstrably available in this release, including exact decimal literals, tuple operations, source entrypoint selection, and Lifetime behavior. The [release notes](/releases/v0.0.6-alpha.20) provide immutable source provenance and published checksums.

Read [systems programming and Rust embedding](/guide/alpha20-systems) for native ABI boundaries, callable slots and cumulative quotas.

**Documentation policy:** New installations and recommendations always use the latest published compiler. Older compiler documentation has been retired from the active navigation, search results, and sitemap. Historical source and conformance tests remain in the repository for reproducibility; they are not recommended installation paths.
