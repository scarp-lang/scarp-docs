# Alpha.14 — Rust editor cache और checked ELF64 API

<!-- scarp-cli-release: v0.0.6-alpha.14 -->
<!-- scarp-current-source: 43627b74af5fccccc5e233e98207413983ebafc1 -->

ये सिर्फ **Rust compiler embedding APIs** हैं; Scarp की नई `.srp` functions या CLI subcommands नहीं। [प्रकाशित रिलीज़](/hi/releases/v0.0.6-alpha.14)।

## Editor cache की पाँच quotas बदलें

`EditorCompilationCache::set_limits(EditorCacheLimits)` चलते cache की limits बदलता है। `EditorCacheLimits` में `graphs: CacheLimits` के entry count और logical source bytes, फिर retained index items, UTF-8 name bytes और line records शामिल हैं। पाँचों limits पूरी होने तक सबसे पुरानी entries हटती हैं। जो entry quota में नहीं समाती, उसका caching bypass होता है। `limits()` वर्तमान values और `stats()` entries, bytes, index items, names, lines, hits, misses, bypasses एवं evictions बताता है। `clear()` cache-owned results हटाता है, cumulative counters नहीं।

ये **पूरी process RAM की सीमा या secure deletion** नहीं हैं। Caller अपने `Arc` programs तथा पुराने editor snapshots रख सकता है। Editor में हर graph के नए source revisions और host workspace generation के साथ `EditorCompilationCache::analyze_loaded` चलाएँ। Diagnostics या navigation दिखाने से पहले `EditorAnalysis::into_current` द्वारा stale generation अस्वीकार करें। Cache उपयोग source/import की सामान्य validation नहीं हटाता।

[असली implementation](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/src/modules/cache/editor.rs) · [cache tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/editor_compilation_cache.rs) · [diamond tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/editor_diamond_differential.rs) · [पुराने alpha.13 APIs](/hi/tooling/editor-caches-alpha13)।

## सीमित checked ELF64 integer emitter

Rust host `scarp::native_object::emit_elf64_checked_integer_kernel` API बुला सकता है। इसका अलग `scarp_checked_scalar_kernel` symbol प्रयोगात्मक Linux x86-64 System V ABI उपयोग करता है:

| Field | अर्थ |
| --- | --- |
| `value: i64` | सफलता में आखिरी integer binding, असफलता में zero |
| `status: u32` | `0` सफलता; `1` signed overflow; `2` zero divisor |
| `span_id: u32` | सफलता में `0`, असफलता पर Rust `failure_spans` index |

Error spans मूल code के half-open **UTF-8 byte offsets** हैं, characters की positions नहीं। Division शून्य की ओर truncate और remainder dividend का sign रखता है। केवल सीमित linear immutable integer bindings में literals, पिछले bindings, groups, bitwise और checked `+`, `-`, `*`, unary `-`, `/`, `%` हैं। Branches, loops, functions, output, shifts, modules समर्थित नहीं हैं। पहला error बाकी calculation रोकता है। यह सामान्य native compiler नहीं है; `scarp compile` CLI अभी नहीं है।

[आधिकारिक ELF64 contract](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/docs/native-elf64.md) · [checked ABI tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/native_object_checked.rs) · [pattern diagnostics tests](https://github.com/scarp-lang/scarp/blob/43627b74af5fccccc5e233e98207413983ebafc1/tests/pattern_separator_diagnostics.rs)।
