# Alpha.15 — Rust host सुरक्षा और सीमाएँ

<!-- scarp-cli-release: v0.0.6-alpha.15 -->
<!-- scarp-current-source: a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281 -->

इस पेज की सुविधाएँ **Rust embedding API** या interpreter सीमाएँ हैं, नए `scarp compile` CLI commands नहीं।

## CLI inspection limit

`inspect tokens`, `inspect ast` और legacy `tokens` नियमित UTF-8 source को केवल **1 MiB** तक पढ़ते हैं। Unicode characters नहीं, bytes गिने जाते हैं।

## String comparison work

समान UTF-8 byte length वाले strings की `==` और `!=` तुलना में हर शुरू हुए **64 bytes** का एक step लगता है। Runtime और constants दोनों का नियम एक है।

## Loader revisions

`EditorCompilationCache` के cache reuse से पहले source loader की revision, host द्वारा दी revision से मिलनी चाहिए। Mismatch पर `RevisionMismatch` आता है; `CachedCompileError`/`EditorCompileError` exhaustively match करने वालों को इसे संभालना चाहिए।

## Checked ELF64 shift kernels

`emit_elf64_checked_integer_kernel` सीमित immutable integer bindings से relocatable ELF64 object बनाता है। `<<`, `>>`, `>>>` में count 0–63 होना चाहिए। गलत count पर `status = 3` (`CHECKED_KERNEL_INVALID_SHIFT`) और पहले failing operator का half-open UTF-8 byte span मिलता है। यह सामान्य native executable या स्थिर ABI नहीं।

~~~scarp
bind bits = -8;
bind count = 2;
bind result = (bits >> count) ^ (bits >>> count);
~~~

बना हुआ symbol `scarp_checked_scalar_kernel` कोई argument नहीं लेता। वह SysV AMD64 C struct लौटाता है, जिसमें क्रम से `int64_t value`, `uint32_t status` और `uint32_t span_id` होते हैं। Status 0 पर अंतिम binding की value और span ID 0 मिलती है। विफलता पर value शून्य होती है और span ID से Rust की `failure_spans` तालिका में संबंधित span मिलता है। Status 1 signed overflow है, जिसमें `i64::MIN / -1` और `i64::MIN % -1` शामिल हैं। भाग या शेष का भाजक शून्य होने पर status 2 और ग़लत shift count पर status 3 मिलता है।

Rust host Windows या macOS पर हो, तब भी object का लक्ष्य Linux x86-64 ELF64 है। असमर्थित source पर E0049 आता है। Machine code की सीमा 200,000 bytes और पूरे object की 262,144 bytes है। Emitter caller को bytes देता है। फ़ाइल लिखना और लिंक करना caller की ज़िम्मेदारी है। टैग किए गए टेस्ट में एक अलग C harness इस symbol को लिंक करके चलाता है और value, failure status तथा source span की जाँच करता है।

[Exact ABI contract](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/docs/native-elf64.md) · [Tagged Rust tests](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/tests/native_object_checked.rs) · [Previous alpha.14 host API](/hi/tooling/rust-host-alpha14) · [Published release](/hi/releases/v0.0.6-alpha.15)
