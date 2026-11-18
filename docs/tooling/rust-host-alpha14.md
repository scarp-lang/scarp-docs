# Alpha.14 — Rust editor cache and checked ELF64 API

<!-- scarp-cli-release: v0.0.6-alpha.14 -->
<!-- scarp-current-source: 43627b74af5fccccc5e233e98207413983ebafc1 -->

These are **Rust embedding APIs**, not new Scarp source built-ins, stable ABI guarantees or CLI subcommands. [Release notes](/releases/v0.0.6-alpha.14).

## Change five editor cache quotas

`EditorCompilationCache::set_limits(EditorCacheLimits)` updates a live cache. `EditorCacheLimits` contains the graph-entry and logical source-byte limits under `graphs: CacheLimits`, plus retained index items, UTF-8 name bytes and line records. Oldest entries are evicted first until all five constraints hold. Oversized entries are bypassed, never partially cached. `limits()` reads quotas; `stats()` returns entries, bytes, index items, names, lines, hits, misses, bypasses and evictions. `clear()` removes cache-owned results without resetting cumulative counters.

These are not process-memory quotas or secure deletion guarantees: callers can keep independent `Arc` programs and previously issued editor snapshots. For safe editor updates, supply fresh source revisions and the host workspace generation to `EditorCompilationCache::analyze_loaded`; call `EditorAnalysis::into_current` before showing diagnostics or navigation, rejecting stale generations. Cache reuse never bypasses source/import validation.

[Upstream implementation](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/src/modules/cache/editor.rs) · [Exact cache tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/editor_compilation_cache.rs) · [Diamond graph tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/editor_diamond_differential.rs) · [Alpha.13 historical APIs](/tooling/editor-caches-alpha13).

## Bounded checked ELF64 integer emitter

Rust hosts may call `scarp::native_object::emit_elf64_checked_integer_kernel`. Its **separate** `scarp_checked_scalar_kernel` symbol uses the experimental no-argument Linux x86-64 System V return layout:

| Field | Meaning |
| --- | --- |
| `value: i64` | Last integer binding on success; zero on failure |
| `status: u32` | `0` success, `1` signed overflow, `2` division by zero |
| `span_id: u32` | `0` on success; index into Rust `failure_spans` on failure |

Failure spans use half-open **UTF-8 byte** source offsets, not character indices. Division truncates toward zero and the remainder has the dividend's sign. Supported expressions are bounded linear immutable integer bindings, earlier-binding references, literal/group/bitwise operations and checked `+`, `-`, `*`, unary `-`, `/`, `%`. Branches, loops, functions, output, shifts and modules are not accepted. The emitter does not produce runnable general programs or add a `scarp compile` CLI. Output and failure terminate at the first error.

[Compiler ELF64 contract](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/docs/native-elf64.md) · [Checked ABI tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/native_object_checked.rs) · [Pattern diagnostics tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/pattern_separator_diagnostics.rs).
