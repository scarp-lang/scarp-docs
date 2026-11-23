# वर्तमान Scarp compiler reference

<!-- scarp-cli-release: v0.0.6-alpha.18 -->

**प्रकाशित वर्तमान snapshot:** [v0.0.6-alpha.18](/hi/releases/v0.0.6-alpha.18), 22 नवंबर 2026। यह पृष्ठ **सत्यापित वर्तमान व्यवहार** बताता है; भविष्य के releases में syntax हमेशा समान रहने की गारंटी नहीं।

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

## Lifetime और memory की सीमाएँ

Scarp Lifetime compiler-planned scope retirement तथा सुरक्षित Rust immutable shared storage पर आधारित है। User source में free या borrow call लिखना ज़रूरी नहीं। Alpha.18 में खाली finite/integer windows बड़े मूल buffer से अलग हो जाती हैं, लेकिन **गैर-खाली views अब भी पुराने storage को रोके रख सकती हैं**। यह सामान्य cycle collector या OS RAM limit नहीं है, और memory तुरंत लौटने की गारंटी नहीं। `--max-vector-bytes` **cumulative** budget है तथा `--max-live-slots` allocated frame slots गिनता है, actual RAM नहीं।

## वर्तमान compiler में क्या उपलब्ध नहीं है?

प्रयोगात्मक ELF64 तथा C11 code generation सीमित **Rust host APIs** हैं, सामान्य `.srp` native compilation command नहीं। Scarp experimental interpreter ही है; syntax तथा standard-library compatibility स्थिर नहीं।

## आधिकारिक डाउनलोड और प्रमाण

[आधिकारिक Downloads](https://scarp-lang.github.io/downloads/), [वर्तमान इंस्टॉलेशन](/hi/guide/install-latest), [प्रमाणित alpha.18 पाठ](/hi/guide/exec-and-lifetime-alpha18) तथा [compiler का मूल source](https://github.com/scarp-lang/scarp/tree/84d8de05968a488773e7c5b6eda1376d8957553c) पढ़ें। पुराने version-specific pages अब current search/navigation में नहीं दिखते; उनके परीक्षण Git में सुरक्षित हैं।
