# Install the latest published Scarp

<!-- scarp-cli-release: v0.0.7-alpha.2 -->

**Official download center:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/).

As of November 26, 2026, the latest verified published compiler is **[Scarp v0.0.7-alpha.2](/releases/v0.0.7-alpha.2)**, an experimental interpreter prerelease. For the newest available version, including future prereleases, use the official Downloads website rather than the archived installation pages.

## Choose your platform

| Operating system | Permanent latest-version download | Available architecture |
| --- | --- | --- |
| Windows | [Latest Scarp for Windows](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Latest Scarp for Linux](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [Latest Scarp for macOS](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

The permanent links check for the newest **published** Scarp release (including prereleases), require JavaScript, and open a platform archive if one is available. Windows ARM64, Linux ARM64 and Intel macOS are **not** currently advertised as binary targets.

## Verify the download before running it

After selecting the download, confirm the archive's **actual version** on the [official downloads page](https://scarp-lang.github.io/downloads/). Verify its SHA-256 against the checksum posted for **that exact version** before extraction or execution. Never assume the v0.0.7-alpha.2 checksum below is valid for a newer archive.

| Verified v0.0.7-alpha.2 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.7-alpha.2-x86_64-pc-windows-msvc.zip` | `5cddf9d831d6eb487b2142755b36b48f1cc598d8f6cfbca39332219fd2567849` |
| Linux x64 `scarp-0.0.7-alpha.2-x86_64-unknown-linux-gnu.tar.gz` | `8397f2f096fe9598cb6e37c54024afdb80634e97bded8e1777812ab0f38cf0dc` |
| macOS ARM64 `scarp-0.0.7-alpha.2-aarch64-apple-darwin.tar.gz` | `08aa0b3d0f4b8458a016abce9d403a5cfd1bf19255954c276c79c033932d1ffe` |

Those digests apply **only** to [the published v0.0.7-alpha.2 artifacts](https://github.com/scarp-lang/scarp/releases/tag/v0.0.7-alpha.2). The hash matching is an integrity check, not a guarantee that experimental software is production-ready. If a hash fails to match, **stop**.

## Check your installed interpreter

Extract the verified archive to a directory you control and invoke its own binary, not another Scarp executable already on your `PATH`:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

The printed version should agree with the archive you actually downloaded. For a verified v0.0.7-alpha.2 project, `scarp exec` selects a valid project manifest, then `src/main.srp`, then `main.srp` when no manifest is present; malformed manifests are an error. From the appropriate project directory, with the extracted executable accessible:

~~~sh
scarp exec
~~~

Read the [current reference](/reference/current) and [current release guide](/guide/alpha7-first) for current language behavior and limits.

> Older release documents are retained as historical evidence with their original tagged compiler outputs, not as current installation recommendations.
