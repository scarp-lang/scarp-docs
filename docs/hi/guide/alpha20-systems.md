# Systems programming और Rust embedding

<!-- scarp-cli-release: v0.0.6-alpha.20 -->
<!-- scarp-current-source: b1a9347f93540fdf95b0ddecba4adc55a3b4bb98 -->

यह गाइड [Scarp v0.0.6-alpha.20](/hi/releases/v0.0.6-alpha.20) में प्रकाशित experimental host APIs के लिए है, compiler main के लिए नहीं। सामान्य programs के लिए [आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) से interpreter लें। Rust embedding में compiler source और Rust toolchain भी चाहिए।

## Execution का तरीका चुनें

| आवश्यकता | प्रकाशित तरीका |
| --- | --- |
| Scarp source चलाना | Interpreter CLI |
| Rust से retained named function चलाना | Checked callable host API |
| Runtime में चुना function बदलना | Typed Rust callable slot |
| कई host calls की सीमाएँ साथ गिनना | Host invocation ledger |
| Relocatable integer-function object बनाना | Experimental ELF64 Rust API |
| किसी भी Scarp project को native executable बनाना | समर्थित नहीं |

ELF object अपने आप चलने वाला executable नहीं। Host API कोई source keyword नहीं है। सामान्य native compiler command या निश्चित performance multiplier उपलब्ध नहीं है।

## Interpreter से शुरुआत

यह उदाहरण integer byte offset की गणना करता है, pointer या memory access नहीं। इसे offset.srp में save करें।

~~~scarp
pure funcra byte_offset(index: integer, width: integer) -> integer {
    if index < 0 or width <= 0 {
        return -1;
    }
    return index * width;
}
print(byte_offset(3, 8));
print(byte_offset(-1, 8));
~~~

~~~text
24
-1
~~~

~~~sh
scarp verify offset.srp
scarp exec offset.srp
~~~

Negative value यहाँ application sentinel है, diagnostic नहीं। Signed integer range से बाहर multiplication checked arithmetic failure देती है; guard अपने आप overflow रोकने का प्रमाण नहीं है।

## Experimental native object का subset

emit_elf64_checked_integer_function Rust API एक standalone pure function लेती है, जिसमें एक से छह required integer parameters और integer return type हों। Integer और Boolean locals, checked scalar arithmetic, assignments, forward conditionals, short-circuit logic और early returns समर्थित हैं।

Loops, calls, contracts, optional parameters, entrypoint statements और heap-backed values शामिल नहीं हैं। Native API को केवल function definition दें; print calls interpreter के उदाहरण में हैं।

Compiler resolved scalar representation verify करके relocatable ELF64 object बनाता है। Production emission सुरक्षित Rust से होता है; C compiler या linker नहीं चलाता। Object link करना हो तो host को अलग linker चाहिए। Target हमेशा Linux x86-64 System V है, भले ही bytes Windows या macOS पर बने हों।

### Rust host emission

Exact published compiler source का प्रयोग करने वाला Rust application यह object memory में बनाता है; file नहीं लिखता और machine code execute नहीं करता।

~~~rust
use scarp::native_object::emit_elf64_checked_integer_function;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let source = "pure funcra double(n: integer) -> integer { return n * 2; }";
    let object = emit_elf64_checked_integer_function(source)?;
    assert!(object.object.starts_with(b"\x7fELF"));
    println!("{}", object.object.len());
    Ok(())
}
~~~

Printed byte size execution result या स्थिर ABI guarantee नहीं है। [Native contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/native-elf64.md) और [Rust example](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/checked_elf64_function.rs) देखें।

### Calling convention और failures

एक argument वाले इस function की उदाहरण C declaration:

~~~c
#include <stdint.h>
struct scarp_result {
    int64_t value;
    uint32_t status;
    uint32_t span_id;
};
extern struct scarp_result scarp_checked_integer_function(int64_t n);
~~~

यह ABI का वर्णन है, पूरा C program नहीं। Parameter count ठीक मिलाएँ। Parameter registers क्रम से RDI, RSI, RDX, RCX, R8 और R9 हैं। 16-byte result में signed value, status और span index हैं।

| Status | अर्थ |
| --- | --- |
| 0 | सफलता; span ID zero |
| 1 | Signed integer overflow |
| 2 | Division या remainder by zero |
| 3 | गलत shift count |

Nonzero status पर ही failure-span index पढ़ें। यह object-local source UTF-8 byte ranges का index है, character position नहीं। Failure में value को सफल परिणाम न मानें। [Native tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/native_object_function.rs) देखें।

## Checked callable slots

Retained named callable compiled program snapshot को reference करता है। Slot के parameter और return types invariant होते हैं। Pure callable impure slot में चल सकता है, उलटा नहीं। Rejected replacement पुराना target नहीं बदलता। Slot और selected function एक ही program snapshot के हों।

Raw catalog internal declarations देख सकता है; visibility के लिए export-aware module selection प्रयोग करें। ये Rust values हैं, Scarp source के first-class function values या closures नहीं। Declaration indices और type IDs compiler rebuild के पार portable नहीं हैं। [Checked slots](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/checked-dynamic-callable-slots-alpha19.md) और [Callable example](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/host_callable_invocation.rs) देखें।

## Cumulative resource accounting

Application अपने HostInvocationLedger का मालिक है और तय करता है कि कौन से calls counters साझा करेंगे।

| सीमा | Scope |
| --- | --- |
| Invocation attempts | Cumulative |
| Charged work, calls, allocations और output | Cumulative |
| Input reads और total input bytes | Cumulative |
| Call depth, live slots, BigInt digit limit | Per-call या per-value |
| Input line size | Per-read |
| Argument values और logical UTF-8 bytes | Per-call और cumulative |

Admission named labels और logical UTF-8 string occurrences गिनता है; alpha.20 में nested composite payloads भी। Shared string की हर occurrence गिनी जाती है। Denied preflight admission attempt या argument quota खर्च नहीं करता। Accepted call बाद में fail हो तो actual usage charge हो सकता है।

Ledger process RSS, elapsed time, network traffic या host द्वारा पहले allocate की गई memory की सीमा नहीं लगाता। यह OS sandbox या authorization system नहीं। नया ledger अपने अलग counters शुरू करता है; sharing और synchronization host की जिम्मेदारी है।

[Cumulative quotas](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/cumulative-host-quotas-alpha19.md), [argument tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/host_argument_budget.rs) और [ledger tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/cumulative_host_quotas.rs) देखें। कुछ upstream design records में draft समय की भाषा है; published release tag और उसका implementation वास्तविक सीमा हैं।

## आगे पढ़ें

[वर्तमान compiler reference](/hi/reference/current) और [प्रकाशित भाषा उदाहरण](/hi/guide/alpha20-language) पढ़ें। इन सीमित APIs से सामान्य systems programming, arbitrary memory access, stable ABI या speed guarantee का निष्कर्ष न निकालें।
