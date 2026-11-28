# Scarp alpha.4 — Nested aggregates और recursion

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

ये उदाहरण प्रकाशित `v0.0.7-alpha.4` source से लिए गए हैं। पहले interpreter से verify/exec करें, फिर केवल function declarations वाला program native-object में दें।

## Nested private frame aggregates

`Window` के अंदर `Lane` records, tuples और fixed arrays हैं। `state` और `snapshot` अलग immutable snapshots रखते हैं; native frame में प्रत्येक aggregate के 32 तक integer/Boolean leaves समर्थित हैं।

~~~scarp
// A frame snapshot contains records, tuples and fixed-size arrays.
record Lane {
    enabled: boolean,
    payload: tuple<integer, array<integer, 2>>,
}

record Window {
    lanes: array<record Lane, 2>,
    offset: integer,
}

pure funcra entry(index: integer, input: integer) -> integer {
    bind first = new Lane { payload: (input, [array: input + 1, input + 2]), enabled: true };
    bind second = new Lane { enabled: false, payload: (0, [array: 1, 2]) };
    var state = new Window { offset: 2, lanes: [array: first, second] };
    bind snapshot = state;
    if input < 0 {
        state = new Window { lanes: [array: second, first], offset: 10 };
    }
    bind selected = state->lanes[index];
    bind payload = if selected->enabled { selected->payload } else { snapshot->lanes[0]->payload };
    return payload[1][index] + state->offset;
}

print(entry(0, 7));
print(entry(1, -7));
~~~

~~~text
10
5
~~~

## Bounded mutual recursion

`gcd` और `reduce` एक-दूसरे को call करते हैं। Native lowering work, live frames और stack को सीमित करता है; ये limits अनंत recursion की अनुमति नहीं हैं।

~~~scarp
// Alternate frames while reducing the Euclidean remainder.
pure funcra gcd(left: integer, right: integer) -> integer {
    if right == 0 {
        return left;
    }
    return reduce(left, right);
}

pure funcra reduce(left: integer, right: integer) -> integer {
    return gcd(right, left % right);
}

print(gcd(1071, 462));
~~~

~~~text
21
~~~

## Native object बनाने का तरीका

ऊपर दिए `.srp` उदाहरणों के `print(...)` statements हटाकर केवल types/functions को `aggregates.srp` और `recursive.srp` में रखें। Native object output ELF64 relocatable है, स्वयं executable नहीं। CLI काम की सीमा और stack सीमा को compile-time validate करता है।

~~~sh
scarp verify native_nested_aggregate_locals.srp
scarp exec native_nested_aggregate_locals.srp
scarp native-object --json x86_64-none bounded-entry entry 4000 8192 aggregates.srp -o aggregates.o
scarp native-object --json x86_64-none bounded-entry gcd 4000 8192 recursive.srp -o recursive.o
~~~

[इस tag की रिलीज़](/hi/releases/v0.0.7-alpha.4) · [पुराना alpha.3 aggregate पाठ](/hi/guide/native-aggregate-locals) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/native_recursive_entry.srp).
