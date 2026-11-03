# Unicode strings: querying and constructing text

<!-- scarp-unicode-release: v0.0.5-alpha.2+v0.0.5-alpha.3 -->
<!-- scarp-cli-release: v0.0.5-alpha.3 -->

This guide teaches **real released Scarp string operations**, using two complete programs copied from the official compiler's published examples. Unicode query functions arrived in **[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** (source `e4db8e191cd7ea623123cae7348450ca6c95b170`); string construction, slicing and repetition are demonstrated in **[v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)** (source `7715c28df09c7703b39e14fddb963275b25df476`).

::: warning Version boundaries
**Alpha.3 is the latest published prerelease, not a stable language release.** The two examples below are proven **separately** against their respective tagged compiler versions. The general [types and values](/language/types) chapter remains based on alpha.1 and does not automatically gain newer operations. Use the matching executable when following each numbered section; passing both release-specific suites does not guarantee that every alpha.2 program works unchanged in alpha.3.
:::

## 1. Understand characters, Unicode scalars and UTF-8 bytes

A Scarp `string` holds UTF-8 text. Unicode **scalar values** (code points excluding surrogates) and UTF-8 **bytes** are different ways of counting text:

- The letters in `café` contain four Unicode scalars; the final `é` takes two UTF-8 bytes.
- The globe `🌍` is **one scalar** with **four UTF-8 bytes**.
- A visually perceived character (a *grapheme cluster*) can use multiple scalars, such as a letter followed by a combining accent or a sequence of emoji. Scarp's text indices in the operations below count **scalars**, not grapheme clusters or terminal columns.

Unicode comparisons and search are exact: they do not promise automatic Unicode normalization or locale-specific case folding.

## 2. Published alpha.2: inspect a Unicode string

Save the following **complete** tagged [`unicode_text.srp` source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/unicode_text.srp) using UTF-8 encoding:

~~~scarp
bind text: string = "café 🌍";
print(text_len(text), text_bytes(text), text_codepoint(text, 5));
print(text_find(text, "🌍"), text_contains(text, "é"));
print(text_starts_with(text, "caf"), text_ends_with(text, "🌍"));
~~~

**Expected stdout**, from the published alpha.2 example:

~~~text
6 10 127757
5 true
true true
~~~

The first line says `café 🌍` contains **6 Unicode scalars**, **10 UTF-8 bytes**, and the globe's code point is **127757**. The second line locates the globe at **scalar index 5**, counting from zero; the final line confirms exact prefix and suffix matches.

### Available query built-ins in alpha.2

| Function | Meaning |
| --- | --- |
| `text_len(text)` | Number of Unicode scalar values |
| `text_bytes(text)` | UTF-8 byte count |
| `text_codepoint(text, index)` | Numeric Unicode code point at a zero-based scalar index |
| `text_find(text, needle)` | First scalar index of an exact match; returns `-1` if absent |
| `text_contains(text, needle)` | Whether an exact substring exists |
| `text_starts_with(text, prefix)` | Whether the text begins with the exact prefix |
| `text_ends_with(text, suffix)` | Whether the text ends with the exact suffix |

A negative or out-of-range scalar index for `text_codepoint` is invalid and reports the compiler's `E0045` diagnostic. An empty search needle matches at index zero. These functions query existing text; they do **not** modify it.

### Run with the alpha.2 CLI

Use a **v0.0.5-alpha.2** executable and run from the folder containing `unicode_text.srp`:

~~~sh
scarp --version
scarp check unicode_text.srp
scarp run unicode_text.srp
~~~

The historical `check` command can evaluate selected runtime paths while suppressing program output; it is **not** a static-only verifier. `run` executes and prints the expected stdout. Confirm the displayed version before using these alpha.2 commands.

## 3. Published alpha.3: construct and repeat text

Alpha.3 adds text construction functions. Save the complete, tagged [`text_construction.srp` source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp):

~~~scarp
bind greeting: string = text_concat("Hello, ", "🌍");
bind planet = text_slice(greeting, 7, 1);
print(greeting);
print(text_repeat(planet, 3));
print(text_len(greeting), text_bytes(greeting));
~~~

**Expected stdout**, from the published alpha.3 example:

~~~text
Hello, 🌍
🌍🌍🌍
8 11
~~~

This program uses three new operations:

- `text_concat("Hello, ", "🌍")` constructs a new string by joining text. This is an **explicit function**; it does not imply that `+` concatenates strings.
- `text_slice(greeting, 7, 1)` selects **one Unicode scalar** starting at **zero-based scalar index 7**. In `Hello, 🌍`, that is the globe, even though it takes four bytes.
- `text_repeat(planet, 3)` constructs three repetitions of the globe. The program confirms that the original greeting has **8 scalars** and **11 UTF-8 bytes**.

Text construction uses bounded allocation and runtime work limits. These operations do not introduce arbitrary string mutation, byte-based indexing, normalization, interpolation or a general formatting subsystem.

### Verify and run with the alpha.3 CLI

Use an executable reporting **v0.0.5-alpha.3** and run from the folder containing `text_construction.srp`:

~~~sh
scarp version
scarp verify text_construction.srp
scarp exec text_construction.srp
~~~

`verify` resolves source and type information **without executing ordinary program statements**; `exec` runs the interpreter and prints the output above. These Scarp-first verbs are **not available in alpha.2**. See the [published CLI reference](/tooling/cli) for the full command distinction.

If Scarp is not on your PATH, replace `scarp` with `.\scarp.exe` on Windows PowerShell or `./scarp` on Linux/macOS. Source files are found relative to the terminal's current working directory.

## 4. Common errors and safe assumptions

| Misconception | Actual published behavior |
| --- | --- |
| Scalar index and UTF-8 byte index mean the same thing | They differ for characters such as `é` and `🌍`. |
| A scalar is always one visible character | Combining marks and multi-code-point emoji sequences can be one displayed grapheme. |
| String search is case-insensitive or normalizes Unicode | The released query functions perform exact matching. |
| `text_slice` or `text_repeat` is available in the original alpha.1 interpreter | These construction operations are demonstrated by the **alpha.3** release, not alpha.1. |
| `scarp check` and `scarp verify` have identical semantics | Legacy `check` can execute selected paths; alpha.3 `verify` is static-only. |
| `+` performs implicit string concatenation | Use the explicitly implemented `text_concat` function in alpha.3. |

## 5. Continue learning

Explore [types and values](/language/types), the [published feature matrix](/reference/status), the [alpha.2 release guide](/releases/v0.0.5-alpha.2), and the [alpha.3 quickstart](/guide/quickstart-alpha3).

**Compiler evidence:** The exact source and output are pinned under [`conformance/alpha2`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha2) and [`conformance/alpha3`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha3). Separate GitHub CI jobs build each tagged official compiler and execute its examples; a TypeScript content gate ensures both English and Hindi copies match those published fixtures.
