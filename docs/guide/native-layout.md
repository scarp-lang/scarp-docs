# Experimental native value layout

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

The alpha.3 Rust host API computes target layouts without serializing values or executing native aggregates. Interpreter storage is a separate representation.

## Size, alignment and padding

| Type | Size and alignment |
| --- | --- |
| `integer` | 8 bytes, alignment 8 |
| `float` | 8 bytes, alignment 8 |
| `boolean` | 1 byte, alignment 1 |
| Tuples and records | Declaration order, each field aligned, total padded |
| Fixed arrays | Padded element size as stride; empty arrays retain element alignment |
| Variants, option, result | 4-byte little-endian tag and shared aligned payload |

For example, tuple<boolean, integer> places the Boolean at offset 0 and the integer at offset 8, with size 16 and alignment 8. Seven padding bytes separate them. This is planned target layout, not a measurement of interpreter memory.

## Tagged values

The tag is the zero-based declaration index. Option uses None=0 and Some=1; Result uses Ok=0 and Err=1. All payload-bearing cases share an aligned payload_offset sized for the largest payload. A tag-only variant has size and alignment four. An unsupported payload rejects the entire type, even when its case is inactive.

## Rust host query

Use the exact published Scarp crate as a Rust host dependency. The canonical type ID below comes from the same compiled program's registry; do not reuse an ID from another registry.

~~~rust
use scarp::native_object::{plan_x86_64_value_layout, NativeLayoutShape};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let program = scarp::compile("bind pair = (true, 42);")?;
    let id = program.binding_type_ids()[0];
    let layout = plan_x86_64_value_layout(program.type_registry(), id)?;
    assert_eq!((layout.size, layout.alignment), (16, 8));
    assert_eq!(layout.shape, NativeLayoutShape::Fields {
        offsets: vec![0, 8],
    });
    Ok(())
}
~~~

This example asserts size, alignment and field offsets. It does not pass a tuple into an ELF object.

## Limits and engineering boundaries

The planner uses checked 64-bit arithmetic and bounds total value size to i64::MAX. Traversal is limited to 64 levels and 65,536 component visits. Dynamic or heap-backed types, callable types and foreign type IDs are rejected. This is not support for general pointers, address spaces, stable aggregate ABI or general aggregate lowering.

[Pinned upstream layout contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/native-value-layout.md) · [Current type guide](/guide/current-types) · [Native ABI](/guide/native-abi).

For alpha.3 additions and their limits, see [generics and strings](/guide/v007-alpha3-generics-strings) and [native aggregate locals](/guide/native-aggregate-locals).
