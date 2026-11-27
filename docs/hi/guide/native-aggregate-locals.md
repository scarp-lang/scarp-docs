# प्रयोगात्मक native aggregate locals

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

यह पाठ alpha.3 के bounded integer entry backend का है। Interpreter में source aggregates का समर्थन और native stack locals का सीमित समर्थन अलग हैं।

## क्या उपलब्ध है

Private flat fixed arrays, tuples और records में integer या Boolean components हो सकते हैं। Stack budget पूरे reachable call path पर लागू रहता है। Aggregate parameters या results, nested/heap-backed aggregate locals, native recursion तथा external calls समर्थित नहीं हैं।

## प्रकाशित उदाहरण

निम्न source को aggregate.srp में रखें। Array replacement पुराने snapshot को सुरक्षित रखता है; record fields और tuple selection private locals हैं।

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

नए output path के साथ bounded entry बनाएँ। यह command object बनाती है, executable नहीं।

~~~sh
scarp native-object --json x86_64-none bounded-entry entry 200 4096 aggregate.srp -o aggregate.o
~~~

## ABI और त्रुटियाँ

दो integer arguments scalar ABI से गुजरते हैं। JSON में peak_stack_bytes को दिए गए max_stack_bytes से मिलाएँ। Invalid array index पर failure span subscript को बताता है; arithmetic overflow और work limit भी checked हैं। Host को status जाँचना चाहिए, केवल result value नहीं।

इस example में entry(1, 7) का सफल result 17 है; entry(0, 7) का result 7 है। यह bootable kernel या स्थिर aggregate ABI नहीं है।

[Native ABI](/hi/guide/native-abi) · [Layout API](/hi/guide/native-layout) · [Upstream test](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/tests/native_object_aggregates.rs).
