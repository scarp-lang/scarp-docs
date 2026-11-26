# Experimental native value layout

<!-- scarp-cli-release: v0.0.7-alpha.2 -->
<!-- scarp-current-source: 638dc4c227f34f1c660be66834bcc0cbdb22dec8 -->

Scarp alpha.2 का Rust host API target layout की गणना करता है। यह memory serialization या aggregate native execution नहीं करता। Interpreter representation इससे अलग है।

## Size, alignment और padding

| Type | Size और alignment |
| --- | --- |
| `integer` | 8 bytes, alignment 8 |
| `float` | 8 bytes, alignment 8 |
| `boolean` | 1 byte, alignment 1 |
| Tuples और records | Declaration order, प्रत्येक field aligned, total padded |
| Fixed arrays | Padded element size stride; empty array retains element alignment |
| Variants, option, result | 4-byte little-endian tag और shared aligned payload |

उदाहरण: tuple<boolean, integer> में Boolean offset 0, integer offset 8, size 16 और alignment 8 है। बीच में 7 padding bytes हैं। यह planner की target layout जानकारी है; actual interpreter memory का measurement नहीं।

## Tagged values

Tag declaration order का zero-based index है। Option में None=0 और Some=1; Result में Ok=0 और Err=1। Payload वाले सभी cases समान aligned payload_offset साझा करते हैं, जो सबसे बड़े payload के लिए पर्याप्त होता है। Tag-only variant का size और alignment 4 है। Unsupported payload पूरे type को reject करता है, चाहे वह case inactive हो।

## Rust host query

Exact published Scarp crate को Rust host dependency की तरह प्रयोग करें। नीचे canonical type ID उसी compiled program के registry से आता है; दूसरे registry की ID उपयोग न करें।

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

यह उदाहरण layout size, alignment और field offsets जाँचता है। यह tuple को ELF object में pass नहीं करता।

## Limits और engineering boundaries

Planner checked 64-bit arithmetic उपयोग करता है और value size को i64::MAX तक सीमित करता है। Traversal 64 levels तथा 65,536 component visits तक bounded है। Dynamic या heap-backed types, callable types और foreign type IDs reject होते हैं। General pointers, address spaces, ABI stabilization और aggregate lowering का दावा नहीं है।

[मूल layout contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/native-value-layout.md) · [वर्तमान type guide](/hi/guide/current-types) · [Native ABI](/hi/guide/native-abi).
