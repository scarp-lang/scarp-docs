# Bitwise ऑपरेटर और 64-bit integer patterns (alpha.2)

<!-- scarp-bitwise-release: v0.0.5-alpha.2 -->

**प्रकाशित संस्करण:** यह पाठ 2 नवंबर 2026 को जारी **[Scarp v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** के bitwise operators, integer remainder, binary/hex literals और compound assignments पर आधारित है। बिल्कुल सही source commit: [`e4db8e191cd7ea623123cae7348450ca6c95b170`](https://github.com/scarp-lang/scarp/commit/e4db8e191cd7ea623123cae7348450ca6c95b170)।

::: warning सही compiler चुनें
मुख्य [operators reference](/hi/language/operators) अभी **v0.0.5-alpha.1** पर आधारित है। इसमें नए bitwise syntax का दावा नहीं है। नवीनतम प्रकाशित compiler **[v0.0.5-alpha.3](/hi/releases/v0.0.5-alpha.3)** है; लेकिन इस पाठ में दिए examples का अलग सत्यापन **tagged alpha.2 executable** से हुआ है। इनमें से कोई भी stable नहीं है।
:::

## 1. Integer में bits कैसे काम करते हैं?

Scarp का `integer` **signed 64-bit** मान है। इसका bit pattern नकारात्मक संख्या भी दर्शा सकता है। Bitwise operators संख्या के अंदर मौजूद **64 bits** पर काम करते हैं। Alpha.2 से विभिन्न number bases लिख सकते हैं:

| प्रकार | अर्थ | उदाहरण |
| --- | --- | --- |
| Decimal | सामान्य base 10 | `163` |
| Binary | `0b` के बाद केवल 0 या 1 | `0b0011` |
| Hexadecimal | `0x` के बाद 0–9 और A–F | `0xA0` |

Compiler के tagged tests में `0B` और `0X` भी समर्थित हैं। Hexadecimal लिखने से signed 64-bit की सीमा नहीं बदलती। Radix literals में अंकों के बीच underscore separators उपलब्ध नहीं हैं।

## 2. पूरा प्रकाशित उदाहरण: mask और shift

नीचे आधिकारिक [`bit_fields.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.srp) का बिल्कुल वही source है। इसे UTF-8 file के रूप में सहेजें:

~~~scarp
// Pack and inspect a 64-bit word without implicit numeric conversions.
var flags = 0xA0;
flags |= 0b0011;
println(flags & 0x0F);
println(flags >>> 4);
println(1 << 63);
println(~0);
~~~

Published [`bit_fields.stdout`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.stdout) के अनुसार सही output:

~~~text
3
10
-9223372036854775808
-1
~~~

अब समझें: `0xA0` decimal में 160 है। `flags |= 0b0011` अंतिम दो bits set करके मान को `0xA3`, यानी 163, बनाता है। `flags & 0x0F` केवल अंतिम चार bits रखता है, जिससे **3** मिलता है। चार स्थान unsigned-right shift करने पर **10** मिलता है। `1 << 63` sign bit set करता है, इसलिए Scarp **-9223372036854775808** print करता है। `~0` सभी 64 bits पलटता है, जिससे **-1** मिलता है।

## 3. Alpha.2 के integer operators

| Operator | अर्थ | व्यवहार |
| --- | --- | --- |
| `a & b` | Bitwise AND | दोनों में set bit |
| `a \| b` | Bitwise OR | किसी एक में set bit |
| `a ^ b` | Bitwise XOR | केवल एक operand में set bit |
| `~a` | Bitwise NOT | सभी 64 bits उलट देता है |
| `a << count` | Left shift | 64 bits के बाहर की bits हटती हैं |
| `a >> count` | Signed right shift | Sign bit बची रहती है |
| `a >>> count` | Unsigned right shift | बाईं ओर zeros जुड़ते हैं; परिणाम signed integer में पढ़ा जाता है |
| `a % b` | Remainder | Signed integer remainder; शून्य से भाग देना error है |

ये operations केवल **integers** पर चलते हैं; float, boolean या string पर नहीं। Shift count **0 से 63** तक ही मान्य है। सामान्य integer arithmetic में overflow जाँचा जाता है, जबकि left shift का परिणाम 64-bit bit pattern के अंदर ही रहता है। नकारात्मक मान में `>>` और `>>>` के परिणाम अलग होते हैं।

### Compound assignments और precedence

पुराने mutable `var` पर `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=` और `>>>=` इस्तेमाल कर सकते हैं। Assignment **statement** है, expression नहीं। Immutable `bind` के मान को नहीं बदल सकते। आधिकारिक [bit-operations tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/bit_operations.rs) operator grouping भी जाँचते हैं: उन test expressions में जोड़/गुणा shift से पहले, और bitwise AND, XOR से पहले, XOR, OR से पहले लागू होते हैं। संदेह हो तो parentheses लिखें।

## 4. प्रकाशित error उदाहरण: shift count 64 (E0046)

Shift केवल **0 से 63** तक मान्य है। नीचे आधिकारिक [`shift.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/bits/shift.srp) failure fixture है:

~~~scarp
print("hidden");
var flags = 1;
flags >>>= 64;
~~~

प्रकाशित compiler का **बिल्कुल सही stderr**:

~~~text
error[E0046]: shift count must be between 0 and 63
 --> shift.srp:3:7
  |
3 | flags >>>= 64;
  |       ^^^^
 = help: supply an integer count from 0 through 63; shifts use a fixed 64-bit bit pattern
~~~

Error `>>>=` operator की जगह दिखाता है और सुधार बताता है। शुरुआत में `print("hidden")` होने के बावजूद program fail होने पर **stdout खाली रहता है**। यानी अधूरा user output नहीं भेजा जाता।

## 5. प्रकाशित error उदाहरण: गलत binary digit (E0006)

Binary संख्या में 0 और 1 ही लिख सकते हैं। नीचे tagged [`radix.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/bits/radix.srp) है:

~~~scarp
print("hidden");
print(0b102);
~~~

प्रकाशित compiler का **बिल्कुल सही stderr**:

~~~text
error[E0006]: radix integer literal requires valid digits and a signed 64-bit magnitude
 --> radix.srp:2:7
  |
2 | print(0b102);
  |       ^^^^^
 = help: use a value from -9223372036854775808 to 9223372036854775807
~~~

`0b102` में `2` binary का वैध अंक नहीं है। इस स्थिति में भी `print("hidden")` का output दिखाई नहीं देता। यह असफल program का परीक्षण है, सफल runnable example नहीं।

## 6. तीनों files को कैसे चलाएँ?

आधिकारिक [alpha.2 GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) का **v0.0.5-alpha.2** executable इस्तेमाल करें। तीनों files terminal की current directory में रखें:

~~~sh
scarp --version
scarp check bit_fields.srp
scarp run bit_fields.srp
scarp check shift.srp
scarp run shift.srp
scarp check radix.srp
scarp run radix.srp
~~~

`scarp check` सफल program पर चुप रहता है, लेकिन **कुछ runtime paths चला सकता है**। इसे alpha.3 के static-only `verify` जैसा न समझें। सफल `run` से अनुभाग 2 का चार-लाइन output मिलेगा। दोनों गलत programs पर exit code **1** आएगा, stderr में published diagnostic और stdout खाली होगा। यदि Scarp `PATH` में नहीं है तो Linux/macOS पर `./scarp` और Windows PowerShell पर `.\scarp.exe` चलाएँ।

## 7. आम गलतियाँ

| गलती | सही तरीका |
| --- | --- |
| `>>` तथा `>>>` को समान समझना | पहला sign बचाता है; दूसरा बाएँ से zeros जोड़ता है |
| `1 << 63` को बड़ी positive संख्या मानना | 64-bit sign bit से negative signed मान निकलता है |
| 64 या negative value से shift करना | `E0046`: केवल **0–63** मान्य |
| Float पर `%` लगाना | Alpha.2 का remainder केवल integer के लिए है |
| `0b102` या underscore separators लिखना | Radix में base के वैध digits और signed 64-bit सीमा मानें |
| Immutable `bind` पर compound assignment | पहले mutable `var` चाहिए |
| Alpha.1 compiler पर alpha.2 syntax चलाना | [Version compatibility](/hi/reference/compatibility) देखकर सही tagged compiler लें |

## आगे पढ़ें और प्रमाण देखें

[पुराना alpha.1 operators reference](/hi/language/operators), [published feature matrix](/hi/reference/status) और [alpha.2 release evidence](/hi/releases/v0.0.5-alpha.2) पढ़ें। Source, stdout तथा दो stderr snapshots डॉक्यूमेंटेशन repository में pinned हैं और TypeScript checks से सत्यापित होते हैं। GitHub CI प्रकाशित **alpha.2 compiler** बनाकर सफल तथा असफल, दोनों प्रकार के उदाहरण चलाती है।
