# Walkthrough: print, call, and define functions

This tutorial is built from **real compiler-owned programs in Scarp v0.0.5-alpha.1**. Each source block and its expected stdout below is checked against the pinned conformance suite in CI. It documents the published **interpreter**, not a future native-code compiler.

Before starting, [install the prerelease](/guide/installation), then confirm `scarp --version` reports `0.0.5-alpha.1`. If you're using a source checkout, replace `scarp` with `cargo run --`.

## 1. Run the smallest example

Create `hello.srp` and copy **all** of the following source:

~~~scarp
// My first Scarp program
print("Hello from Scarp!");
~~~

Run `scarp check hello.srp` first, then `scarp run hello.srp` to display:

~~~text
Hello from Scarp!
~~~

**What happened?** The `print` statement writes text and a newline to standard output. `check` validates the selected execution path silently; it does not print the program's output. [Read about output streams](/language/output).

**Compiler evidence:** [hello.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/hello.srp) and its [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/hello.stdout).

## 2. Explore typed functions

Create `functions.srp` and copy this **complete**, published compiler example. `funcra` defines a function, parameters have explicit types, and `->` declares the result type. Note that the first call occurs before the function definition: the published interpreter resolves these named functions.

~~~scarp
// Typed calls, forward declarations, all primitive parameter types, and unit.
print(add(10, square(5)));

funcra add(a: integer, b: integer) -> integer {
    return a + b;
}

funcra square(value: integer) -> integer {
    return value * value;
}

funcra identity(text: string) -> string {
    return text;
}

funcra greet(name: string) -> unit {
    print("Hello", name);
    return;
}

pure funcra choose(value: integer, enabled: boolean) -> integer {
    if enabled { return value * 2; }
    return value;
}

greet(identity("Scarp"));
print(choose(3, true));
~~~

Run `scarp check functions.srp` and then `scarp run functions.srp`. Expected standard output, line for line:

~~~text
35
Hello Scarp
6
~~~

### Read the output

1. `square(5)` returns `25`; `add(10, 25)` returns `35`.
2. `identity("Scarp")` returns a string, and `greet` writes `Hello Scarp` before returning `unit` (no value).
3. `choose(3, true)` returns `6`; the `pure` modifier places restrictions on the function's allowed effects.

**Compiler evidence:** [functions.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.srp) and its [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.stdout).

## 3. Learn to change code safely

Try changing the first arguments of `add` and `square`, then run `scarp check functions.srp` and `scarp run functions.srp` again. The checked example above is the **unchanged reference version**; your experiment's output will differ. Next, try a wrong argument type and read the diagnostic. See [function semantics](/language/functions) and [diagnostics](/reference/diagnostics).

## Why these examples are trustworthy

The docs repository [mirrors these exact source/output pairs](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs) from the pinned compiler release. The documentation's TypeScript evidence check ensures that this page and [its Hindi counterpart](/hi/tutorials/verified-functions) still display the mirrored source and expected output, in order. In a separate GitHub Actions job, the actual published interpreter executes the same files and its output is compared byte-for-byte.

This does **not** guarantee arbitrary modified programs will work or that future releases will preserve the syntax. Refer to [feature status](/reference/status) and the [source-of-truth policy](/reference/evidence).

Continue with [loops](/tutorials/repeat-and-loops), [source modules](/tutorials/modules-walkthrough), or the [beginner glossary](/guide/glossary).
