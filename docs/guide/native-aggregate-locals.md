# Experimental native aggregate locals

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

This lesson targets alpha.3's bounded integer entry backend. Interpreter aggregates and restricted native stack locals are separate capabilities.

## What is supported

Private flat fixed arrays, tuples and records can contain integer or Boolean components. The stack budget applies across reachable calls. Aggregate parameters/results, nested or heap-backed aggregate locals, native recursion and external calls remain unsupported.

## Published example

Save this source as aggregate.srp. Array replacement preserves the prior snapshot; record fields and tuple selection remain private locals.

~~~scarp
record Pair {
    valid: boolean,
    number: integer,
}

pure funcra entry(i: integer, n: integer) -> integer {
    var numbers = [array: n, n + 1, n + 2];
    bind snapshot = numbers;
    numbers = [array: numbers[2], numbers[0], numbers[1]];
    bind pair = new Pair { number: numbers[i], valid: i == 1 };
    bind selected = if pair->valid { (pair->number, true) } else { (snapshot[0], false) };
    if selected[(1)] { return selected[0] + 10; }
    return selected[0];
}
~~~

Emit a bounded entry to a new output path. This command produces an object, not an executable.

~~~sh
scarp native-object --json x86_64-none bounded-entry entry 200 4096 aggregate.srp -o aggregate.o
~~~

## ABI and failure behavior

Two integer arguments use the scalar ABI. Compare peak_stack_bytes in the JSON report with max_stack_bytes. Invalid indices report the subscript failure span; arithmetic overflow and work exhaustion are also checked. A host must inspect status, not only the result value.

For this example, entry(1, 7) yields 17 and entry(0, 7) yields 7 when execution succeeds. This is not a bootable kernel or stable aggregate ABI.

[Native ABI](/guide/native-abi) · [Layout API](/guide/native-layout) · [Upstream test](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/tests/native_object_aggregates.rs).
