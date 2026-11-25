# Scarp v0.0.7 में पहला कदम

<!-- scarp-cli-release: v0.0.7-alpha.1 -->
<!-- scarp-current-source: 996bd5b83c8cb26e98637563729f67bdacc61cd4 -->

यह पाठ [प्रकाशित v0.0.7-alpha.1](/hi/releases/v0.0.7-alpha.1) के interpreter तथा experimental Rust API की सीमाएँ बताता है।

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

Experimental x86-64 ELF64 Rust API में 16 तक required integer arguments, scalar conditional expressions, counted repeats और nested loop control उपलब्ध हैं। ABI provisional है। `scarp exec` interpreter ही चलाता है; general native function calls, executable linking और native compilation CLI शामिल नहीं हैं।

## Source evidence

Compiler के [array example](https://github.com/scarp-lang/scarp/blob/996bd5b83c8cb26e98637563729f67bdacc61cd4/examples/array_concat.srp), [integer example](https://github.com/scarp-lang/scarp/blob/996bd5b83c8cb26e98637563729f67bdacc61cd4/examples/integer_reductions.srp) और [native contract](https://github.com/scarp-lang/scarp/blob/996bd5b83c8cb26e98637563729f67bdacc61cd4/docs/native-elf64.md) immutable source पर हैं।
