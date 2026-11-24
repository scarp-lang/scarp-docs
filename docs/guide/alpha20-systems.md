# Systems programming and Rust embedding

<!-- scarp-cli-release: v0.0.6-alpha.20 -->
<!-- scarp-current-source: b1a9347f93540fdf95b0ddecba4adc55a3b4bb98 -->

This guide covers the experimental host APIs shipped in [Scarp v0.0.6-alpha.20](/releases/v0.0.6-alpha.20), not compiler main. For ordinary programs, install the interpreter from [official downloads](https://scarp-lang.github.io/downloads/). Rust embedding additionally requires the compiler source and its Rust toolchain.

## Choose the execution boundary

| Need | Published execution path |
| --- | --- |
| Run Scarp source | Interpreter CLI |
| Execute a retained named function from Rust | Checked callable host API |
| Change a selected function at runtime | Typed Rust callable slot |
| Meter multiple host calls together | Host invocation ledger |
| Emit a relocatable integer-function object | Experimental ELF64 Rust API |
| Compile an arbitrary Scarp project into a native executable | Not supported |

An ELF object is not a standalone executable. A host API is not a source-language keyword. No general native compiler command or performance multiplier is supported.

## Start with the interpreter

This example calculates an integer byte offset, not a pointer or memory access. Save it as offset.srp.

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

The negative value is an application-level sentinel, not a diagnostic. Multiplication outside the signed integer range produces a checked arithmetic failure; a guard is not an overflow proof.

## Experimental native object subset

The emit_elf64_checked_integer_function Rust API accepts one standalone pure function with one to six required integer parameters and an integer return type. It supports integer and Boolean locals, checked scalar arithmetic, assignments, forward conditionals, short-circuit logic and early returns.

Loops, calls, contracts, optional parameters, entrypoint statements and heap-backed values are excluded. Supply only the function definition to the native API; the print calls above belong to the interpreter.

The compiler verifies its resolved scalar representation before emitting a relocatable ELF64 object. Production emission uses safe Rust and invokes no C compiler or linker. A host choosing to link the result needs a separate linker. The target is always Linux x86-64 System V, including when bytes are emitted on Windows or macOS.

### Rust host emission

In a Rust application using the exact published compiler source, this emits an object into memory without writing a file or executing machine code.

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

The printed byte size is not an execution result or a stable ABI guarantee. See the [native contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/native-elf64.md) and [tagged Rust example](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/checked_elf64_function.rs).

### Calling convention and failures

For this one-argument function, the illustrative C declaration is:

~~~c
#include <stdint.h>
struct scarp_result {
    int64_t value;
    uint32_t status;
    uint32_t span_id;
};
extern struct scarp_result scarp_checked_integer_function(int64_t n);
~~~

This is an ABI description, not a complete C program. Match the parameter count exactly. The parameter registers are RDI, RSI, RDX, RCX, R8 and R9 in order. The 16-byte result contains a signed value, status and span index.

| Status | Interpretation |
| --- | --- |
| 0 | Success; span ID zero |
| 1 | Signed integer overflow |
| 2 | Division or remainder by zero |
| 3 | Invalid shift count |

Only consult the failure-span index on nonzero status. It indexes object-local source UTF-8 byte ranges, not character positions. Do not interpret the value field as a successful result after a failure. See the [native test suite](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/native_object_function.rs).

## Checked callable slots

A retained named callable references a compiled program snapshot. A slot requires invariant parameter and return types. A pure callable may satisfy an impure slot, not the reverse. A rejected replacement preserves the prior target. A slot and selected function must belong to the same program snapshot.

Raw catalogs can access internal declarations; use export-aware module selection where visibility matters. These handles are Rust values, not first-class Scarp function values or closures. Declaration indices and type IDs are not portable across compiler rebuilds. See [checked slots](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/checked-dynamic-callable-slots-alpha19.md) and [callable invocation](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/examples/host_callable_invocation.rs).

## Cumulative resource accounting

The application owns its HostInvocationLedger and decides which calls share counters.

| Limit | Scope |
| --- | --- |
| Invocation attempts | Cumulative |
| Charged work, calls, allocations and output | Cumulative |
| Input reads and total input bytes | Cumulative |
| Call depth, live slots, BigInt digit limit | Per-call or per-value |
| Input line size | Per-read |
| Argument values and logical UTF-8 bytes | Per-call and cumulative |

Admission counts named labels and logical UTF-8 string occurrences, including nested composite payloads in alpha.20. Shared strings count for each occurrence. Denied preflight admissions consume neither attempts nor argument quota. Accepted calls that subsequently fail may still charge actual usage.

The ledger does not cap process RSS, elapsed time, network traffic or allocations already made by the host. It is not an OS sandbox or authorization system. A fresh ledger resets its own counters; the host defines sharing and synchronization.

See [cumulative quotas](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/cumulative-host-quotas-alpha19.md), [argument accounting tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/host_argument_budget.rs) and [ledger tests](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/tests/cumulative_host_quotas.rs). Upstream design records may retain draft-era wording; the release tag and tagged implementation establish publication.

## Further reading

Read the [current compiler reference](/reference/current) and [published language examples](/guide/alpha20-language). Do not infer general systems programming, arbitrary memory access, stable ABI or speed guarantees from these restricted capabilities.
