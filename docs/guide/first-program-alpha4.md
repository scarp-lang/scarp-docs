# First Scarp program — published v0.0.6-alpha.4

<!-- scarp-cli-release: v0.0.6-alpha.4 -->

> **Release-pinned historical beginner guide:** This file targets **published experimental** [Scarp v0.0.6-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4), from compiler commit `f04be0758cbce405ddcdb229699b0ff83c09d207`. Earlier `v0.0.5-alpha.1` examples use older CLI commands; the [historical first-program tutorial](/guide/first-program) remains preserved for that release.

Scarp currently executes these programs using its interpreter. The examples below are **not invented snippets**: both source files and exact stdout are included in the [compiler-tested Scarp by Example course](https://github.com/scarp-lang/scarp-by-example). The course verifies them on Windows, macOS and Linux against the pinned compiler.

## 1. Install and verify the release

Download an official platform archive and its matching SHA-256 checksum from [v0.0.6-alpha.4 releases](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.4). Compare the archive with the published checksum before running the executable. After placing `scarp` on your PATH, confirm which compiler you are actually invoking:

~~~sh
scarp version
~~~

The version must identify `0.0.6-alpha.4`. If it does not, do not assume this program's syntax or CLI will match a different prerelease.

## 2. Create your first file

Make a UTF-8 file named `hello.srp` and copy this entire program, unchanged from the verified lesson:

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

The comment begins with `//`; `print` writes a line, and this statement ends with `;`.

## 3. Check, then run

Run from the folder holding `hello.srp`:

~~~sh
scarp verify hello.srp
scarp exec hello.srp
~~~

`verify` performs **static** verification and is silent on success. `exec` executes the program, producing this exact standard output:

~~~text
Hello from Scarp!
~~~

The complete [lesson source](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/01-hello.srp) and [byte-exact stdout fixture](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/01-hello.stdout) are independently checked by the course CI. The website itself does not run Scarp code.

## 4. Learn immutable bindings

Create `area.srp` from the second verified course lesson:

~~~scarp
// Bindings are visible after their declaration.
bind width = 6;
bind height = 7;
bind area = width * height;
print("Area:");
print(area);
~~~

~~~sh
scarp verify area.srp
scarp exec area.srp
~~~

Expected stdout:

~~~text
Area:
42
~~~

`bind` creates an immutable value. The initializer of `area` can read `width` and `height` because both were declared first. To update a variable explicitly, use `var`—see [variables and scopes](/language/variables) and the [next lesson](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/01-basics/02-bindings.srp).

## 5. Continue learning

The [Scarp by Example course](https://github.com/scarp-lang/scarp-by-example) provides numbered executable lessons, English/Hindi notes, and exact output fixtures. Follow its [chapter 01 basics](https://github.com/scarp-lang/scarp-by-example/tree/main/examples/01-basics), then [control flow](/language/control-flow), [modules](/language/modules) and [published alpha.4 numerical functions](/language/scientific-kernels-alpha4).

For whole-folder projects, the [release-aware learning path](/guide/learning-path) distinguishes the older `v0.0.5-alpha.4` project generator from the published `v0.0.6-alpha.4` compiler. A release number must always include the full `v0.0.x-alpha.y` prefix; the short name "alpha.4" refers to multiple historical versions.

**Newer published release:** [v0.0.6-alpha.5](/releases/v0.0.6-alpha.5) also exists, but this lesson deliberately retains the original alpha.4 compiler and output evidence. For new numerical features see [Pearson and Top-P](/language/scientific-kernels-alpha5).
