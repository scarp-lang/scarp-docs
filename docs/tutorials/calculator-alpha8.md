# Complete Scarp alpha.8 calculator project: create, run, verify and test

<!-- scarp-current-release: v0.0.6-alpha.8 -->
<!-- scarp-cli-release: v0.0.6-alpha.8 -->
<!-- scarp-current-source: 37253e7805c0ca594560700dd1deb3928458e60d -->

This is a **published, runnable Scarp v0.0.6-alpha.8 tutorial**, not a proposal. The following manifest, module, entrypoint, two test programs and UTF-8 input fixture are copied **byte-for-byte** (excluding Markdown code-fence delimiters) from the published compiler's [calculator project](https://github.com/scarp-lang/scarp/tree/37253e7805c0ca594560700dd1deb3928458e60d/examples/projects/calculator). The pinned source commit is `37253e7805c0ca594560700dd1deb3928458e60d`.

## 1. Understand the project layout

~~~text
calculator/
  scarp.project
  src/
    main.srp
    math.srp
  tests/
    addition.srp
    input.srp
    input.stdin
~~~

Use the exact project files from the [compiler release tag](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.8). For a new empty project, use `scarp init calculator` **only when the directory does not already exist**. The generated project has a starter entrypoint; to reproduce the results below replace its starter files with the tagged calculator's files.

## 2. Exact published files

**`scarp.project`** is Scarp's own declarative metadata format. It is not TOML, JSON or executable `.srp` source. Its `dependencies {}` block is deliberately empty: there is **no package resolution** in alpha.8.

~~~text
project "calculator" {
    version: "0.1.0"
    entry: "src/main.srp"
    type: "application"
    dependencies {}
}
~~~

~~~scarp
pub pure funcra add(left: integer, right: integer) -> integer {
    return left + right;
}
~~~

~~~scarp
import "math.srp" as math;

print(math.add(2, 3));
~~~

~~~scarp
import "../src/math.srp" as math;

assert(math.add(2, 3) == 5);
assert(math.add(-3, 3) == 0, "opposites should cancel");
~~~

~~~scarp
import "../src/math.srp" as math;

bind left = text_to_integer(read_line());
bind right = text_to_integer(read_line());
assert(math.add(left, right) == 42, "the supplied inputs should sum to 42");
~~~

~~~text
17
25
~~~

~~~text
5
~~~

~~~sh
scarp verify examples/projects/calculator
scarp run examples/projects/calculator
scarp project info --json examples/projects/calculator
scarp test --list examples/projects/calculator
scarp test --require-tests examples/projects/calculator
scarp test --json --filter input examples/projects/calculator
~~~

The code fences above appear in this order: project manifest, reusable module, program entrypoint, arithmetic test, input test, `input.stdin`, expected application output and the complete shell workflow. The `src/math.srp` function is declared public and pure; the two tests import it from their own parent directory.

## 3. Verify output and tests separately

Use the shell commands above from the **root of the tagged compiler checkout**, which contains `examples/projects/calculator`. `scarp verify` checks source statically and is silent on success. `scarp run` executes `src/main.srp` and prints **5**. `scarp project info --json` reports read-only, schema-version-1 metadata. `scarp test --list` does not execute test bodies; ordinary `scarp test` and `scarp test --require-tests` do.

The test `addition.srp` uses true boolean assertions. The test `input.srp` receives its *own* matching sibling `input.stdin`, with two UTF-8 lines `17` and `25`; `text_to_integer(read_line())` converts both values and checks they sum to `42`. Test output is separated from the suite's result report.

The `--filter input` option is a **literal, case-sensitive filename substring**, not a regex or glob; it selects `input.srp`. `--json` emits a structured test report, not a stream of application `print` calls. A failing `assert` reports **E0065**. `--require-tests` prevents an empty test suite from being accepted as a successful CI run.

## 4. Important limits and migration

Only immediate `tests/*.srp` files are discovered, with a **64-file** cap. The test directory may be empty and returns a zero-test report unless `--require-tests` is used. Input files belong to individual tests, have bounded size and must remain within the project. Code in tests **really executes**; run only trusted project sources. Legacy `Scarp.project` and `create/launch/exec` remain available.

This is an **interpreter-backed** project workflow: it does not compile to a native executable or install packages. The new `assert` word is reserved; old projects using that identifier may require renaming. [Alpha.8 release](/releases/v0.0.6-alpha.8) · [Alpha.8 CLI reference](/tooling/project-alpha8) · [Version compatibility](/reference/compatibility) · [हिन्दी tutorial](/hi/tutorials/calculator-alpha8).
