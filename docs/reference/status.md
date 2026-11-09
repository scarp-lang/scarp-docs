# Scarp feature and release status

<!-- scarp-release-status: v0.0.5-alpha.5 -->
<!-- scarp-main-reference-baseline: v0.0.5-alpha.1 -->

**Latest published compiler: [v0.0.6-alpha.5](/releases/v0.0.6-alpha.5), November 9, 2026.** The general language-reference chapters remain **intentionally pinned to v0.0.5-alpha.1**. Separately verified alpha.2, alpha.3, alpha.4, alpha.5 and alpha.6 features are documented in release-specific guides. **All versions are experimental prereleases**, without guaranteed language compatibility.

For current downloads use the [published alpha.5 archives and checksum pairs](/releases/v0.0.6-alpha.5). The [alpha.1 installation walkthrough](/guide/installation-alpha6) stays pinned to its tagged source. For the older alpha.5 release, start with [published alpha.5 installation](/guide/installation-alpha5) and [alpha.5 CLI](/tooling/cli-alpha5). The earlier [alpha.4 project quickstart](/guide/quickstart-alpha4) remains useful for the unchanged creation workflow. The [alpha.3 CLI reference](/tooling/cli) remains useful for individual file commands. Use the [version compatibility guide](/reference/compatibility) before migrating existing projects.

## Published compiler evidence by version

| Published release | Source commit | Conformance scope | Evidence |
| --- | --- | --- | --- |
| **[v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1)** (Nov 1, 2026) | `afe8b5380c9d6c4774162e51c6c9bc8b90901671` | **11** original runnable examples form the main-reference baseline | [Evidence](/reference/evidence) |
| **[v0.0.5-alpha.2](/releases/v0.0.5-alpha.2)** (Nov 2, 2026) | `e4db8e191cd7ea623123cae7348450ca6c95b170` | **12** tagged runnable examples in a separate compiler-backed suite | [Alpha.2 guide](/releases/v0.0.5-alpha.2) |
| **[v0.0.5-alpha.3](/releases/v0.0.5-alpha.3)** (Nov 2, 2026) | `7715c28df09c7703b39e14fddb963275b25df476` | **4** complete tagged programs, a JSON diagnostic and CLI smoke tests | [Alpha.3 guide](/releases/v0.0.5-alpha.3) |
| **[v0.0.5-alpha.4](/releases/v0.0.5-alpha.4)** (Nov 3, 2026) | `79141329176f5dce51457e90a6652902f6432135` | Compiler-generated project manifest, source and stdout verified by new alpha.4 lifecycle tests | [Alpha.4 guide](/releases/v0.0.5-alpha.4) |
| **[v0.0.5-alpha.5](/releases/v0.0.5-alpha.5)** (Nov 4, 2026) | `2eeed0aa52ccb59523307841ad8ffbd83f8911a8` | **1** release-pinned scalar-repeat program plus project-directory module inspection and Rust-only C11 backend | [Alpha.5 guide](/releases/v0.0.5-alpha.5) |
| **[v0.0.6-alpha.1](/releases/v0.0.6-alpha.1)** (Nov 5, 2026) | `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` | **2** published executable examples, source-reference JSON schemas, and static symbol navigation with checked RMS calculations | [Alpha.6 guide](/releases/v0.0.6-alpha.1) |
| **[v0.0.6-alpha.2](/releases/v0.0.6-alpha.2)** (Nov 6, 2026) | `398b8ff705154a02423fe458ce3a427401e81e31` | Optional bounded Rust caching and dependency invalidation APIs; **no new Scarp CLI commands or syntax** | [Alpha.2 cache guide](/releases/v0.0.6-alpha.2) |
| **[v0.0.6-alpha.3](/releases/v0.0.6-alpha.3)** (Nov 7, 2026) | `ceff07d9014f466974e0c9e02fc5d23573f55777` | `topk`, `topk_values`, `softmax_temp`, `logsoftmax_temp`; verified private scalar IR, **no new native CLI** | [Alpha.3 release](/releases/v0.0.6-alpha.3) |
| **[v0.0.6-alpha.4](/releases/v0.0.6-alpha.4)** (Nov 8, 2026) | `f04be0758cbce405ddcdb229699b0ff83c09d207` | Sampled calculus, cosine similarity and restricted Rust ELF64 object API; **no general native compiler** | [Alpha.4 release](/releases/v0.0.6-alpha.4) |
| **[v0.0.6-alpha.5](/releases/v0.0.6-alpha.5)** (Nov 9, 2026) | `205e92f166f186c3905e5880d41c31717b697b8e` | Deterministic Top-P, centered Pearson correlation and limited Rust ELF64 object API; **no general native compiler** | [Alpha.5 release](/releases/v0.0.6-alpha.5) |

The numbers count **examples in their individual release-specific suites**; they are not a count of all language features, nor a proof that every existing program works in every later compiler. The [alpha.1 → alpha.2 upgrade test](/reference/upgrade-readiness) separately re-runs 11 original programs unchanged with alpha.2; it does **not** establish general alpha.3 backward compatibility.

## Main reference: shipped in v0.0.5-alpha.1

The following table describes the **alpha.1 baseline only**, not a complete inventory of the current alpha.6 release:

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

## Independently verified in published alpha.4

**New project workflow:** `scarp create DIRECTORY` scaffolds a new project, `scarp verify DIRECTORY` statically validates its manifest and contained entrypoint, and `scarp launch DIRECTORY` executes that entry through the interpreter. The tagged source commit is `79141329176f5dce51457e90a6652902f6432135`. The [alpha.4 quickstart](/guide/quickstart-alpha4) and [published release guide](/releases/v0.0.5-alpha.4) reproduce the exact generated `Scarp.project`, `src/main.srp` and stdout. A dedicated CI suite builds the tagged compiler and tests creation, refusal to overwrite, static verification, interpreter launch, invalid manifests and runtime-only failures. This is **project scaffolding and execution, not native compilation or package management**.

## Independently verified in published alpha.5

**Project directory inspection:** `scarp inspect modules --json DIRECTORY` and the compatible `scarp modules --json DIRECTORY` read an explicit Scarp.project manifest and output **schema-version-1** static module inventory, with no ordinary statement execution. Alpha.4 supported file inspection but not directory inspection. See [alpha.5 CLI](/tooling/cli-alpha5) and [release evidence](/releases/v0.0.5-alpha.5).

**Experimental Rust-only C11 API:** `scarp::c_backend::emit_c` / `emit_program` emit C source text for a restricted scalar subset; they do not expose any native compilation CLI. Unsupported backend forms report `E0049`. See the [C11 limitations](/reference/c11-backend-alpha5).

The published `native_scalar_repeat.srp` and byte-exact stdout are copied into a dedicated fixture and tested in the alpha.5 tagged compiler CI job. **The native C subset is smaller than the interpreter's language support.**

## Still unavailable in the latest published alpha.2

These capabilities are **not shipped** by the published compiler, even though design proposals or newer development work may exist:

- Native compilation of `.srp` into an executable; `scarp build` and `scarp compile` are not available CLI commands.
- Package registry/manager, general-purpose standard library, workspace discovery, or project-mode arbitrary application argument forwarding.
- User-defined classes, structs, traits, generic functions or closures as general language features.
- Arbitrary tensors and general-purpose heterogeneous collections; alpha.2 **does** include the distinct, bounded `integers` collection type.
- Network imports, wildcard imports, module re-exports and arbitrary runtime module globals.
- A self-hosted compiler, stable language specification or guaranteed cross-prerelease compatibility.

**Release boundary:** A compiler feature merged into `main` after the tagged release is **development-only** until a subsequent release independently verifies it. Do not infer support from a proposal or an open pull request.

## Keeping this reference accurate

All new rows need the exact **release tag, source commit, runnable example or test, and a versioned guide**. The English/Hindi tables are checked against the pinned release manifests by TypeScript validation; the suites also run real tagged interpreters in CI. See [evidence policy](/reference/evidence) and [the compiler release list](https://github.com/scarp-lang/scarp/releases).
