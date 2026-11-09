# Verified examples

## Published numerical examples (v0.0.6-alpha.4)

The dedicated [Scarp by Example course](https://github.com/scarp-lang/scarp-by-example) is the primary destination for runnable learning programs; the compiler repository retains its regression fixtures.

- [Lesson 12 — Temperature softmax](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/12-temperature-softmax.srp) (`softmax_temp`, `logsoftmax_temp`, deterministic `topk`).
- [Lesson 13 — Cosine similarity](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/13-cosine-similarity.srp).
- [Lesson 14 — Cumulative sampled area](https://github.com/scarp-lang/scarp-by-example/blob/main/examples/06-ai-foundations/14-sample-cumulative-area.srp).

All three examples have exact `.stdout` companions copied from immutable compiler tag `v0.0.6-alpha.4` and are being reviewed in [the course migration PR](https://github.com/scarp-lang/scarp-by-example/pull/57). Until that PR merges, follow its branch links rather than assuming `main` contains these lessons. The [published numerical kernel API guide](/language/scientific-kernels-alpha4) describes signatures, release requirements and limitations.


The official [compiler examples directory](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/examples) contains `.srp` files paired with expected `.stdout` files. These are compiler-owned fixtures, not invented syntax samples.

## Current alpha.6 project tutorial

Follow the [complete, verified two-file project and symbol-navigation lab](/tutorials/project-symbol-navigation-alpha6). It recreates the published alpha.6 source under a real `Scarp.project`, checks symbols and references without executing, and confirms the exact interpreter output. The older examples below remain pinned to the alpha.1 baseline.

## Learn from first program to compiler tooling

Start with the [seven-stage, release-aware learning path](/guide/learning-path), then return here for complete compiler-owned examples. Different stages use **different published compiler versions**; do not assume all historical examples work with the latest prerelease.

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

## Latest published alpha.2 examples

The [newer v0.0.5-alpha.2 release examples](/releases/v0.0.5-alpha.2) and [collections and learning tutorial](/tutorials/alpha2-collections-and-learning) add **12 separately pinned programs** across the release, collection and [multi-file module tutorial](/tutorials/alpha2-module-constants-and-inspection) with checked sources and stdout, plus tested module text/JSON inspection. These do **not** change the older release baseline for the examples below.

## Automatically checked documentation fixtures

The official examples above are also mirrored in the documentation repository's [conformance fixtures](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/programs). The CI conformance job checks out **exactly** the published compiler source commit, compiles that interpreter, and tests 11 `.srp` programs with `check` and byte-exact `run` output. It also performs a `tokens` smoke test. A changed example cannot pass merely because its code looks plausible.

For a learning path, start with the [verified functions walkthrough](/tutorials/verified-functions), study [counted and conditional loops](/tutorials/repeat-and-loops), learn [newlines and output streams](/tutorials/verified-output), then continue with [compiler-verified numerical vectors](/tutorials/verified-vectors) and the [verified tiles tutorial](/tutorials/verified-tiles), [classification and probability tutorial](/tutorials/verified-classification), and [three-file module tutorial](/tutorials/modules-walkthrough). All 11 mirrored compiler programs now appear in bilingual, fixture-checked tutorials.
