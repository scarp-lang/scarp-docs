# Scarp alpha.4 — Nested aggregates और recursion

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

ये उदाहरण प्रकाशित `v0.0.7-alpha.4` source से लिए गए हैं। पहले interpreter से verify/exec करें। Native CLI में केवल nonrecursive declarations स्वीकार होते हैं; recursive object के लिए अलग Rust API चाहिए।

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

`gcd` और `reduce` एक-दूसरे को call करते हैं। Tag के Rust API `emit_elf64_recursive_integer_entry` में work, active-frame और stack budgets हैं। alpha.4 में `scarp native-object` CLI अभी recursive call graph को E0049 से रोकता है।

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

Nonrecursive aggregate source में `print(...)` statements हटाकर `aggregates.srp` बनाएं। Recursive `gcd` को `scarp native-object` में न भेजें: CLI E0049 देता है। Recursive object के लिए Rust host API `emit_elf64_recursive_integer_entry(source, name, max_work, max_active_frames, max_stack_bytes)` प्रयोग करें। ELF64 object executable नहीं है।

~~~sh
scarp verify native_nested_aggregate_locals.srp
scarp exec native_nested_aggregate_locals.srp
scarp native-object --json x86_64-none bounded-entry entry 4000 8192 aggregates.srp -o aggregates.o
scarp exec native_recursive_entry.srp
~~~

[इस tag की रिलीज़](/hi/releases/v0.0.7-alpha.4) · [पुराना alpha.3 aggregate पाठ](/hi/guide/native-aggregate-locals) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/native_recursive_entry.srp).
