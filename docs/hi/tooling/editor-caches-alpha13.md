# Alpha.13: Rust editor और revision cache API

<!-- scarp-cli-release: v0.0.6-alpha.13 -->
<!-- scarp-current-source: e755fda37cdaeed29434e848cb5dd41f2f2e7eb2 -->

यह **v0.0.6-alpha.13** के Rust compiler को embed करने वाले editor और tooling maintainers के लिए है। ये APIs `.srp` source expressions नहीं हैं और नया CLI subcommand भी नहीं है।:

## Cache की logical limits

`CompilationCache::set_limits(CacheLimits)` नयी entry count और logical retained source-byte limits लागू करता है। Limits घटने पर सबसे पुरानी entries पहले हटती हैं। Zero quota नया retention बंद कर सकता है। `limits()` वर्तमान quota देता है और `stats()` logical retained data और evictions बताता है। यह process RAM limit या secure erasure नहीं है। पहले दिया हुआ `Arc<ModuleProgram>` eviction के बाद भी valid हो सकता है।

- `evict_identity_revision(identity, revision)`: एक exact revision हटाता है।
- `evict_identity_revisions_before(identity, minimum)`: `revision < minimum` हटाता है।
- `evict_identity_revisions_at_or_after(identity, ceiling)`: `revision >= ceiling` हटाता है।
- `evict_identity_revisions_in_range(identity, start, end)`: `start <= revision < end` हटाता है। खाली interval no-op है; उल्टा interval अस्वीकार होता है।

Trusted resolved loader identity का उपयोग करें, display name या unstable SourceId का नहीं। नया source या बदलते imports होने पर compiler की सामान्य जाँच बची रहती है। Cache eviction ताजा validation को bypass करने की अनुमति नहीं देता।

## Editor की stale diagnostic रोकें

Source load होने से **पहले** workspace generation capture करें; graph के source bytes के साथ source revisions भी capture करें। `EditorCompilationCache::analyze_loaded(generation, graph, limits, constants)` analysis को generation से जोड़ता है। UI में diagnostics, definitions और references publish करने से पहले `EditorAnalysis::into_current(current_generation)` जाँचें। Import rebind होने के बाद समान source revision numbers होने पर भी पुरानी generation का result reject करें। `EditorSnapshot` की प्रति-file revision checks भी बनी रहती हैं।

## Compiler tests का प्रमाण


[Cache quotas](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_live_quotas.rs) · [Range eviction](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_revision_range.rs) · [Ceiling](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/semantic_cache_revision_ceiling.rs) · [Editor generations](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/editor_source_revisions.rs) · [Option/Result payload tests](https://github.com/scarp-lang/scarp/blob/e755fda37cdaeed29434e848cb5dd41f2f2e7eb2/tests/source_propagation.rs).

इस contract को recreate करने के लिए compiler के अपरिवर्तित tag से build करें।
