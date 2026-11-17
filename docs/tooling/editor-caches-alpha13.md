# Alpha.13: Rust editor and revision-cache APIs

<!-- scarp-cli-release: v0.0.6-alpha.13 -->
<!-- scarp-current-source: e755fda37cdaeed29434e848cb5dd41f2f2e7eb2 -->

These **v0.0.6-alpha.13** APIs are for Rust tooling and editor hosts embedding Scarp. They are not `.srp` expressions or new compiler CLI subcommands.

## Logical retention and eviction

`CompilationCache::set_limits(CacheLimits)` updates retained-entry and logical source-byte quotas. Shrinking limits evicts oldest entries first. Zero quotas disable new retention. `limits()` returns the configuration; `stats()` provides logical retained counts and cumulative evictions. **Neither a heap-size bound nor secure erasure is implied.** A caller-owned `Arc<ModuleProgram>` can remain valid after eviction.

- `evict_identity_revision(identity, revision)` removes an exact revision.
- `evict_identity_revisions_before(identity, minimum)` removes revisions strictly less than the watermark.
- `evict_identity_revisions_at_or_after(identity, ceiling)` removes at or above an inclusive ceiling.
- `evict_identity_revisions_in_range(identity, start, end)` uses a half-open interval `start <= revision < end`; an empty interval does nothing and an inverted interval is rejected.

Use trusted resolved loader identities, never display names or unstable SourceIds. Each compilation continues to validate current sources, imports, revisions and compiler limits. Eviction does not authorize skipping validation.

## Reject stale editor diagnostics

Capture the host workspace generation **before** loading the graph, and capture document revisions alongside the source bytes. `EditorCompilationCache::analyze_loaded(generation, graph, limits, constants)` associates its result with that generation. Before showing diagnostics, definitions or references, check `EditorAnalysis::into_current(current_generation)`; reject older results after import rebinding even when document revisions happen to match. The per-document revision checks in `EditorSnapshot` remain independently required.

## Exact-source Rust regression evidence


[Cache quotas](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_live_quotas.rs) · [Range eviction](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_revision_range.rs) · [Ceiling](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_revision_ceiling.rs) · [Editor generations](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/editor_source_revisions.rs) · [Option/Result payload tests](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/source_propagation.rs).

Use the immutable tagged compiler source, not a floating main branch, to reproduce these tests.
