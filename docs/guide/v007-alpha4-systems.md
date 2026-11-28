# Scarp alpha.4 — Nested aggregates and recursion

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

The examples are byte-for-byte from published `v0.0.7-alpha.4` compiler fixtures. Verify and execute with the interpreter first; for native-object emission pass a declaration-only source file.

## Nested private frame aggregates

`Window` contains `Lane` records, tuples and fixed arrays. `state` and `snapshot` retain distinct immutable snapshots. Each private native aggregate has at most 32 integer/Boolean leaves.

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

`gcd` and `reduce` call each other. Native lowering enforces work, live-frame and stack budgets; these bounds do not allow unrestricted recursion.

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

## Emitting the native object

For native-object, remove the top-level `print(...)` statements from the above examples and save only types and functions in `aggregates.srp` and `recursive.srp`. The output is a relocatable ELF64 object, not an executable. The CLI validates work and stack budgets.

~~~sh
scarp verify native_nested_aggregate_locals.srp
scarp exec native_nested_aggregate_locals.srp
scarp native-object --json x86_64-none bounded-entry entry 4000 8192 aggregates.srp -o aggregates.o
scarp native-object --json x86_64-none bounded-entry gcd 4000 8192 recursive.srp -o recursive.o
~~~

[Published release](/releases/v0.0.7-alpha.4) · [Earlier alpha.3 aggregate lesson](/guide/native-aggregate-locals) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/native_recursive_entry.srp).
