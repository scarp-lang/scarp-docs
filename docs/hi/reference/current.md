# वर्तमान Scarp compiler reference

<!-- scarp-cli-release: v0.0.7-alpha.4 -->

**प्रकाशित वर्तमान snapshot:** [v0.0.7-alpha.4](/hi/releases/v0.0.7-alpha.4), 28 नवंबर 2026। यह पृष्ठ **सत्यापित वर्तमान व्यवहार** बताता है; भविष्य के releases में syntax हमेशा समान रहने की गारंटी नहीं।

## CLI और entrypoint चुनाव

| Command | वर्तमान व्यवहार |
| --- | --- |
| `scarp version` | चल रहे Scarp interpreter का version दिखाता है |
| `scarp exec` | पहले वर्तमान directory का valid manifest, फिर `src/main.srp`, फिर `main.srp` चुनता है; गलत manifest पर error आता है |
| `scarp exec FILE.srp` | स्पष्ट रूप से चुनी गई Scarp source file चलाता है |
| `scarp verify FILE.srp` | Program चलाए बिना source और imports की static जाँच करता है |

ज़रूरत होने पर `scarp exec` सीमित interactive input संभाल सकता है। यह `.srp` source interpret करता है; सामान्य `scarp compile` command इस prerelease में **उपलब्ध नहीं**।

## Immutable fixed arrays

`array_set(values, index, replacement)` समान length और element type का **नया fixed-array snapshot** देता है। Original array और पुराने aliases नहीं बदलते। गलत index पर **E0063** और cumulative array allocation budget समाप्त होने पर **E0064** आता है। Indexed in-place mutation समर्थित नहीं।

~~~scarp
pure funcra replace_last(values: array<integer, 3>) -> array<integer, 3> {
    return array_set(values, 2, 100);
}

bind original = [array: 4, 8, 12];
bind updated = array_set(original, 1, 99);
print(original[1], updated[1], array_len(updated));

bind nested = [array: [array: "one"], [array: "two"]];
bind localized = array_set(nested, 0, [array: "नमस्ते"]);
print(nested[0][0], localized[0][0]);
print(replace_last(updated)[2]);
~~~

~~~text
8 99 3
one नमस्ते
100
~~~

## Fixed-array concatenation

`array_concat(left, right)` समान element type वाली fixed arrays जोड़कर combined length की नई array बनाता है। Original arrays नहीं बदलतीं। [उदाहरण](/hi/guide/alpha7-first) देखें।

## Lifetime और memory की सीमाएँ

Scarp Lifetime compiler-planned scope retirement तथा सुरक्षित Rust immutable shared storage पर आधारित है। User source में free या borrow call लिखना ज़रूरी नहीं। Alpha.18 में खाली finite/integer windows बड़े मूल buffer से अलग हो जाती हैं, लेकिन **गैर-खाली views अब भी पुराने storage को रोके रख सकती हैं**। यह सामान्य cycle collector या OS RAM limit नहीं है, और memory तुरंत लौटने की गारंटी नहीं। `--max-vector-bytes` **cumulative** budget है तथा `--max-live-slots` allocated frame slots गिनता है, actual RAM नहीं।

## प्रकाशित decimal और tuple features

Alpha.20 में `0.1d + 0.2d` exact `0.3` देता है; unsuffixed binary64 floats नहीं बदले। Mutable tuple में constant index पर persistent replacement और compatible numeric tuples की lexicographic ordering उपलब्ध है। [उदाहरण और सीमाएँ](/hi/guide/alpha7-first) पढ़ें।


[वर्तमान type system guide](/hi/guide/current-types) में scalar, composite और nominal types के उदाहरण पढ़ें।

## Generic functions, strings और Lifetime

File-level `funcra` में explicit `::<...>` type arguments, contextual inference और generic Option/Result payloads उपलब्ध हैं। `Numeric` तथा `Comparable` constraints concrete type की सीमाएँ रखते हैं। String concatenation `+`, repetition `*`, raw और multiline literals interpreter में उपलब्ध हैं; interpolation नहीं। Function completion पर अनुपयोगी values retire होती हैं और result ownership transfer होती है। यह process RAM cap नहीं है।

[Generic और string पाठ](/hi/guide/v007-alpha3-generics-strings) · [Native aggregate locals](/hi/guide/native-aggregate-locals).

## Rust embedding और native API

Alpha.19 ने checked named/exported callable handles, signature/effect constrained slots और cumulative execution receipts दिए। Alpha.20 में composite strings के logical UTF-8 bytes भी quota में गिने जाते हैं। Ledger पूरे process की memory limit नहीं है।

Experimental native-object backend pure integer functions, 16 तक required integer arguments तथा एक ही file के bounded direct calls और budget-सीमित self/mutual recursion स्वीकार करता है। नई CLI केवल relocatable x86-64 ELF64 object बनाती है। Work और call-stack bounds जाँचे जाते हैं; ABI experimental है। [Native-object पाठ](/hi/guide/native-object) तथा [tagged compiler contract](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/docs/native-elf64.md) देखें।

[वर्तमान release guide](/hi/guide/alpha7-first) में array concatenation, integer reductions और native सीमाएँ पढ़ें।

## वर्तमान compiler में क्या उपलब्ध नहीं है?

ELF64 object emission अब experimental CLI से उपलब्ध है; C11 emission और checked aggregate layout planning Rust host APIs हैं। सामान्य executable linking, external calls, heap-backed values और general aggregate parameters/results उपलब्ध नहीं हैं। Flat integer/Boolean arrays, tuples और records private bounded native stack locals के रूप में उपलब्ध हैं। Scarp experimental interpreter ही है; syntax तथा standard-library compatibility स्थिर नहीं।

## आधिकारिक डाउनलोड और प्रमाण

[आधिकारिक Downloads](https://scarp-lang.github.io/downloads/), [वर्तमान इंस्टॉलेशन](/hi/guide/install-latest), [वर्तमान भाषा पाठ](/hi/guide/alpha7-first) तथा [compiler का मूल source](https://github.com/scarp-lang/scarp/tree/e620bdcb512fbe909b08f1b4cc625865e4cdf339) पढ़ें। पुराने version-specific pages अब current search/navigation में नहीं दिखते; उनके परीक्षण Git में सुरक्षित हैं।

## alpha.4 की native और BigInt सीमाएँ

Native `bounded-entry` अब सीमित self/mutual recursion और nested private records/arrays/tuples को स्वीकार करता है। हर aggregate में अधिकतम 32 integer/Boolean leaves समर्थित हैं। Work, stack और active-frame budgets अलग हैं। File-backed BigInt में अलग IO, buffer और work सीमाएँ हैं। [सिस्टम पाठ](/hi/guide/v007-alpha4-systems) · [BigInt पाठ](/hi/guide/v007-alpha4-bigint)।
