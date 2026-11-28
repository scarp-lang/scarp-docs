# First steps with Scarp v0.0.7

<!-- scarp-cli-release: v0.0.7-alpha.4 -->
<!-- scarp-current-source: e620bdcb512fbe909b08f1b4cc625865e4cdf339 -->

This lesson targets the interpreter and experimental native backend in [published v0.0.7-alpha.4](/releases/v0.0.7-alpha.4).

## Join fixed arrays

`array_concat(left, right)` returns a new fixed-size array whose length is the sum of the operand lengths. Element types must match. The input arrays remain unchanged.

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

`integer_gcd`, its alias `integer_hcf`, and `integer_lcm` accept from two to 1024 integer arguments. A one-argument or zero-argument call is not supported. A zero operand gives an LCM of zero.

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

## Lifetime and native backend

The interpreter can reuse a bounded set of frame buffers after ordinary calls. Returned immutable values remain valid across subsequent calls. This is not a process RAM cap or general cycle collector.

The experimental x86-64 ELF64 Rust API supports up to 16 required integer arguments, scalar conditional expressions, counted repeats and nested loop control. Its ABI is provisional. `scarp exec` still interprets source. Alpha.2 adds an experimental `scarp native-object` command and nonrecursive same-file direct calls. General executable linking and external calls remain unsupported. Read the [native-object tutorial](/guide/native-object).

## Source evidence

Immutable upstream evidence: [array example](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/array_concat.srp), [integer example](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/examples/integer_reductions.srp), and [native contract](https://github.com/scarp-lang/scarp/blob/e620bdcb512fbe909b08f1b4cc625865e4cdf339/docs/native-elf64.md).

For alpha.3 additions and their limits, see [generics and strings](/guide/v007-alpha3-generics-strings) and [native aggregate locals](/guide/native-aggregate-locals).

Alpha.4 supports bounded native recursion through the Rust host API, not through the `scarp native-object` CLI, and supports nested private aggregate values. [See the tagged systems examples](/guide/v007-alpha4-systems).
