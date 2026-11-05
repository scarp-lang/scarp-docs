# Your first Scarp program

**New installations:** Follow the [release-aware learning path](/guide/learning-path) and [published alpha.6 download/checksum guide](/releases/v0.0.6-alpha.1). This page is a **historical alpha.1 file tutorial**: use its own published compiler to reproduce its verified results.

**Want a current project instead?** Use the [published alpha.6 project lab](/tutorials/project-symbol-navigation-alpha6) with the exact alpha.6 interpreter. The [alpha.4 installation guide](/guide/installation) and [alpha.4 project quickstart](/guide/quickstart-alpha4) are separate historical references. This file tutorial deliberately uses alpha.1 semantics.

This tutorial targets **v0.0.5-alpha.1**. Confirm `scarp --version` before you begin. To evaluate upgrading to the published **alpha.2**, see the [compiler-tested compatibility guide](/reference/upgrade-readiness): it runs all 11 original alpha.1 fixtures unchanged on alpha.2, but does not claim every older source program remains compatible.

## Create a file

Create `hello.srp` in a directory you control and save it as UTF-8:

~~~scarp
// hello.srp
bind language = "Scarp";
print("Hello from", language);
print(1 + 2 * 3);
~~~

## Run the file

~~~sh
scarp run hello.srp
~~~

Expected stdout:

~~~text
Hello from Scarp
7
~~~

From the compiler source checkout, use `cargo run -- run hello.srp` instead of an installed `scarp` command. The filename is resolved relative to the shell's working directory.

## Check without output

~~~sh
scarp check hello.srp
~~~

On success this command is **silent**. It checks syntax, names, mutability, types, and the selected execution path. It does not simply parse source: reachable arithmetic and runtime-budget errors can still be reported. `tokens` is different—it only lists lexical tokens.

~~~sh
scarp tokens hello.srp
~~~

## Change a value

~~~scarp
var visits = 1;
visits += 1;
print("Visits:", visits);
~~~

`var` permits reassignment; `bind` does not. Scarp requires semicolons for these statements and does not implicitly convert strings into numeric operands. The `print` statement accepts comma-separated values.

Next read [variables](/language/variables), [types](/language/types), and the [CLI reference](/tooling/cli).

**Verified against:** [first-program tutorial](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tutorials/first-program.md), [output guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/output.md).

## Next: use a complete tested program

Next practice real functions in the [verified functions tutorial](/tutorials/verified-functions), then continue with [loops](/tutorials/repeat-and-loops) or [source modules](/tutorials/modules-walkthrough). The documentation project's [conformance suite](https://github.com/scarp-lang/scarp-docs/tree/main/conformance) mirrors compiler-owned examples and checks their actual outputs when CI can build the published interpreter.
