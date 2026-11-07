# Version compatibility

For an evidence-backed inventory of alpha.1 through alpha.6 features, consult the [published feature status](/reference/status). For specific commands, the [interactive version-aware Command Finder](/tooling/command-finder) shows shipped actions and unavailable features for each published compiler.

The language is **prerelease and evolving**. Use the exact executable version matching the tutorial, not a mix of snippets taken from older release notes.

| Version | Distinguishing features |
| --- | --- |
| **[v0.0.6-alpha.3](/releases/v0.0.6-alpha.3)** | **Current published prerelease (Nov 7):** deterministic Top-K scores, temperature softmax and private scalar-IR verification; no new native CLI |
| **[v0.0.6-alpha.2](/releases/v0.0.6-alpha.2)** | **Previous published prerelease (Nov 6):** optional bounded Rust embedding cache and dependency invalidation APIs; no new Scarp CLI commands or syntax |
| **v0.0.6-alpha.1** | **Earlier published prerelease (Nov 5):** static symbols/references inspection, schema-v1 navigation JSON, pure `rms(vector)`; [release guide](/releases/v0.0.6-alpha.1) and [verified project tutorial](/tutorials/project-symbol-navigation-alpha6) |
| **v0.0.5-alpha.5** | Previous prerelease (Nov 4): explicit project module inspection and experimental Rust-only scalar C11 emitter; [release guide](/releases/v0.0.5-alpha.5) |
| **v0.0.5-alpha.4** | Published Nov 3: new create/verify DIRECTORY/launch project workflow; [release guide](/releases/v0.0.5-alpha.4) |
| **v0.0.5-alpha.3** | **Historical prerelease (Nov 2):** Scarp-first `exec`/static `verify`/`inspect`, offline `diagnose`, bounded text construction; [four verified examples](/releases/v0.0.5-alpha.3) |
| **v0.0.5-alpha.2** | **Earlier published prerelease (Nov 2):** typed declarations, integer bit operations, Unicode queries, checked conversions, integer collections, vector statistics, source-module inspection; [verified release guide](/releases/v0.0.5-alpha.2) |
| **v0.0.5-alpha.1** | Relative source modules, public functions and scalar constants; current main-reference baseline |
| v0.0.4-alpha.4 | Immutable numerical tiles and matrix operations; **no source imports** |
| v0.0.4-alpha.2 | Numerical vectors and related kernels |
| v0.0.4-alpha.1 | Finite binary64 floating-point values |
| v0.0.3-beta.3 | Typed `funcra` functions, contracts and call budgets; **no floats** |
| v0.0.3-beta.2 | Newer `bind`/`var` and multi-output forms, but **no functions** |
| v0.0.2 | Variables, scopes, booleans and decisions |
| v0.0.1 | Early interpreter and checked integer output |

Exact intermediate feature staging and archive details are recorded in the [compiler's getting-started guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/getting-started.md) and [releases](https://github.com/scarp-lang/scarp/releases).

## Verified alpha.1 → alpha.2 migration gate

The [compiler-tested upgrade readiness guide](/reference/upgrade-readiness) re-runs **all 11 unchanged alpha.1 example programs** using the exact published alpha.2 interpreter. GitHub Actions compares their stdout byte-for-byte and checks that `check` remains silent. This is focused evidence for the example set—not a general backward-compatibility promise, and it does not change the pinned alpha.1 main-reference baseline.

## Published alpha.3 compiler and command migration

**Historical published prerelease:** [v0.0.5-alpha.3](/releases/v0.0.5-alpha.3), November 2, 2026, source commit `7715c28df09c7703b39e14fddb963275b25df476`. It adds Scarp-first `exec` / `verify` / `inspect` / offline `diagnose` along with bounded Unicode text construction. Older `run`, `check`, `tokens`, `modules` still work. **The alpha.1-to-alpha.2 compatibility gate does not prove automatic compatibility with alpha.3.** The newer release guide includes four independent compiler-backed programs.

## Historical alpha.5 compatibility boundary

The [v0.0.5-alpha.5 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) is source-pinned to `2eeed0aa52ccb59523307841ad8ffbd83f8911a8`. Alpha.5 introduces `scarp inspect modules --json DIRECTORY`, unavailable in published alpha.4. It also introduces a restricted **Rust embedding C11 emitter**, not a `scarp compile` CLI. See the [alpha.5 CLI reference](/tooling/cli-alpha5), [C11 API limits](/reference/c11-backend-alpha5), and [platform installation](/guide/installation-alpha5).

This does not prove that **every** old program works unchanged on the latest prerelease. Preserve tagged test fixtures and check exact versions when diagnosing a regression.

## Published alpha.6 symbol/CLI compatibility boundary

The earlier alpha.6 language/CLI milestone is [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1), built from source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`. It adds `scarp inspect symbols --json` and `scarp inspect references --json` for an explicit source file or project directory, plus `rms(vector)`. The alpha.1 symbol inventory uses snapshot-local IDs: it is **not** an LSP, rename feature or user-facing incremental compilation service. The subsequent alpha.2 adds separate Rust-only caching APIs. See the [alpha.6 CLI](/tooling/cli-alpha6), [RMS guide](/language/rms-alpha6) and [end-to-end project lab](/tutorials/project-symbol-navigation-alpha6).

The [seven-stage learning path](/guide/learning-path) names the **exact release required for each historical runnable lesson**. New published features do **not** imply universal binary/source compatibility across versions. There is no native `.srp` executable compiler CLI or general tensor runtime.

## Latest alpha.2 Rust cache scope

The [November 6 prerelease](/releases/v0.0.6-alpha.2) adds opt-in, bounded Rust-only caches for whole-graph resolution, tokens and parsed syntax, plus conservative dependency invalidation and source eviction. **These APIs are not new Scarp language constructs or CLI commands.** The released alpha.1 tutorials remain pinned to their original source tags. A cache hit does not override import, syntax, type or resource checks.

## Source migration

Some early Scarp examples used `let`, `let mut`, and `println`; current v0.0.5-alpha.1 uses `bind`, `var`, and `print` while retaining `println` as an alias. Do not assume a snippet written for one prerelease runs unchanged on another. Refer to the compiler's [syntax migration guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/syntax-migration.md).

## Avoiding documentation drift

This site documents shipped syntax for the named prerelease. A pull request, proposal, or development branch may document an interesting future capability, but it must not be promoted into the published reference until executable tests and a release verify it. Track [feature status](/reference/status) and the compiler [changelog](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/CHANGELOG.md).
