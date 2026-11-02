# Version compatibility

The language is **prerelease and evolving**. Use the exact executable version matching the tutorial, not a mix of snippets taken from older release notes.

| Version | Distinguishing features |
| --- | --- |
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

**Newest published prerelease:** [v0.0.5-alpha.3](/releases/v0.0.5-alpha.3), November 2, 2026, source commit `7715c28df09c7703b39e14fddb963275b25df476`. It adds Scarp-first `exec` / `verify` / `inspect` / offline `diagnose` along with bounded Unicode text construction. Older `run`, `check`, `tokens`, `modules` still work. **The alpha.1-to-alpha.2 compatibility gate does not prove automatic compatibility with alpha.3.** The newer release guide includes four independent compiler-backed programs.

## Source migration

Some early Scarp examples used `let`, `let mut`, and `println`; current v0.0.5-alpha.1 uses `bind`, `var`, and `print` while retaining `println` as an alias. Do not assume a snippet written for one prerelease runs unchanged on another. Refer to the compiler's [syntax migration guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/syntax-migration.md).

## Avoiding documentation drift

This site documents shipped syntax for the named prerelease. A pull request, proposal, or development branch may document an interesting future capability, but it must not be promoted into the published reference until executable tests and a release verify it. Track [feature status](/reference/status) and the compiler [changelog](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/CHANGELOG.md).
