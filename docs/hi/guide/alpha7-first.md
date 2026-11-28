# Scarp v0.0.7 में पहला कदम

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

यह पाठ [प्रकाशित v0.0.7-alpha.4](/hi/releases/v0.0.7-alpha.4) के interpreter तथा experimental Rust API की सीमाएँ बताता है।

## Fixed arrays जोड़ना

`array_concat(left, right)` समान element type वाली fixed arrays को जोड़कर नई array देता है। Result length दोनों lengths का योग है। Original bindings नहीं बदलतीं।

~~~scarp
bind left = [array: 2, 4];
bind right = [array: 6, 8];
bind joined = array_concat(left, right);
print(array_len(joined));
print(joined[0], joined[3]);
print(array_len(left));
~~~

~~~text
4
2 8
2
~~~

## Integer reductions

`integer_gcd` और उसका alias `integer_hcf` दो से 1024 integer arguments स्वीकार करते हैं। `integer_lcm` भी यही argument count स्वीकार करता है। Zero या केवल एक argument मान्य नहीं है।

~~~scarp
print(integer_gcd(-18, 24, 30));
print(integer_hcf(18, 24, 30));
print(integer_lcm(3, 4, 5));
print(integer_lcm(3, 0, 5));
~~~

~~~text
6
6
60
0
~~~

## Lifetime और native backend

Interpreter सामान्य calls के बाद सीमित frame buffers reuse कर सकता है। लौटाए गए immutable values अगले calls के बाद भी valid रहते हैं। यह OS RAM limit या cycle collector नहीं है।

Experimental x86-64 ELF64 Rust API में 16 तक required integer arguments, scalar conditional expressions, counted repeats और nested loop control उपलब्ध हैं। ABI provisional है। `scarp exec` interpreter ही चलाता है; alpha.2 में experimental `scarp native-object` तथा उसी file के nonrecursive direct calls उपलब्ध हैं। General executable linking और external calls नहीं हैं। [Native-object पाठ](/hi/guide/native-object) पढ़ें।

## Source evidence

Compiler के [array example](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/array_concat.srp), [integer example](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/integer_reductions.srp) और [native contract](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/docs/native-elf64.md) immutable source पर हैं।

Alpha.3 की नई सुविधाओं और उनकी सीमाओं के लिए [Generic functions](/hi/guide/v007-alpha3-generics-strings) तथा [Native aggregate locals](/hi/guide/native-aggregate-locals) पढ़ें।

alpha.4 में Rust host API से bounded native recursion और private nested aggregates समर्थित हैं; `scarp native-object` CLI recursive call graph स्वीकार नहीं करता। [सिस्टम उदाहरण](/hi/guide/v007-alpha4-systems) देखें।
