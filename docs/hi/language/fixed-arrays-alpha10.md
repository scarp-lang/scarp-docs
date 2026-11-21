# Immutable fixed arrays और BigInt — alpha.10

<!-- scarp-cli-release: v0.0.6-alpha.10 -->
<!-- scarp-current-source: 44fcd0f77ccb92648cdb1fc7632495c506c87cb3 -->

[v0.0.6-alpha.10](/hi/releases/v0.0.6-alpha.10) · [Array contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/fixed-arrays.md) · [BigInt contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/bigint.md).

## सही syntax

`array<integer, 2>` में एक ही type के दो values होते हैं। `[array: 10, 20]` nonempty array और `[array: <integer>]` typed empty array है। `values[index]` bounds-check करता है; indexed assignment नहीं है।

## प्रकाशित example

[fixed_arrays.srp](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/fixed_arrays.srp)

[fixed_arrays.stdout](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/fixed_arrays.stdout)

~~~scarp
pure funcra labels(values: array<string, 2> = [array: "नमस्ते", "Scarp"])
    -> array<string, 2> ensures result == values; {
    return values;
}

var index = 1;
bind grid = [array: [array: 1, 2], [array: 3, 4]];
bind empty = [array: <array<integer, 2>>];
print(labels()[index], grid[index][0], empty);
print(labels(), grid[0] == [array: 1, 2]);
~~~

~~~text
Scarp 3 [array: <array<integer, 2>>]
[array: "नमस्ते", "Scarp"] true
~~~

~~~sh
scarp verify examples/fixed_arrays.srp
scarp exec examples/fixed_arrays.srp
~~~

## Resource सीमाएँ

| Constraint | Ceiling |

| --- | --- |

| Array length | 4,096 |

| Array/tuple nesting | 32 |

| Expanded shape | 65,536 nodes |

| Array storage | 8 MiB default |

`E0062` array shape/length, `E0063` bounds और `E0064` allocation errors हैं।

## नए BigInt कार्य

Alpha.10 में exact powers, gcd/lcm, integer square root, bit length, radix conversion 2–36, signed bitwise और shifts, modular exponentiation, और `bigint_divmod` हैं। सब पर budgets हैं; modular exponentiation variable-time है।

Array types होने पर module JSON schema 3 प्रयोग होता है। General native compile CLI उपलब्ध नहीं है।

## alpha.16 के बाद के डेवलपमेंट बिल्ड

`array_len(values)` से `repeat` लूप के लिए ऐरे की लंबाई मिलती है।
इंडेक्स ऋणात्मक हो या ऐरे की सीमा से बाहर हो, तो
`array_get_or(values, index, fallback)` डिफ़ॉल्ट मान देता है। यह मान ऐरे के
एलिमेंट के ठीक उसी टाइप का होना चाहिए और सही इंडेक्स पर भी एक बार
मूल्यांकित होता है। इन सुविधाओं के लिए डेवलपमेंट कंपाइलर चाहिए।
[ऐरे पर लूप का उदाहरण](https://github.com/scarp-lang/scarp/blob/976a5ce33bfd66cf5a916f3c0c0a8b0ea6001048/examples/array_traversal.srp)
और [अपेक्षित आउटपुट](https://github.com/scarp-lang/scarp/blob/976a5ce33bfd66cf5a916f3c0c0a8b0ea6001048/examples/array_traversal.stdout)
देखें।
