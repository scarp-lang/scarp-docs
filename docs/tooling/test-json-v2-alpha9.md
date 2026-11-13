# Project test JSON v2 diagnostics (v0.0.6-alpha.9)

<!-- scarp-cli-release: v0.0.6-alpha.9 -->

**Published in [Scarp v0.0.6-alpha.9](/releases/v0.0.6-alpha.9).** The `scarp test` command was introduced in [alpha.8](/tooling/project-alpha8). Alpha.9 adds an **opt-in structured failure report**, without changing the default text report or original `--json` schema version 1.

## Usage

~~~sh
scarp test --json=v2 calculator
scarp test --json=v2 --list calculator
scarp test --json=v2 --require-tests --filter math calculator
~~~

Use **only one JSON option** per command. `--list` discovers without executing test source. Without `--list`, tests run as ordinary Scarp code and should come from trusted projects.

## JSON v2 structure

A successful report contains `schema_version: 2`, a `mode` of `run` or `list`, the discovered/passed/failed counts, and an ordered `tests` array. For a failed test, the entry provides `phase` (`compile`, `fixture` or `runtime`) and a `diagnostic` object instead of the v1 `error` string. The diagnostic contains original error code (when available), message, source location, related locations and help. Paths are relative to the project root and source positions use half-open UTF-8 byte spans plus one-based Unicode-scalar line/column positions when present.

Scarp deliberately omits test program stdout and source excerpts from this report. **Do not treat it as a secret-scrubbing format:** developer-provided diagnostic messages, such as an assertion message, can still contain sensitive text. Setup failures and invalid arguments remain on stderr rather than producing a test report. Nonempty failing suites return exit code 1, while invalid usage returns 2.

## Upstream verification

[Compiler-owned project testing contract](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/docs/project-testing.md) · [Release notes](/releases/v0.0.6-alpha.9) · [Alpha.8 calculator with tests](/tutorials/calculator-alpha8). Earlier compiler binaries do not support `--json=v2`.
