# Install the latest published Scarp

<!-- scarp-cli-release: v0.0.6-alpha.20 -->

**Official download center:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/).

As of November 24, 2026, the latest verified published compiler is **[Scarp v0.0.6-alpha.20](/releases/v0.0.6-alpha.20)**, an experimental interpreter prerelease. For the newest available version, including future prereleases, use the official Downloads website rather than the archived installation pages.

## Choose your platform

| Operating system | Permanent latest-version download | Available architecture |
| --- | --- | --- |
| Windows | [Latest Scarp for Windows](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Latest Scarp for Linux](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [Latest Scarp for macOS](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

The permanent links check for the newest **published** Scarp release (including prereleases), require JavaScript, and open a platform archive if one is available. Windows ARM64, Linux ARM64 and Intel macOS are **not** currently advertised as binary targets.

## Verify the download before running it

After selecting the download, confirm the archive's **actual version** on the [official downloads page](https://scarp-lang.github.io/downloads/). Verify its SHA-256 against the checksum posted for **that exact version** before extraction or execution. Never assume the alpha.20 checksum below is valid for a newer archive.

| Verified alpha.20 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.6-alpha.20-x86_64-pc-windows-msvc.zip` | `68a5ee47f24e2e36dd7fb1fcc6257feaea291d801048f7866bff1a7e4994aca2` |
| Linux x64 `scarp-0.0.6-alpha.20-x86_64-unknown-linux-gnu.tar.gz` | `b570336d589d7484e67e69274d84cbab73fced4f41a99d11a07255da2048eb7b` |
| macOS ARM64 `scarp-0.0.6-alpha.20-aarch64-apple-darwin.tar.gz` | `908a21d62888ab716eba97d79a1f13cd705e19e2b584b344638f6dccdbe93bb3` |

Those digests apply **only** to [the published alpha.20 artifacts](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.20). The hash matching is an integrity check, not a guarantee that experimental software is production-ready. If a hash fails to match, **stop**.

## Check your installed interpreter

Extract the verified archive to a directory you control and invoke its own binary, not another Scarp executable already on your `PATH`:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

The printed version should agree with the archive you actually downloaded. For a verified alpha.20 project, `scarp exec` selects a valid project manifest, then `src/main.srp`, then `main.srp` when no manifest is present; malformed manifests are an error. From the appropriate project directory, with the extracted executable accessible:

~~~sh
scarp exec
~~~

Read the [current reference](/reference/current) and [decimal and tuple guide](/guide/alpha20-language) for current language behavior and limits.

> Older release documents are retained as historical evidence with their original tagged compiler outputs, not as current installation recommendations.
