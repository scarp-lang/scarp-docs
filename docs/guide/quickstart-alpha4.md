# Quickstart: your first Scarp project (v0.0.5-alpha.4)
::: tip Latest published compiler
New installs should use the [published v0.0.6-alpha.2 release and checksums](/releases/v0.0.6-alpha.2) and [release-aware learning path](/guide/learning-path). This alpha.4 page is intentionally pinned to its original generator, binary and stdout.
:::


<!-- scarp-project-release: v0.0.5-alpha.4 -->
<!-- scarp-cli-release: v0.0.5-alpha.4 -->

This is the **historically verified alpha.4 project quickstart** for [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) (November 3, 2026). It is pinned to official source commit `79141329176f5dce51457e90a6652902f6432135`. Scarp is experimental, and **runs through an interpreter**.

## 1. Download and check your compiler

Obtain the official archive for your system and its matching `.sha256` or `SHA256SUMS` from the [published GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4).

| Platform | Official archive |
| --- | --- |
| Windows x64 | `scarp-0.0.5-alpha.4-x86_64-pc-windows-msvc.zip` |
| Linux x64 | `scarp-0.0.5-alpha.4-x86_64-unknown-linux-gnu.tar.gz` |
| macOS Apple Silicon | `scarp-0.0.5-alpha.4-aarch64-apple-darwin.tar.gz` |

Compare the downloaded archive's SHA-256 checksum with the official value **before extracting and running** it. Keep the `scarp` executable accessible in your terminal. If it isn't on `PATH`, use `.\scarp.exe` in PowerShell or `./scarp` on Linux/macOS instead of `scarp` below.

## 2. Create, verify and launch

Open a terminal inside an existing parent folder in which **`hello-world` does not already exist**. Run these four commands in order:

~~~sh
scarp version
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
~~~

`scarp version` must identify `0.0.5-alpha.4`. The `create` command refuses to overwrite even an **empty** existing folder. `verify` checks the project without executing its main statements; `launch` actually executes the starter program.

## 3. Inspect the generated project

The actual project layout is:

~~~text
hello-world/
  Scarp.project
  src/
    main.srp
~~~

The generated `hello-world/Scarp.project` contains exactly:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

The generated `hello-world/src/main.srp` contains exactly:

~~~scarp
print("Hello from Scarp!");
~~~

The released compiler prints this when you **launch** the project:

~~~text
Hello from Scarp!
~~~

This source, manifest and output are not simulated: they are asserted against the published compiler's [actual project generator](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/src/project.rs), and a dedicated GitHub CI job creates, verifies and launches the same project using the tagged interpreter.

## 4. Edit the entry file

Modify `hello-world/src/main.srp` as a UTF-8 source file. The manifest's `entry: src/main.srp` resolves inside the project directory. After each edit, use project-directory `verify` to catch syntax and type errors, and `launch` to execute:

~~~sh
scarp verify hello-world
scarp launch hello-world
~~~

`verify` does not execute regular program statements, runtime arithmetic or user function contracts, so runtime errors can still occur during `launch`.

## 5. Avoid common problems

| Symptom | Fix |
| --- | --- |
| Project already exists | Pick a **new** directory name; `create` never overwrites an existing directory |
| No project manifest | Pass a project root containing an ordinary `Scarp.project`; commands do not search parent folders |
| Unknown manifest field or wrong schema | Use exactly the three ordered version-1 fields from section 3 |
| Entry path escapes the project or uses backslashes | Use a local, slash-separated relative `.srp` entry contained in the project |
| `verify` succeeds but `launch` fails | Static checks cannot guarantee runtime success; inspect the runtime diagnostic |
| `scarp build` / `scarp compile` is unavailable | Scarp does **not** generate native binaries from `.srp` yet |
| Commands are unrecognized | Check that you are using **v0.0.5-alpha.4**, not alpha.3 or older |

For flags, manifest size/path limitations, and error handling, continue to the [full alpha.4 release guide](/releases/v0.0.5-alpha.4), [feature status](/reference/status), and [original alpha.3 CLI reference](/tooling/cli).

**Coming from alpha.3?** Follow the [migration checklist](/guide/migrate-alpha3-to-alpha4) before moving existing sources. You can keep using standalone `exec` and `verify FILE.srp` commands.
