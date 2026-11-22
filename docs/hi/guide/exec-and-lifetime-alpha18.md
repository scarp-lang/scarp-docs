# एक कमांड से चलाएँ, immutable arrays और Scarp Lifetime — alpha.18

<!-- scarp-cli-release: v0.0.6-alpha.18 -->
<!-- scarp-current-source: 84d8de05968a488773e7c5b6eda1376d8957553c -->

यह मार्गदर्शिका केवल [प्रकाशित v0.0.6-alpha.18](/hi/releases/v0.0.6-alpha.18) के लिए है; compiler की बदलती `main` branch पर आधारित दावा नहीं है।

## बिना filename के `scarp exec`

Project या source directory में `scarp exec` चलाने पर केवल **वर्तमान directory** को देखा जाता है:

1. `scarp.project` अथवा पुराना `Scarp.project` होने पर manifest validate होता है और उसका घोषित entrypoint चुना जाता है।
2. Manifest नहीं होने पर `src/main.srp` पहले चुना जाता है।
3. उसके न होने पर `main.srp` चुना जाता है।
4. कोई entrypoint न मिलने पर error आता है। Parent directory या दूसरी मनमानी `.srp` file अपने-आप नहीं चलती।

**गलत manifest पर fallback नहीं होता**; उसे ठीक करना होगा। Explicit filename भी चल सकता है:

~~~sh
scarp exec
scarp exec main.srp
scarp exec src/calculator.srp
scarp exec --max-steps 2000000
~~~

सामान्य filename को `scarp exec path/to/file.srp` की तरह लिखें; `--filename.srp` कोई वैध filename option नहीं है। Dash से शुरू होने वाले नाम के लिए `--` separator उपयोग करें। `exec` में program को input चाहिए तो सीमित interactive prompt स्वतः समर्थित है। पुराने `run` में interactive opt-in अलग है।

## `array_set` में नया snapshot

`array_set(array, index, replacement)` उसी fixed-array type और length का **नया immutable मान** बनाता है। मूल array तथा उसके पुराने aliases नहीं बदलते। Arguments बाएँ से दाएँ केवल एक बार evaluate होते हैं। गलत index पर **E0063**, और cumulative allocation budget पार होने पर **E0064** मिलता है। `values[index] = x` अभी समर्थित नहीं है।

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

## Lifetime का सही अर्थ

Scarp Lifetime में compiler के scope-retirement निर्देश तथा safe Rust की immutable, shared storage का प्रयोग होता है। सामान्य Scarp code में `free`, `delete` या borrow annotation लिखने की आवश्यकता नहीं। किसी value को return या capture करने पर पुरानी binding का scope समाप्त होने के बाद भी वह snapshot सुरक्षित रहता है।

Alpha.18 में **खाली finite/integer numerical window** पुराने बड़े buffer से अलग हो जाती है और canonical empty storage साझा करती है। **गैर-खाली window** पुराने buffer को share करती रहती है और बड़े allocation को memory में रख सकती है। Empty windows से बने zero-cell tiles भी लाभ लेते हैं। Empty view के लिए numerical elements की copy नहीं बनती।

~~~scarp
// Lifetime preserves value snapshots without explicit memory management.
bind data = [1.0, 2.0, 3.0];
bind tail = window(data, 1, 2);
bind empty = window(data, 2, 0);
print(len(empty), tail);

bind numbers: integers = [integer: 7, 8, 9];
bind empty_numbers = ints_window(numbers, 2, 0);
print(ints_len(empty_numbers), ints_window(numbers, 1, 2));
~~~

~~~text
0 [2.0, 3.0]
0 [integer: 8, 9]
~~~

यह पूर्ण cycle collector नहीं है; user को raw pointers नहीं मिलते और memory छोड़ने पर तुरंत OS RAM कम होने की गारंटी नहीं है। `--max-live-slots` frame slots गिनता है, जबकि `--max-vector-bytes` नए numerical payload का **कुल cumulative** खर्च गिनता है। दोनों actual process RAM/RSS की सीमा नहीं हैं। Composite values, output captures और nonempty windows memory retention बढ़ा सकते हैं।

Native ELF64 तथा C11 backends अभी सीमित Rust-host APIs हैं, कोई सामान्य `scarp compile` CLI नहीं है। अधिक तकनीकी विवरण [प्रकाशित Lifetime अनुबंध](https://github.com/scarp-lang/scarp/blob/84d8de05968a488773e7c5b6eda1376d8957553c/docs/memory-lifetimes.md) में है।

[Release और SHA-256 downloads](/hi/releases/v0.0.6-alpha.18) · [पुरानी alpha.17 traversal सुविधा](/hi/language/array-traversal-alpha17)
