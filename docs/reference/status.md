# Feature status

**Reference baseline:** published Scarp **v0.0.5-alpha.1** (released 2026-11-01), verified against the [official compiler repository](https://github.com/scarp-lang/scarp). This is a prerelease: **no language capability is designated stable** as a compatibility guarantee.

**Newer published prerelease:** [v0.0.5-alpha.2](/releases/v0.0.5-alpha.2) was published **November 2, 2026** from compiler commit `e4db8e191cd7ea623123cae7348450ca6c95b170`. Its new language features and inspection commands are documented in the **five-program release guide** and the [four-program collections tutorial](/tutorials/alpha2-collections-and-learning), with a separate alpha.2 compiler conformance job checking **nine** published source/output cases. The table below deliberately remains the v0.0.5-alpha.1 baseline until all older references and 11 original fixtures undergo a reviewed version migration.

We use these terms consistently:

- **Shipped (experimental):** present in the published prerelease and exercised in compiler examples or tests.
- **Development only:** present on a branch or newer `main` but not verified in the named release. This site does not document development-only syntax as shipped.
- **Planned / unavailable:** a proposal or roadmap item, not implemented in the baseline compiler.

## Shipped in the v0.0.5-alpha.1 prerelease

| Area | Status | Evidence |
| --- | --- | --- |
| `bind` and `var`, shadowing, mutation | Shipped (experimental) | [variable guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/variables.md) |
| i64 checked arithmetic, finite f64, strings, booleans | Shipped (experimental) | [language reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md) |
| `if` / `elif` / `else`, `while`, `repeat` | Shipped (experimental) | [iteration tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/loops.rs) |
| `funcra`, defaults, contracts, purity, recursion | Shipped (experimental) | [function tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/functions.rs) |
| `print`, `println`, `write`, `eprint`, `ewrite` | Shipped (experimental) | [output reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/output.md) |
| Numerical vectors, tiles, numerical kernels | Shipped (experimental) | [vector reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md), [tiles](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md) |
| Relative source imports, `pub` functions/scalar constants | Shipped (experimental) | [module reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md) |
| `run`, `check`, `tokens`, help and version | Shipped (experimental) | [CLI reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/cli.md) |
| Runtime budgets and automatic value retirement | Shipped (experimental) | [budgets](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/budgets.md), [lifetimes](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/memory-lifetimes.md) |

## Unavailable or planned

| Area | Status |
| --- | --- |
| Native code generation / `.srp` executable compiler | Planned / unavailable |
| `scarp build`, `compile`, `exec`, `verify`, `inspect` | Unavailable as CLI commands |
| General-purpose standard library, package registry/manager | Planned / unavailable |
| User-defined classes, structures, traits, closures, generic functions | Planned / unavailable |
| General collection types, arbitrary tensors, mutable vector/tile indexing | Planned / unavailable |
| Network imports, wildcard imports, re-exports, runtime module globals | Unavailable |
| Explicit raw pointer and manual allocation language syntax | Unavailable |
| Self-hosted compiler and stable language compatibility guarantee | Planned / unavailable |

## How to update this status

When a feature lands, link its merged compiler implementation, tests, and the exact prerelease in which it shipped. Release-specific documentation must not silently inherit experimental proposals from a newer branch. The [compiler changelog](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/CHANGELOG.md) and [release list](https://github.com/scarp-lang/scarp/releases) provide version history.

## Evidence policy

The documentation project's [evidence and conformance page](/reference/evidence) explains how source examples and release documentation are pinned and checked. An accurate site build is not, by itself, proof that a snippet runs.
