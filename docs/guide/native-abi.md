# Native object ABI and host validation

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

This guide explains the published alpha.3 experimental SysV AMD64 ABI. First complete [the native-object tutorial](/guide/native-object).

## Source name versus exported symbol

The selected function name identifies the source entry. The ELF export is fixed by the mode, not that name. Private helpers do not become public exports. Match the ABI mode and exact argument count to the emitted JSON metadata.

| Mode | ELF symbol |
| --- | --- |
| `checked` | `scarp_checked_integer_function` |
| `bounded` | `scarp_bounded_integer_function` |
| `bounded-entry` | `scarp_bounded_integer_entry` |

## Arguments and stack

Native functions accept zero to sixteen required signed 64-bit integer arguments. The first six use SysV registers RDI, RSI, RDX, RCX, R8 and R9; the remainder use caller-owned stack slots. The caller maintains 16-byte alignment before CALL. The reported peak_stack_bytes excludes the external caller's argument slots and alignment padding.

This is not the Windows x64 calling convention. Windows and macOS hosts can emit ELF objects, but execution needs a compatible ELF x86-64 environment and SysV caller.

## Checked result and runtime errors

The result is a 16-byte structure: signed 64-bit value, unsigned 32-bit status and unsigned 32-bit span_id. A native function status is distinct from the compiler CLI exit code.

| Status | Meaning |
| --- | --- |
| 0 | Successful result |
| 1 | Signed integer overflow |
| 2 | Division or remainder by zero |
| 3 | Shift count outside 0–63 |
| 4 | Native work allowance exhausted |
| 5 | Negative repeat count |

On failure, value is zero and span_id indexes the same object's failure_spans table. Treat its half-open offsets as UTF-8 bytes, not characters. Each external invocation initializes the work meter again; private calls share the allowance.

## Independent host test on Linux x86-64

Produce calls.o using the preceding tutorial. Save the following source as host.c. This C harness checks successful results, overflow and a subsequent call after failure. The C compiler links the test harness; Scarp emits the object using its own Rust backend.

~~~c
#include <assert.h>
#include <stdint.h>

struct scarp_result {
    int64_t value;
    uint32_t status;
    uint32_t span_id;
};

extern struct scarp_result scarp_bounded_integer_entry(int64_t value);

int main(void) {
    struct scarp_result ok = scarp_bounded_integer_entry(41);
    assert(ok.value == 42 && ok.status == 0 && ok.span_id == 0);
    struct scarp_result bad = scarp_bounded_integer_entry(INT64_MAX);
    assert(bad.value == 0 && bad.status == 1);
    struct scarp_result again = scarp_bounded_integer_entry(-1);
    assert(again.value == 0 && again.status == 0);
    return 0;
}
~~~

~~~sh
cc -std=c11 -Wall -Wextra -Werror host.c calls.o -o host-check
./host-check
~~~

A successful assertion run exits 0. This is hosted Linux ABI validation, not evidence of bootloader, kernel image, general native linker or stable ABI support.

[Pinned upstream native ABI contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/native-elf64.md) · [Current reference](/reference/current).

For alpha.3 additions and their limits, see [generics and strings](/guide/v007-alpha3-generics-strings) and [native aggregate locals](/guide/native-aggregate-locals).
