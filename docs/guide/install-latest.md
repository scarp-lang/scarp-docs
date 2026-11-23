# Install the latest published Scarp

<!-- scarp-cli-release: v0.0.6-alpha.18 -->

**Official download center:** [scarp-lang.github.io/downloads](https://scarp-lang.github.io/downloads/).

As of November 23, 2026, the latest verified published compiler is **[Scarp v0.0.6-alpha.18](/releases/v0.0.6-alpha.18)**, an experimental interpreter prerelease. For the newest available version, including future prereleases, use the official Downloads website rather than the archived installation pages.

## Choose your platform

| Operating system | Permanent latest-version download | Available architecture |
| --- | --- | --- |
| Windows | [Latest Scarp for Windows](https://scarp-lang.github.io/downloads/windows/latest) | x64 / MSVC |
| Linux | [Latest Scarp for Linux](https://scarp-lang.github.io/downloads/linux/latest) | x64 / GNU (glibc) |
| macOS | [Latest Scarp for macOS](https://scarp-lang.github.io/downloads/macos/latest) | ARM64 / Apple Silicon |

The permanent links check for the newest **published** Scarp release (including prereleases), require JavaScript, and open a platform archive if one is available. Windows ARM64, Linux ARM64 and Intel macOS are **not** currently advertised as binary targets.

## Verify the download before running it

After selecting the download, confirm the archive's **actual version** on the [official downloads page](https://scarp-lang.github.io/downloads/). Verify its SHA-256 against the checksum posted for **that exact version** before extraction or execution. Never assume the alpha.18 checksum below is valid for a newer archive.

| Verified alpha.18 archive | SHA-256 |
| --- | --- |
| Windows x64 `scarp-0.0.6-alpha.18-x86_64-pc-windows-msvc.zip` | `1dbd8e9f6dbb3e727fb765b5a1bf184f8574c8b139289269b65a7d889d60e6b0` |
| Linux x64 `scarp-0.0.6-alpha.18-x86_64-unknown-linux-gnu.tar.gz` | `175fc419b1469e80dbf3cd7ccee273eb573a9113e27467801ef7095c064b289f` |
| macOS ARM64 `scarp-0.0.6-alpha.18-aarch64-apple-darwin.tar.gz` | `30aed1c56fc666f86dca6c08234d8ac17d9f5ee513a4270d7a65f80544dc2c52` |

Those digests apply **only** to [the published alpha.18 artifacts](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.18). The hash matching is an integrity check, not a guarantee that experimental software is production-ready. If a hash fails to match, **stop**.

## Check your installed interpreter

Extract the verified archive to a directory you control and invoke its own binary, not another Scarp executable already on your `PATH`:

~~~powershell
.\scarp.exe version
~~~

~~~sh
./scarp version
~~~

The printed version should agree with the archive you actually downloaded. For a verified alpha.18 project, `scarp exec` selects a valid project manifest, then `src/main.srp`, then `main.srp` when no manifest is present; malformed manifests are an error. From the appropriate project directory, with the extracted executable accessible:

~~~sh
scarp exec
~~~

Read the [alpha.18 Exec and Lifetime guide](/guide/exec-and-lifetime-alpha18) for verified behavior, the [feature status](/reference/status) for limitations and the [learning path](/guide/learning-path) for next steps.

> Older release documents are retained as historical evidence with their original tagged compiler outputs, not as current installation recommendations.
