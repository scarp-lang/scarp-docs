# वर्तमान Scarp type system

<!-- scarp-cli-release: v0.0.6-alpha.20 -->
<!-- scarp-current-source: b1a9347f93540fdf95b0ddecba4adc55a3b4bb98 -->

यह reference [प्रकाशित alpha.20](/hi/releases/v0.0.6-alpha.20) के source types समझाता है। केवल [आधिकारिक Downloads](https://scarp-lang.github.io/downloads/) से compiler लें। Type बताता है कि value किस प्रकार की है और कौन से operations मान्य हैं। Mutable binding का अर्थ mutable backing storage नहीं है। Interpreter में चलने वाला example अपने आप native backend में समर्थित नहीं होता।

## सही type चुनें

| Type | उपयोग |
| --- | --- |
| integer | Checked signed 64-bit पूर्णांक |
| bigint | Quotas के भीतर बड़े exact पूर्णांक |
| float | Finite binary64 approximate संख्या |
| decimal | सीमित exact base-10 arithmetic |
| boolean | true या false |
| string | Unicode text |
| unit | अर्थपूर्ण return value के बिना function |
| tuple | अलग-अलग types वाले निश्चित क्रम के members |
| array | समान type, निश्चित length |
| list | समान type, length type का हिस्सा नहीं |
| map | Typed deterministic key/value snapshot |
| record | Named fields और nominal type identity |
| variant | Named alternatives, वैकल्पिक typed payload |
| vector, integers, tile | विशेष numerical containers, generic lists नहीं |

Scalar और aggregate के नियम अलग हैं। यह practical overview है, हर Rust-internal type या हर संभव generic type के source support का दावा नहीं।

## Explicit type, inference और bindings

नाम के बाद annotation से type तय होता है। Annotation न होने पर initializer type निर्धारित करता है। Compiler assignments, arguments और return types जाँचता है। bind को दोबारा assign नहीं कर सकते; var में compatible value से replacement संभव है। var type को dynamic नहीं बनाता।

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

Floating-point division से पहले explicit to_float conversion लगाया गया है। Automatic mixed arithmetic न मानें। Integer overflow जाँचा जाता है, silently wrap नहीं होता। बड़े integer को float में convert करने पर precision घट सकती है।

## Exact और approximate numbers

Integer की range −9,223,372,036,854,775,808 से 9,223,372,036,854,775,807 तक है। BigInt के लिए explicit text constructor है, oversized integer literal नहीं। Digit, allocation और work limits लागू हैं। Alpha.20 में Decimal lowercase d literal स्वीकार करता है; 28 canonical coefficient digits और 18 fractional places की सीमा है। बिना suffix वाला fractional literal binary64 float है।

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

Numeric types में explicit conversion करें। Decimal division तभी सफल है जब exact result representable हो, या explicit rounding चुनी गई हो। [BigInt](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/bigint.md), [Decimal](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/decimal.md) और [Decimal/tuple lesson](/hi/guide/alpha20-language) देखें। कुछ source docs में draft-era headings हैं; प्रकाशित immutable tag वास्तविक प्रमाण है।

## Fixed tuples और arrays

Tuple में अलग-अलग types हो सकते हैं और arity उसके type का भाग है। Tuple member index compile-time constant होना चाहिए। Alpha.20 में var से constant-index replacement संभव है, लेकिन पुरानी aliases का snapshot नहीं बदलता। Array एक exact element type तथा निश्चित length रखता है, integer index की runtime जाँच होती है। Indexed assignment की जगह array_set इस्तेमाल करें।

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

array_set नया array बनाता है, पुराना सुरक्षित रहता है। tuple<integer, string> और tuple<string, integer> अलग types हैं; array<integer, 2> और array<integer, 3> भी अलग हैं। साधारण square brackets numerical vector बनाते हैं, generic array नहीं। [Tuples](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/tuples.md) और [Fixed arrays](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/fixed-arrays.md) देखें।

## Dynamic lists और deterministic maps

List में element type होता है, length type identity में नहीं। Empty literal में element type लिखना आवश्यक है। List operations नया immutable snapshot लौटाते हैं। Maps integer, boolean और string keys स्वीकार करते हैं तथा canonical key order बनाए रखते हैं। Duplicate evaluated keys पर failure होता है। map_get_or अनुपस्थित key के लिए fallback लेता है; fallback expression key मिलने पर भी eagerly evaluate होता है।

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

List में 4,096 तथा map में 1,024 entries की सीमा है। Execution और allocation quotas अलग से लागू रहते हैं। [List contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/typed-dynamic-lists.md) और [Map contract](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/typed-maps.md) में सभी operations पढ़ें।

## Nominal records और variants

Record file scope में named shape declare करता है। हर field ठीक एक बार initialize करें। Arrow projection operator से field पढ़ें; mutable binding में नया record assign कर सकते हैं। समान fields वाले अलग declared record types भी अलग हैं। Variant अपनी declared cases में से एक को represent करता है, जिसमें zero या one payload होता है। बिना payload वाली case के constructor में भी खाली parentheses आवश्यक हैं। Match में सभी cases cover करें या मान्य अंतिम wildcard दें।

~~~scarp
record Book { title: string, available: boolean }
variant Search { Missing, Found(record Book) }

pure funcra describe(result: variant Search) -> string {
    match on result {
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

Records और variants bounded acyclic types हैं, arbitrary recursive object graphs नहीं। Payload में अन्य समर्थित composite type हो सकता है। Exported nominal types के लिए explicit public declaration तथा module-aware type names चाहिए। [Records](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/source-records.md) और [Variants](https://github.com/scarp-lang/scarp/blob/b1a9347f93540fdf95b0ddecba4adc55a3b4bb98/docs/development/source-variants.md) देखें।

## सामान्य गलतियाँ और सही तरीका

| गलती | सही तरीका |
| --- | --- |
| Integer binding में string assign करना | घोषित type रखें या नया binding बनाएँ |
| Exact decimal में integer सीधे जोड़ना | Explicit conversion करें |
| bind से tuple index बदलना | var और constant member index लें |
| Fixed-array index में assign करना | array_set का नया snapshot रखें |
| List में mixed element types | Tuple या समान element types लें |
| Float map key | समर्थित key type लें |
| Variant case छोड़ना | सभी cases या मान्य final wildcard |

Static check हर runtime property साबित नहीं कर सकता। Dynamic bounds, arithmetic, input और budget exhaustion पर error आ सकता है। scarp exec से पहले scarp verify चलाएँ। Runtime diagnostic को सफल परिणाम से अलग समझें।

## Execution और memory सीमाएँ

Interpreter यहाँ बताए source aggregates को चलाता है; experimental scalar native APIs सीमित subset स्वीकार करती हैं। Composite values raw pointers या first-class function values नहीं हैं। Shared immutable storage, logical allocation quotas तथा Lifetime तुरंत OS memory वापसी या पूरे process की RAM सीमा का वादा नहीं करते। [Systems और embedding](/hi/guide/alpha20-systems) तथा [वर्तमान reference](/hi/reference/current) पढ़ें।

हर Scarp block को अलग source file में save करके प्रकाशित interpreter से चलाएँ। CI दोनों भाषाओं के blocks निकालकर exact parity, source verification और documented stdout की जाँच करता है। यह गाइड प्रकाशित compiler तक सीमित है, main branch तक नहीं।
