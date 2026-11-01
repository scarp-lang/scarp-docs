# Verified examples

The official [compiler examples directory](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/examples) contains `.srp` files paired with expected `.stdout` files. These are compiler-owned fixtures, not invented syntax samples.

## Hello, Scarp

Source: [examples/hello.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/hello.srp).

~~~scarp
print("Hello from Scarp!");
~~~

## Checked arithmetic

~~~scarp
print(1 + 2 * 3);            // 7
print((1 + 2) * 3);          // 9
print(-7 / 2);               // -3
~~~

Source: [arithmetic fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/arithmetic.srp).

## Functions and calls

~~~scarp
funcra add(a: integer, b: integer) -> integer {
    return a + b;
}
funcra square(value: integer) -> integer {
    return value * value;
}
print(add(10, square(5))); // 35
~~~

Source: [function fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/functions.srp).

## Module composition

Read the [multi-file module demo](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp) alongside [linear.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/linear.srp) and [settings.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/settings.srp).

~~~sh
scarp run examples/module_demo.srp
scarp check examples/module_demo.srp
~~~

The relative paths above assume you are at the compiler repository root or using its extracted release package. For a more extensive sample set, see the [official example directory](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/examples). The Scarp source interpreter is prerelease software and its examples are version-dependent.

## Automatically checked documentation fixtures

The official examples above are also mirrored in the documentation repository's [conformance fixtures](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs). The CI conformance job checks out **exactly** the published compiler source commit, compiles that interpreter, and tests seven `.srp` programs with `check` and byte-exact `run` output. It also performs a `tokens` smoke test. A changed example cannot pass merely because its code looks plausible.

For a learning path, try the [counted and conditional loops](/tutorials/repeat-and-loops) and [three-file module tutorial](/tutorials/modules-walkthrough).
