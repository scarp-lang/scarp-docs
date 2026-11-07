# Typed bindings and checked conversions (v0.0.5-alpha.2)

<!-- scarp-language-release: v0.0.5-alpha.2 -->

This practical lesson covers two capabilities **shipped in the published [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) prerelease** on November 2, 2026: optional type annotations in `bind` / `var` declarations and explicit, checked numeric conversions. The source is pinned to compiler commit [`e4db8e191cd7ea623123cae7348450ca6c95b170`](https://github.com/scarp-lang/scarp/commit/e4db8e191cd7ea623123cae7348450ca6c95b170). It is a **release-specific addition**; the older [variables](/language/variables) and [types](/language/types) references retain their independent alpha.1 evidence.

::: tip Version boundary
Use an **alpha.2 compiler** for the exact commands below. The latest released compiler is [v0.0.6-alpha.3](/releases/v0.0.6-alpha.3); the historical [alpha.3 release](/releases/v0.0.5-alpha.3) introduced newer CLI verbs; the older alpha.1 compiler does **not** implement these annotations or conversion built-ins. This lesson's programs have been executed and verified **on the tagged alpha.2 compiler**; it does not claim an exhaustive cross-release compatibility guarantee.
:::

## 1. What is a type annotation?

A binding stores a value under a name. With `bind`, reassignment is forbidden; with `var`, the binding may be reassigned to another value of the **same type**. Scarp ordinarily infers the type from the initializer. Since the published alpha.2 release, you can also write `name: type` before `=` to state the intended type explicitly.

An annotation is a **check, not a cast**. The initializer must already have the declared type. It does not make a value mutable or change its representation. An initializer is still mandatory, and `bind` remains immutable even when annotated.

### Published program: typed bindings

Save this **exact** file as `typed_declarations.srp`. It is copied from the tagged [official compiler example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/typed_declarations.srp):

~~~scarp
bind samples: vector = [1.0, 2.0, 3.0];
var total: float = sum(samples);
total += 0.5;
bind grid: tile = tile(samples, 1, 3);
bind ready: boolean = width(grid) == 3;
bind label: string = "typed";
print(label, ready, total);
~~~

**Expected stdout** from the tagged compiler:

~~~text
typed true 6.5
~~~

Read it from top to bottom:

- `samples: vector` declares an immutable floating-point vector.
- `total: float` declares a mutable finite float initialized with the result of `sum(samples)`, which is `6.0`.
- `total += 0.5` changes that float to `6.5`. It does **not** change `samples`.
- `grid: tile` stores a tiled numerical value, while `ready: boolean` checks that its width is three.
- `label: string` keeps the text `"typed"`. `print` writes all three selected values on one line.

Together, the two published examples demonstrate **integer, float, boolean, string, vector and tile** type annotations; it does not introduce classes, user-defined structures, a generic type system, or a general-purpose list.

## 2. Why are conversions explicit?

`integer` and `float` are different types. Scarp does **not** silently turn an integer into a float in arithmetic or during declaration. The published alpha.2 release provides two pure, checked built-ins:

| Built-in | Argument and result | Important rule |
| --- | --- | --- |
| `to_float(value)` | `integer` → `float` | The integer must be **exactly representable** as a finite binary64 float. |
| `to_integer(value)` | `float` → `integer` | The float must be mathematically **integral** and within the signed 64-bit integer range. |

A fractional float is **rejected**, not rounded or truncated. If the integer cannot be exactly expressed as a binary64 number, `to_float` also fails rather than silently losing precision. Both failures use the compiler's `E0044` diagnostic; this is not an arbitrary unchecked cast.

### Published program: numeric conversions

Save this **exact** tagged [compiler source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/scalar_conversions.srp) as `scalar_conversions.srp`:

~~~scarp
bind count: integer = 42;
bind scaled: float = to_float(count) / 4.0;
bind exact: integer = to_integer(12.0);
print(scaled, exact, to_integer(-0.0));
~~~

**Expected stdout:**

~~~text
10.5 12 0
~~~

Explanation: `to_float(count)` converts the integer `42` to the float `42.0`; dividing by `4.0` gives `10.5`. `to_integer(12.0)` becomes `12`. Negative floating-point zero (`-0.0`) converts to integer zero (`0`). The source uses annotations to make both intended results clear.

## 3. Run both programs using the published compiler

Save the two `.srp` files in the same working directory and make sure the **alpha.2** executable is on your `PATH`. Run:

~~~sh
scarp --version
scarp check typed_declarations.srp
scarp run typed_declarations.srp
scarp check scalar_conversions.srp
scarp run scalar_conversions.srp
~~~

First confirm that `scarp --version` reports **0.0.5-alpha.2**. The historical `check` command suppresses user output **but can evaluate selected runtime paths**; it is **not** the same as the static-only `verify` available in alpha.3. `run` executes each program and prints the expected output shown above.

If you run an extracted binary without installing it globally, use `./scarp` on Linux/macOS or `.\scarp.exe` in Windows PowerShell instead of `scarp`. File paths are resolved from your terminal's current directory.

## 4. Common mistakes and version-specific limits

| Mistake | Why it matters |
| --- | --- |
| Expecting `bind number: float = 42;` to cast automatically | An annotation checks the initializer's type; it does not convert `integer` to `float`. |
| Treating `to_integer` as a truncation operation | Fractional floats are rejected, not truncated. |
| Assuming `var` allows a new type on every assignment | Mutations preserve the originally declared type. |
| Using `scarp verify` on an alpha.2 executable | That command belongs to the published alpha.3 CLI; use version-appropriate commands. |
| Expecting a `vector` to store integers | The `vector` type holds finite floats; the separate alpha.2 `integers` collection is described in [collections](/tutorials/alpha2-collections-and-learning). |

**Try predicting the output** before running the two files. Then change `total += 0.5` to a different **float** increment in your own copy and predict the new result. Use `scarp check` to observe any diagnostics. Keep the original examples unchanged when checking against the published stdout fixtures.

## Continue learning

Read [variables and lexical scope](/language/variables), [data types](/language/types), the [12-case published alpha.2 feature index](/reference/status), and [alpha.3 getting started](/guide/quickstart-alpha3) for the newer CLI.

**Evidence:** The complete sources and stdout above match [tagged compiler fixtures](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/examples), copied in [`conformance/alpha2/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha2) and executed by the release-specific compiler CI job. The docs build additionally verifies that both language versions reproduce these fixtures exactly.
