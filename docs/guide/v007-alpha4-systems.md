# Scarp alpha.4 — Nested aggregates and recursion

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

The examples are byte-for-byte from published `v0.0.7-alpha.4` compiler fixtures. Verify and execute with the interpreter first. The CLI accepts a declaration-only nonrecursive source for object emission; recursive entry emission requires the separate tagged Rust API.

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

`gcd` and `reduce` call each other. The tagged Rust API `emit_elf64_recursive_integer_entry` enforces work, active-frame and stack budgets. The alpha.4 `scarp native-object` CLI still rejects recursive call graphs.

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

For the nonrecursive aggregate CLI example, remove the top-level `print(...)` statements and save only types and functions in `aggregates.srp`. Do not pass recursive `gcd` to `scarp native-object`: that CLI rejects recursion with E0049. To emit a recursive entry, use the tagged Rust host API `emit_elf64_recursive_integer_entry(source, name, max_work, max_active_frames, max_stack_bytes)`. Both APIs produce relocatable ELF64 objects, not executables.

~~~sh
scarp verify native_nested_aggregate_locals.srp
scarp exec native_nested_aggregate_locals.srp
scarp native-object --json x86_64-none bounded-entry entry 4000 8192 aggregates.srp -o aggregates.o
scarp exec native_recursive_entry.srp
~~~

[Published release](/releases/v0.0.7-alpha.4) · [Earlier alpha.3 aggregate lesson](/guide/native-aggregate-locals) · [Pinned source](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/native_recursive_entry.srp).
