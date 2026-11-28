# Install the latest published Scarp

<!-- scarp-cli-release: v0.0.7-alpha.4 -->

**Official download center:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/).

As of November 28, 2026, the latest verified published compiler is **[Scarp v0.0.7-alpha.4](/releases/v0.0.7-alpha.4)**, an experimental interpreter prerelease. For the newest available version, including future prereleases, use the official Downloads website rather than the archived installation pages.

## Choose your platform

| Operating system | Permanent latest-version download | Available architecture |
| --- | --- | --- |
| Windows | [Latest Scarp for Windows](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Latest Scarp for Linux](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [Latest Scarp for macOS](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

The permanent links check for the newest **published** Scarp release (including prereleases), require JavaScript, and open a platform archive if one is available. Windows ARM64, Linux ARM64 and Intel macOS are **not** currently advertised as binary targets.

## Verify the download before running it

After selecting the download, confirm the archive's **actual version** on the [official downloads page](https://scarp-lang.github.io/downloads/). Verify its SHA-256 against the checksum posted for **that exact version** before extraction or execution. Never assume the v0.0.7-alpha.4 checksum below is valid for a newer archive.

| Verified v0.0.7-alpha.4 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.7-alpha.4-x86_64-pc-windows-msvc.zip` | `65df381abfe163cfc351b5929ae0b5f560d7f50246239c274e9c61c714b1fb88` |
| Linux x64 `scarp-0.0.7-alpha.4-x86_64-unknown-linux-gnu.tar.gz` | `51ad72899f92ca53ebf54245c7cceee39be661f3503bae08d5049ca7751814de` |
| macOS ARM64 `scarp-0.0.7-alpha.4-aarch64-apple-darwin.tar.gz` | `103a4b795cbeeadd703b1b86334415ecfc10da77773148bde3068875f278c54f` |

Those digests apply **only** to [the published v0.0.7-alpha.4 artifacts](https://github.com/scarp-lang/scarp/releases/tag/v0.0.7-alpha.4). The hash matching is an integrity check, not a guarantee that experimental software is production-ready. If a hash fails to match, **stop**.

## Check your installed interpreter

Extract the verified archive to a directory you control and invoke its own binary, not another Scarp executable already on your `PATH`:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

The printed version should agree with the archive you actually downloaded. For a verified v0.0.7-alpha.4 project, `scarp exec` selects a valid project manifest, then `src/main.srp`, then `main.srp` when no manifest is present; malformed manifests are an error. From the appropriate project directory, with the extracted executable accessible:

~~~sh
scarp exec
~~~

Read the [current reference](/reference/current) and [current release guide](/guide/alpha7-first) for current language behavior and limits.

> Older release documents are retained as historical evidence with their original tagged compiler outputs, not as current installation recommendations.
