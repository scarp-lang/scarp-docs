# Quickstart with Scarp v0.0.5-alpha.3

<!-- scarp-cli-release: v0.0.5-alpha.3 -->

This is the **recommended first-run guide for the latest published prerelease**, [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3), published **November 2, 2026**. Scarp is experimental and runs programs through an interpreter: there is **no native executable builder or stable language guarantee**. Older reference pages remain pinned to [alpha.1](/reference/status).

## 1. Choose and verify the official download

Download the archive for your computer from the **official [alpha.3 GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)**:

| System | Release archive |
| --- | --- |
| Windows x64 | `scarp-0.0.5-alpha.3-x86_64-pc-windows-msvc.zip` |
| Linux x64 | `scarp-0.0.5-alpha.3-x86_64-unknown-linux-gnu.tar.gz` |
| macOS Apple Silicon | `scarp-0.0.5-alpha.3-aarch64-apple-darwin.tar.gz` |

Download the corresponding `.sha256` file or `SHA256SUMS` **from the same release**. Before extraction, compute the downloaded archive's SHA-256 hash and compare the complete hash with the published value:

- **Windows PowerShell:** run `Get-FileHash -Algorithm SHA256 -Path .\scarp-0.0.5-alpha.3-x86_64-pc-windows-msvc.zip`.
- **Linux:** run `sha256sum scarp-0.0.5-alpha.3-x86_64-unknown-linux-gnu.tar.gz`.
- **macOS:** run `shasum -a 256 scarp-0.0.5-alpha.3-aarch64-apple-darwin.tar.gz`.

If the hashes differ, **do not run the archive**. Extract the verified archive. Keep the included example files and their folders together. You can run the executable from its extracted directory without placing it on your system `PATH`.

## 2. Confirm the installed version

Open a terminal in the extracted folder and run the matching executable:

~~~sh
scarp version
~~~

Use `.\scarp.exe version` on Windows PowerShell or `./scarp version` on Linux/macOS if you have not added Scarp to `PATH`. Confirm that the reported version is **0.0.5-alpha.3** before continuing. Do not mix alpha.1 or alpha.2 commands with an older binary.

## 3. Create a tested Scarp program

In a folder you control, create **`text_construction.srp`** as a UTF-8 file with this exact source:

~~~scarp
bind greeting: string = text_concat("Hello, ", "🌍");
bind planet = text_slice(greeting, 7, 1);
print(greeting);
print(text_repeat(planet, 3));
print(text_len(greeting), text_bytes(greeting));
~~~

This source is copied byte-for-byte from the [alpha.3 compiler's published example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp), not an untested proposal.

## 4. Verify first, then execute

Run these commands from the directory containing the file:

~~~sh
scarp verify text_construction.srp
scarp exec text_construction.srp
~~~

`verify` checks source and module types **without running ordinary statements**. `exec` executes the program. With the exact source above, the published output is:

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

If Scarp is not on `PATH`, save `text_construction.srp` beside the extracted executable and substitute `.\scarp.exe` (Windows PowerShell) or `./scarp` (Linux/macOS) for `scarp` in the commands above. Alternatively, call the executable using its absolute path; filenames are resolved from the terminal's current directory.

Why `8 11`? The text has **8 Unicode scalar values** but **11 UTF-8 bytes**: 🌍 counts as one scalar value and four bytes.

::: warning Do not confuse the older commands
Published alpha.3 still accepts older `scarp run` and `scarp check` commands for compatibility. Unlike the new static `verify`, the old `check` can evaluate selected runtime paths. `inspect ast` is only a development-oriented parser representation, not a stable JSON API.
:::

## 5. Learn more

Next, use the [published alpha.3 CLI reference](/tooling/cli) for command syntax and error codes, then explore [the full alpha.3 release guide](/releases/v0.0.5-alpha.3) for four verified programs, the CLI and structured errors. For the longer installation/build-from-source workflow, read [installation](/guide/installation), noting its **separately pinned alpha.1 steps**. Read the [language status](/reference/status) before relying on an experimental feature.

**Evidence:** the source and output above are checked against the exact [alpha.3 conformance fixture](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3) by the site's TypeScript validation and CI.

**Upgrading to alpha.4?** See the [versioned file-to-project migration guide](/guide/migrate-alpha3-to-alpha4). Existing file commands continue to work; the new directory commands require alpha.4.
