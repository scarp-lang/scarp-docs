# Native object ABI और host validation

<!-- scarp-cli-release: v0.0.7-alpha.2 -->
<!-- scarp-current-source: 638dc4c227f34f1c660be66834bcc0cbdb22dec8 -->

यह पाठ प्रकाशित alpha.2 के experimental SysV AMD64 ABI को समझाता है। पहले [native-object पाठ](/hi/guide/native-object) पूरा करें।

## Source नाम और exported symbol

Scarp का selected function name केवल entry चुनाव करता है। ELF symbol mode से तय होता है; private helpers अलग public symbols नहीं हैं। ABI mode और exact argument count JSON metadata से मिलाएँ।

| Mode | ELF symbol |
| --- | --- |
| `checked` | `scarp_checked_integer_function` |
| `bounded` | `scarp_bounded_integer_function` |
| `bounded-entry` | `scarp_bounded_integer_entry` |

## Arguments और stack

Native functions 0 से 16 required signed 64-bit integer arguments लेते हैं। पहले छह SysV registers RDI, RSI, RDX, RCX, R8, R9 में जाते हैं; बाकी caller stack slots में। Caller CALL से पहले 16-byte alignment बनाए रखता है। Report किया गया peak_stack_bytes caller के external argument slots या alignment padding को शामिल नहीं करता।

यह Windows x64 calling convention नहीं है। Windows या macOS से ELF object बन सकता है, लेकिन native execution के लिए compatible ELF x86-64 environment और SysV caller चाहिए।

## Checked result और runtime errors

Result एक 16-byte structure है: signed 64-bit value, unsigned 32-bit status और unsigned 32-bit span_id। Native function का status, compiler CLI exit code से अलग है।

| Status | अर्थ |
| --- | --- |
| 0 | सफल result |
| 1 | Signed integer overflow |
| 2 | Zero divisor |
| 3 | Shift count 0–63 के बाहर |
| 4 | Native work allowance समाप्त |
| 5 | Negative repeat count |

Failure पर value शून्य है और span_id उसी object के failure_spans table को index करता है। UTF-8 byte offsets को character index न मानें। हर external invocation में meter फिर से initialize होता है; private calls shared work allowance उपयोग करती हैं।

## Linux x86-64 पर independent host test

पहले वाले tutorial का calls.o बनाएँ। नीचे का source host.c में रखें। यह C harness result ABI को success, overflow और failure के बाद अगली call से जाँचता है। C compiler केवल test harness link करता है; Scarp object emission अपने Rust backend में होती है।

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

सफल assertion run exit 0 देता है। यह hosted Linux ABI validation है; bootloader, kernel image, general native linker या stable ABI का प्रमाण नहीं।

[मूल native ABI contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/native-elf64.md) · [वर्तमान reference](/hi/reference/current).
