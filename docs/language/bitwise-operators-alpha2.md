# Bitwise operators and 64-bit integer patterns (alpha.2)

<!-- scarp-bitwise-release: v0.0.5-alpha.2 -->

**Release scope:** This lesson covers signed 64-bit bitwise operators, remainder, radix literals, and compound assignments introduced in the published **[Scarp v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** on November 2, 2026. Exact compiler source: [`e4db8e191cd7ea623123cae7348450ca6c95b170`](https://github.com/scarp-lang/scarp/commit/e4db8e191cd7ea623123cae7348450ca6c95b170).

::: warning Use the correct compiler
The general [operator reference](/language/operators) is pinned to **v0.0.5-alpha.1** and does **not** claim support for this syntax. The latest separately released compiler is **[v0.0.5-alpha.3](/releases/v0.0.5-alpha.3)**, but the examples on this page are proven against the **published alpha.2 executable**, not every future version. Neither version is stable.
:::

## 1. Understand integers as bits

A Scarp `integer` is a **signed 64-bit number**. Its 64 bits can represent a negative number, but bitwise operators act on the underlying **fixed-width bit pattern**. New integer literal prefixes in alpha.2 allow writing the same value using different bases:

| Form | Description | Example |
| --- | --- | --- |
| Decimal | Ordinary base-10 integer | `163` |
| Binary | `0b` prefix, digits 0 and 1 | `0b0011` |
| Hexadecimal | `0x` prefix, digits 0–9 and A–F | `0xA0` |

Uppercase `0B` and `0X` prefixes also work in the tagged tests. The integer range remains signed 64-bit; an arbitrarily large hexadecimal sequence is **not** an unrestricted unsigned integer. Digit separators such as underscores are not accepted by these radix literals.

## 2. Published positive example: pack, mask, and shift

Save the exact published [`bit_fields.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.srp) source as a UTF-8 file:

~~~scarp
// Pack and inspect a 64-bit word without implicit numeric conversions.
var flags = 0xA0;
flags |= 0b0011;
println(flags & 0x0F);
println(flags >>> 4);
println(1 << 63);
println(~0);
~~~

Expected stdout, reproduced from the tagged [`bit_fields.stdout`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.stdout):

~~~text
3
10
-9223372036854775808
-1
~~~

Step-by-step: `0xA0` is decimal 160. `flags |= 0b0011` sets its two low bits, making `0xA3` (163). The mask `flags & 0x0F` keeps the low nibble, yielding **3**. Unsigned-right-shifting the bit pattern by four produces **10**. `1 << 63` sets the sign bit of the fixed 64-bit pattern, so Scarp prints **-9223372036854775808** rather than a huge positive number. Finally `~0` flips every bit, yielding **-1**.

## 3. Supported integer operators

| Syntax | Meaning | Important behavior |
| --- | --- | --- |
| `a & b` | Bitwise AND | Bits set in both operands |
| `a \| b` | Bitwise OR | Bits set in either operand |
| `a ^ b` | Bitwise XOR | Bits set in exactly one operand |
| `~a` | Bitwise NOT | Inverts all 64 bits |
| `a << count` | Left shift | Retains the low 64 bits; shifted-out bits are discarded |
| `a >> count` | Signed right shift | Preserves the sign bit (arithmetic shift) |
| `a >>> count` | Unsigned right shift | Inserts zero bits from the left, then interprets the 64-bit result as signed |
| `a % b` | Integer remainder | Result follows signed remainder semantics; a zero divisor is an error |

These operators require **integers**, not floats, booleans, strings, or vectors. Shift counts must be **integers from 0 through 63**, inclusive. Unlike ordinary checked integer arithmetic, left shift preserves the 64-bit bit pattern rather than reporting an arithmetic-overflow error when a high bit moves out of range. `>>` and `>>>` differ for negative inputs.

### Assignment and precedence

For a previously declared mutable `var`, alpha.2 supports `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=`, and `>>>=`. Just like ordinary assignment, these are **statements**, not expressions, and cannot change a binding declared with `bind`. Existing mathematical and boolean operators still work. The published compiler's [bit-operations tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/bit_operations.rs) cover precedence interactions: multiplication/addition apply before shifts in the tested expressions; bitwise AND binds more tightly than XOR, which binds more tightly than OR. Use parentheses when the grouping matters.

## 4. Published failing example: shift count too large (E0046)

A shift count of **64** is invalid, because only 0 through 63 can be selected. Save the **exact** released [`shift.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/bits/shift.srp) fixture:

~~~scarp
print("hidden");
var flags = 1;
flags >>>= 64;
~~~

Its exact compiler stderr is:

~~~text
error[E0046]: shift count must be between 0 and 63
 --> shift.srp:3:7
  |
3 | flags >>>= 64;
  |       ^^^^
 = help: supply an integer count from 0 through 63; shifts use a fixed 64-bit bit pattern
~~~

The error marks `>>>=` and explains how to repair the count. Although this program contains an earlier `print("hidden")`, compilation/execution failure leaves **stdout empty**: the emitted text is not partially published.

## 5. Published failing example: invalid radix digits (E0006)

Binary literals may contain only 0 and 1. Save the tagged [`radix.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/bits/radix.srp) fixture:

~~~scarp
print("hidden");
print(0b102);
~~~

Its exact compiler stderr is:

~~~text
error[E0006]: radix integer literal requires valid digits and a signed 64-bit magnitude
 --> radix.srp:2:7
  |
2 | print(0b102);
  |       ^^^^^
 = help: use a value from -9223372036854775808 to 9223372036854775807
~~~

`0b102` has a digit `2` that is invalid in base 2. This error also leaves **stdout empty**, despite the earlier `print("hidden")`. A diagnostic example demonstrates a failed input; it must not be presented as a runnable successful program.

## 6. Run and inspect the published examples

Use the official **v0.0.5-alpha.2** executable from its [tagged GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2). Save the three files in your current directory, then run:

~~~sh
scarp --version
scarp check bit_fields.srp
scarp run bit_fields.srp
scarp check shift.srp
scarp run shift.srp
scarp check radix.srp
scarp run radix.srp
~~~

`scarp check` is silent on successful programs; **it can evaluate selected runtime paths**, so it must not be confused with the newer alpha.3 **static-only** `verify` command. The successful `run` command prints the four lines in section 2. Each failing command returns exit code **1**, prints the tagged diagnostic to stderr, and keeps stdout empty. Use `./scarp` (Linux/macOS) or `.\scarp.exe` (Windows PowerShell) when the executable is not on your `PATH`.

## 7. Common mistakes

| Mistake | Correction |
| --- | --- |
| Assuming `>>>` is the same as `>>` | Signed-right shift preserves the sign; unsigned-right shift inserts zero bits |
| Expecting `1 << 63` to print a large positive number | It prints the signed value represented by the 64-bit sign bit |
| Shifting by 64 or a negative number | `E0046`: counts must be between **0 and 63** |
| Using `%` on floats | The alpha.2 remainder operator is integer-only |
| Writing `0b102` or using underscore digit separators | Radix literals require valid digits and fit the signed 64-bit magnitude |
| Using compound bitwise assignments on `bind` | Only a mutable `var` can be reassigned |
| Running alpha.2 syntax with an alpha.1 compiler | Use the tagged alpha.2 compiler and follow [version compatibility](/reference/compatibility) |

## Further reading and verification

Read [the alpha.1 operators reference](/language/operators), the [published feature matrix](/reference/status), and the [alpha.2 release evidence](/releases/v0.0.5-alpha.2). The exact example outputs and error stderr are pinned in the documentation repository and validated by TypeScript. Separate GitHub CI jobs build the **published alpha.2 compiler** and run both successful and failing cases.
