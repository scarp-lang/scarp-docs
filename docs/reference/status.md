# Scarp feature and release status

<!-- scarp-release-status: v0.0.5-alpha.3 -->
<!-- scarp-main-reference-baseline: v0.0.5-alpha.1 -->

**Latest published compiler: [v0.0.5-alpha.3](/releases/v0.0.5-alpha.3), November 2, 2026.** The general language-reference chapters remain **intentionally pinned to v0.0.5-alpha.1**; separately verified alpha.2 and alpha.3 features are documented in their own release guides. **All versions are experimental prereleases.** No stable language-compatibility promise is implied.

Start with the [current alpha.3 quickstart](/guide/quickstart-alpha3) or the [current CLI reference](/tooling/cli) for new work. Use the [version compatibility guide](/reference/compatibility) before migrating existing projects.

## Published compiler evidence by version

| Published release | Source commit | Conformance scope | Evidence |
| --- | --- | --- | --- |
| **[v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1)** (Nov 1, 2026) | `afe8b5380c9d6c4774162e51c6c9bc8b90901671` | **11** original runnable examples form the main-reference baseline | [Evidence](/reference/evidence) |
| **[v0.0.5-alpha.2](/releases/v0.0.5-alpha.2)** (Nov 2, 2026) | `e4db8e191cd7ea623123cae7348450ca6c95b170` | **12** tagged runnable examples in a separate compiler-backed suite | [Alpha.2 guide](/releases/v0.0.5-alpha.2) |
| **[v0.0.5-alpha.3](/releases/v0.0.5-alpha.3)** (Nov 2, 2026) | `7715c28df09c7703b39e14fddb963275b25df476` | **4** complete tagged programs, a JSON diagnostic and CLI smoke tests | [Alpha.3 guide](/releases/v0.0.5-alpha.3) |

The numbers count **examples in their individual release-specific suites**; they are not a count of all language features, nor a proof that every existing program works in every later compiler. The [alpha.1 → alpha.2 upgrade test](/reference/upgrade-readiness) separately re-runs 11 original programs unchanged with alpha.2; it does **not** establish general alpha.3 backward compatibility.

## Main reference: shipped in v0.0.5-alpha.1

The following table describes the **alpha.1 baseline only**, not a complete inventory of the current alpha.3 release:

| Capability | Baseline evidence |
| --- | --- |
| `bind`, `var`, scopes, shadowing and mutation | [Tagged variable guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/variables.md) |
| Checked `integer`, finite `float`, `string`, `boolean` | [Tagged language reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md) |
| `if`, `elif`, `else`, `while`, `repeat` | [Tagged iteration tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/loops.rs) |
| Typed `funcra`, default arguments, contracts, purity and recursion | [Tagged function tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/functions.rs) |
| `print`, `println`, `write`, `eprint`, `ewrite` | [Tagged output reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/output.md) |
| Numerical vectors, tiles and numerical kernels | [Tagged vectors](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md) |
| Local relative source modules, public functions and scalar constants | [Tagged module reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md) |
| Historical `run`, `check`, `tokens`, help/version CLI | [Alpha.1 CLI archive](/tooling/cli-alpha1) |
| Runtime budgets and automatic value retirement | [Tagged budgets](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/budgets.md) |

## Independently demonstrated in published alpha.2

These **12 source programs** come from the published **[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** tag. They are executable, pinned and tested by the separate alpha.2 conformance job.

| Exact tagged source | Demonstrated capability | Tutorial |
| --- | --- | --- |
| [`bit_fields.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.srp) | Bit patterns, masks, and shifts | [Explanation](/releases/v0.0.5-alpha.2) |
| [`scalar_conversions.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/scalar_conversions.srp) | Checked explicit numeric conversion | [Explanation](/releases/v0.0.5-alpha.2) |
| [`typed_declarations.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/typed_declarations.srp) | Typed bindings and assignments | [Explanation](/releases/v0.0.5-alpha.2) |
| [`unicode_text.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/unicode_text.srp) | Unicode length and exact text queries | [Explanation](/releases/v0.0.5-alpha.2) |
| [`numerical_kernels.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/numerical_kernels.srp) | Numerical statistics and activations | [Explanation](/releases/v0.0.5-alpha.2) |
| [`integer_collections.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.srp) | Immutable integer collections | [Explanation](/tutorials/alpha2-collections-and-learning) |
| [`score_selection.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.srp) | Stable score selection | [Explanation](/tutorials/alpha2-collections-and-learning) |
| [`vector_probabilities.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.srp) | Vector probabilities | [Explanation](/tutorials/alpha2-collections-and-learning) |
| [`classification_training.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.srp) | Application-written loss gradient | [Explanation](/tutorials/alpha2-collections-and-learning) |
| [`constant_expressions.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/constant_expressions.srp) | Restricted module constants | [Explanation](/tutorials/alpha2-module-constants-and-inspection) |
| [`module_inspection.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/module_inspection.srp) | Static module inspection | [Explanation](/tutorials/alpha2-module-constants-and-inspection) |
| [`inspection_json.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.srp) | Schema-versioned module JSON | [Explanation](/tutorials/alpha2-module-constants-and-inspection) |

Module examples may require additional tagged files under `modules/`; follow the linked full tutorials. A single example demonstrates its own behavior, **not** a complete general-purpose collections or ML framework.

## Independently demonstrated in published alpha.3

These **4 source programs** are pinned to **[v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)** and executed in its own CI job.

| Exact tagged source | Demonstrated capability | Tutorial |
| --- | --- | --- |
| [`text_construction.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp) | Unicode text creation and repetition | [Explanation](/releases/v0.0.5-alpha.3) |
| [`float_refinement.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/float_refinement.srp) | Iterative finite-float refinement | [Explanation](/releases/v0.0.5-alpha.3) |
| [`collection_module.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/collection_module.srp) | Typed integer return from an imported module | [Explanation](/releases/v0.0.5-alpha.3) |
| [`coefficient_fit.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/coefficient_fit.srp) | Explicit coefficient fitting (not auto-differentiation) | [Explanation](/releases/v0.0.5-alpha.3) |

Alpha.3 also ships the **Scarp-first CLI**: `exec`, static-only `verify`, `inspect tokens`, `inspect ast`, `inspect modules`, `guide`, `version` and offline `diagnose --json`. The older `run`, `check`, `tokens` and `modules` commands remain for migration. **`verify` never executes ordinary runtime statements; legacy `check` may evaluate selected runtime paths.** The AST inspector is parser-only, with no stable JSON AST format. See the [published alpha.3 CLI reference](/tooling/cli).

## Still unavailable in the latest published alpha.3

These capabilities are **not shipped** by the published compiler, even though design proposals or newer development work may exist:

- Native compilation of `.srp` into an executable; `scarp build` and `scarp compile` are not available CLI commands.
- Package registry/manager, general-purpose standard library or project-mode application argument forwarding.
- User-defined classes, structs, traits, generic functions or closures as general language features.
- Arbitrary tensors and general-purpose heterogeneous collections; alpha.2 **does** include the distinct, bounded `integers` collection type.
- Network imports, wildcard imports, module re-exports and arbitrary runtime module globals.
- A self-hosted compiler, stable language specification or guaranteed cross-prerelease compatibility.

**Release boundary:** A compiler feature merged into `main` after the tagged release is **development-only** until a subsequent release independently verifies it. Do not infer support from a proposal or an open pull request.

## Keeping this reference accurate

All new rows need the exact **release tag, source commit, runnable example or test, and a versioned guide**. The English/Hindi tables are checked against the pinned release manifests by TypeScript validation; the suites also run real tagged interpreters in CI. See [evidence policy](/reference/evidence) and [the compiler release list](https://github.com/scarp-lang/scarp/releases).
