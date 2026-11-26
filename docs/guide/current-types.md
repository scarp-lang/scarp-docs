# Current Scarp type system

<!-- scarp-cli-release: v0.0.7-alpha.2 -->
<!-- scarp-current-source: 638dc4c227f34f1c660be66834bcc0cbdb22dec8 -->

This reference describes the source type model of [published v0.0.7-alpha.2](/releases/v0.0.7-alpha.2). Install only from [official downloads](https://scarp-lang.github.io/downloads/). Types describe values and allowed operations; a mutable binding does not imply mutable backing storage. A successful interpreter example does not establish native-backend support.

## Choosing a type

| Type | Use |
| --- | --- |
| integer | Checked signed 64-bit whole numbers |
| bigint | Exact signed integers larger than the fixed-width range, within quotas |
| float | Finite binary64 numerical approximation |
| decimal | Bounded exact base-10 arithmetic |
| boolean | true or false |
| string | Unicode text |
| unit | Function without a meaningful returned value |
| tuple | Fixed ordered heterogeneous members |
| array | Homogeneous, fixed length |
| list | Homogeneous, length-independent type |
| map | Typed deterministic key/value snapshot |
| record | Named fields and nominal type identity |
| variant | Named alternatives with an optional typed payload |
| vector, integers, tile | Specialized numerical containers, not generic lists |

The scalar and aggregate rules differ. This is a practical overview, not a claim that every Rust-internal type or every possible generic type is available in source.

## Explicit types, inference and bindings

An annotation after a name declares its type. Without an annotation, the initializer establishes the type. The compiler checks assignments, argument and return types. A function parameter cannot be named result or have type unit. Bindings introduced by bind cannot be rebound; var permits replacement with a compatible value. A binding's type does not become dynamic when it is declared with var.

~~~scarp
bind count: integer = 7;
var total: integer = count;
total += 5;
bind label: string = "Scarp";
bind ready: boolean = total == 12;
bind ratio: float = to_float(total) / 5.0;
print(label, ready, total, ratio);
~~~

~~~text
Scarp true 12 2.4
~~~

The explicit conversion to_float is used before floating-point division; do not assume automatic mixed arithmetic. Integer overflow is checked, not silently wrapped. Conversion can lose precision when a large integer is converted to float.

## Exact versus approximate numbers

The integer range is −9,223,372,036,854,775,808 through 9,223,372,036,854,775,807. BigInt uses an explicit text constructor rather than oversized integer literals; its digit, allocation and work limits still apply. Decimal supports lowercase d literals in alpha.20 and is bounded to 28 canonical coefficient digits and 18 fractional places. Unsuffixed fractional literals are binary64 floats.

~~~scarp
bind big: bigint = bigint("999999999999999999999");
print(big + bigint_from_integer(1));
bind exact: decimal = 0.1d + 0.2d;
print(exact);
print(0.1 + 0.2);
~~~

~~~text
1000000000000000000000
0.3
0.30000000000000004
~~~

Use explicit conversions between numeric types. Decimal division must be exactly representable unless explicit rounding is requested. See [BigInt](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/bigint.md), [Decimal](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/decimal.md) and the [current release lesson](/guide/alpha7-first). Some source documents retain draft-era headings: the immutable published tag is the evidence boundary.

## Fixed tuples and arrays

A tuple may hold different member types and its arity is part of its type. Tuple member indices must be compile-time constants. Alpha.20 supports constant-index replacement through var, but prior aliases retain the old snapshot. An array holds one exact element type at a fixed length, using checked integer indices; use array_set rather than indexed assignment.

~~~scarp
var pair: tuple<integer, string> = (7, "draft");
bind saved = pair;
pair[0] = 9;
bind values: array<integer, 2> = [array: 10, 20];
bind changed = array_set(values, 1, 40);
print(saved[0], pair[0]);
print(values[1], changed[1]);
~~~

~~~text
7 9
20 40
~~~

The expression array_set creates a new array while preserving the old one. Type metadata distinguishes tuple<integer, string> from tuple<string, integer> and array<integer, 2> from array<integer, 3>. Ordinary square brackets construct numerical vectors rather than generic arrays. See [tuples](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/tuples.md) and [fixed arrays](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/fixed-arrays.md).

## Dynamic lists and deterministic maps

A list has an element type but no length in its type identity. An empty literal needs an explicit element type. List operations return new immutable snapshots rather than mutating aliases. Maps accept integer, boolean and string keys and maintain canonical key order. Duplicate evaluated keys fail; absent keys may use map_get_or with an explicit fallback. The fallback expression is evaluated eagerly even when the key exists.

~~~scarp
bind empty: list<integer> = [list: <integer>];
bind items = list_push(empty, 5);
bind next = list_push(items, 8);
print(list_len(items), list_len(next), next[1]);
bind counts: map<string, integer> = [map: "z": 2, "a": 1];
bind updated = map_set(counts, "a", 9);
print(map_get_or(counts, "a", 0), map_get_or(updated, "a", 0));
print(map_get_or(updated, "absent", -1));
~~~

~~~text
1 2 8
1 9
-1
~~~

List lengths are bounded at 4,096 and map entries at 1,024. These limits do not remove execution and allocation quotas. Use [list contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/typed-dynamic-lists.md) and [map contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/typed-maps.md) for precise operations.

## Nominal records and variants

A record declares a named shape at file scope. Each field must be initialized exactly once. Use the arrow projection operator to read fields; a mutable binding may receive a replacement record. Different declared record types are distinct even with identical field names. A variant represents one of its declared cases, with zero or one payload. Even a payload-free case constructor requires empty parentheses. Match arms must account for every case or use the permitted final wildcard.

~~~scarp
record Book { title: string, available: boolean }
variant Search { Missing, Found(record Book) }

pure funcra describe(outcome: variant Search) -> string {
    match on outcome {
        case Missing { return "Not found"; }
        case Found(book) { return book->title; }
    }
}

bind book: record Book = new Book { title: "Scarp", available: true };
print(book->available);
print(describe(new Search::Found(book)));
print(describe(new Search::Missing()));
~~~

~~~text
true
Scarp
Not found
~~~

Records and variants are bounded acyclic types, not arbitrary recursive object graphs. A payload can contain another supported composite type. Exported nominal types need explicit public declarations and module-aware type names. See [records](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/development/source-records.md) and [variants](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/development/source-variants.md).

## Common mistakes and how to reason about them

| Mistake | Correct approach |
| --- | --- |
| Assign a string to an integer binding | Keep the declared type or create a new binding |
| Add an integer directly to an exact decimal | Use an explicit conversion |
| Change a tuple index through bind | Use a var binding with constant member index |
| Assign through a fixed-array index | Use array_set and retain the returned snapshot |
| Construct a list with mixed element types | Use a tuple or consistent element types |
| Use a float map key | Use an admitted key type |
| Omit a variant case | Cover all cases or add a valid final wildcard |

A static check cannot prove every runtime property: dynamic bounds, arithmetic errors, input and exhausted resource budgets can still fail. Use scarp verify before scarp exec, and treat runtime diagnostics separately from successful results.

## Execution boundaries and memory

The interpreter supports the source aggregates documented here; the experimental scalar native APIs support only a restricted subset. Composite values are not raw pointers or first-class function values. Shared immutable storage, logical allocation quotas and Lifetime do not imply immediate OS memory return or a process-wide RAM limit. Consult the [systems and embedding guide](/guide/alpha7-first) and [current reference](/reference/current).

For each example, save its Scarp block as a separate source file and run it using the published interpreter. CI extracts these blocks from both languages, checks exact parity, verifies source and compares stdout with the documented output. The guide remains scoped to the published compiler, not main.
