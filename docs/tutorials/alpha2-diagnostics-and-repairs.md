# Scarp alpha.2: verified diagnostic failures and repairs

**Version: published v0.0.5-alpha.2 (November 2, 2026).** This guide teaches troubleshooting using **six real failing compiler fixtures**, mirrored byte-for-byte from the published Scarp test suite. The accompanying TypeScript checks validate Git blob provenance and bilingual source/stderr examples; CI runs the tagged interpreter.

The filenames and diagnostics below are not hypothetical. Their stderr snapshots come directly from [published compiler tests](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/tests/fixtures). This guide does **not** change the [alpha.1 diagnostics baseline](/reference/diagnostics). A failed check/run should have status **1**, empty stdout and a diagnostic on stderr. Exact path labels and formatting can differ between tools and operating systems; the published fixtures have their original locations.

## 1. Inexact integer-to-float conversion — E0044

Failing source `scalar_text/conversion.srp`:

~~~scarp
print("hidden");
print(to_float(9223372036854775807));
~~~

Published expected stderr:

~~~text
error[E0044]: integer cannot be represented exactly as a float
 --> conversion.srp:2:16
  |
2 | print(to_float(9223372036854775807));
  |                ^^^^^^^^^^^^^^^^^^^
 = help: conversions must be exact: use an integral in-range float or an exactly representable integer
~~~

**Repair**: The signed 64-bit maximum cannot be represented exactly as binary64. Choose a representable integer or keep the value in its integer form. to_float is not a rounding cast.

## 2. Fractional float-to-integer conversion — E0044

Failing source `scalar_text/fraction.srp`:

~~~scarp
eprint("hidden");
print(to_integer(1.5));
~~~

Published expected stderr:

~~~text
error[E0044]: float must be integral and within the signed 64-bit integer range
 --> fraction.srp:2:18
  |
2 | print(to_integer(1.5));
  |                  ^^^
 = help: conversions must be exact: use an integral in-range float or an exactly representable integer
~~~

**Repair**: to_integer(1.5) rejects the fractional part rather than truncating it. Supply an integral float or explicitly use supported integer arithmetic.

## 3. Unicode scalar index outside string — E0045

Failing source `scalar_text/index.srp`:

~~~scarp
// café 🌍
print(text_codepoint("aé🌍", 3));
~~~

Published expected stderr:

~~~text
error[E0045]: text scalar index 3 is outside the string
 --> index.srp:2:29
  |
2 | print(text_codepoint("aé🌍", 3));
  |                             ^
 = help: use a nonnegative index below text_len(text); indices count Unicode scalar values, not UTF-8 bytes
~~~

**Repair**: The string has three Unicode scalar values. Index 3 is invalid because indexing starts at zero. Use an index below text_len(text); UTF-8 bytes are a different count.

## 4. Function call forbidden in module constant — E0037

Failing source `constants/call.srp`:

~~~scarp
pure funcra compute() -> integer { return 42; }
pub bind invalid = compute();
~~~

Published expected stderr:

~~~text
error[E0037]: calls are not allowed in module constant expressions
 --> call.srp:2:20
  |
2 | pub bind invalid = compute();
  |                    ^^^^^^^
 = note: constant initialized here
 --> call.srp:2:10
  |
2 | pub bind invalid = compute();
  |          ^^^^^^^
 = help: use scalar operators and earlier constants; call functions at runtime
~~~

**Repair**: Module constant initializers allow restricted scalar expressions, not function calls—even pure functions. Move the call into normal runtime code.

## 5. Private imported module symbol — E0041

Supporting file `modules/library.srp`:

~~~scarp
// café 🌍
bind secret = 3;
pub bind value = 4;
pub pure funcra take(x: integer) -> integer { return x; }
~~~

Failing source `modules/private.srp`:

~~~scarp
import "library.srp" as library;
print(library.secret);
~~~

Published expected stderr:

~~~text
error[E0041]: library.secret is private
 --> private.srp:2:7
  |
2 | print(library.secret);
  |       ^^^^^^^^^^^^^^
 = note: the private declaration is here
 --> library.srp:2:6
  |
2 | bind secret = 3;
  |      ^^^^^^
 = help: mark the declaration pub in its defining module
~~~

**Repair**: Private declarations can appear in the static inventory, but other modules cannot access them. Export the intended public symbol using pub or call a public function.

## 6. Cyclic source imports — E0039

Supporting file `modules/loop.srp`:

~~~scarp
import "cycle.srp" as cycle;
~~~

Failing source `modules/cycle.srp`:

~~~scarp
import "loop.srp" as loop;
~~~

Published expected stderr:

~~~text
error[E0039]: circular import reaches "cycle.srp"
 --> loop.srp:1:8
  |
1 | import "cycle.srp" as cycle;
  |        ^^^^^^^^^^^
 = note: this import continues the cycle
 --> cycle.srp:1:8
  |
1 | import "loop.srp" as loop;
  |        ^^^^^^^^^^
 = help: remove an import edge; mutually recursive functions belong in one module
~~~

**Repair**: These two files import each other. Extract shared code into a third, acyclic module or keep mutually recursive functions in one suitable module.



## Reproduce a diagnostic

Use the **alpha.2** executable. Place the example files inside their named folders and run from that folder:

~~~sh
scarp check conversion.srp
scarp run conversion.srp
scarp explain E0044
~~~


The first two commands fail on purpose. The `explain` command succeeds and offers general guidance **without loading a source file**. Diagnostic E0044 covers checked numeric-conversion failures; E0045 covers invalid Unicode scalar indexing. For module cases, keep the supporting files beside the entry source.

## What the checks establish

The documentation checker verifies complete source/stderr fences in **English and Hindi**, pinned Git blob hashes and supporting-file order. Compiler CI executes all six negative programs, checking status **1**, empty stdout, and the full expected stderr for both `run` and `check` on a pinned Ubuntu runner. The tests complement the [12 successful alpha.2 conformance programs](/tutorials/alpha2-module-constants-and-inspection). They do not guarantee identical wording in future releases.

Read the [alpha.2 diagnostic CLI](/tooling/alpha2-inspection), [compatibility guide](/reference/compatibility) and [versioned evidence policy](/reference/evidence).
