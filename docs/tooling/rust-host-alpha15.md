# Alpha.15 — Rust host safeguards and boundaries

<!-- scarp-cli-release: v0.0.6-alpha.15 -->
<!-- scarp-current-source: a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281 -->

These changes describe **Rust embedding APIs** or interpreter boundaries, not a general `scarp compile` CLI.

## CLI inspection limit

`inspect tokens`, `inspect ast`, and legacy `tokens` read regular UTF-8 source up to **1 MiB**. The limit counts bytes, not Unicode characters.

## String comparison work

Equality and inequality of equal-length UTF-8 strings (`==`, `!=`) charge one work step per started **64 bytes**, identically during execution and constant evaluation.

## Loader revisions

`EditorCompilationCache` validates the loader's revisions against the host-supplied revisions before semantic reuse. A mismatch raises `RevisionMismatch`; exhaustive `CachedCompileError`/`EditorCompileError` consumers should handle it.

## Checked ELF64 shift kernels

`emit_elf64_checked_integer_kernel` emits restricted relocatable ELF64 objects for immutable integer bindings. `<<`, `>>`, `>>>` accept 0–63 counts; invalid shifts return `status = 3` (`CHECKED_KERNEL_INVALID_SHIFT`) and a half-open UTF-8 byte span for the first failing operator. No general native executable or stable ABI is implied.

~~~scarp
bind bits = -8;
bind count = 2;
bind result = (bits >> count) ^ (bits >>> count);
~~~

Status 0 is success, 1 is signed overflow, 2 is division by zero. This Rust object API does not run general Scarp programs.

[Exact ABI contract](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/docs/native-elf64.md) · [Tagged Rust tests](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/tests/native_object_checked.rs) · [Previous alpha.14 host API](/tooling/rust-host-alpha14) · [Published release](/releases/v0.0.6-alpha.15)
