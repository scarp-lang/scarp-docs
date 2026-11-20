# Project testing and output fixtures in Scarp alpha.15

<!-- scarp-cli-release: v0.0.6-alpha.15 -->
<!-- scarp-current-source: a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281 -->

The [published alpha.15 interpreter](/releases/v0.0.6-alpha.15) runs project tests as ordinary Scarp programs. The project runner shipped in [alpha.8](/tooling/project-alpha8), structured failures in [alpha.9](/tooling/test-json-v2-alpha9), and exact stdout and stderr fixtures in [alpha.10](/tooling/interactive-input-alpha10).

## Discover and run tests

From the project root, use these commands:

~~~sh
scarp test --list
scarp test --json=v2 --require-tests
scarp test --json=v2 --require-tests --filter greeting
~~~

The runner validates the manifest and project entrypoint, then examines up to 64 immediate `tests/*.srp` files in filename order. It checks filename and path constraints before applying a literal, case-sensitive filter. Listing does not compile tests or open their fixtures. An empty selection succeeds by default. In CI, `--require-tests` makes an empty selection fail.

## Compare exact output

Create a project with `scarp init greetings`, then add `tests/greeting.srp` under the project root:

~~~scarp
bind name = read_line();
assert(name == "नमस्ते", "unexpected input");
print(name);
eprint("done");
~~~

| File | Exact UTF-8 contents |
| --- | --- |
| `tests/greeting.stdin` | `नमस्ते` followed by LF |
| `tests/greeting.stdout` | `नमस्ते` followed by LF |
| `tests/greeting.stderr` | `done` followed by LF |

Each companion is optional, limited to **1 MiB**, and must be a regular file inside the project. An empty stdout or stderr fixture requires an empty stream. The runner compares bytes, including spaces and line endings. The input fixture is per test. The test runner does not forward terminal stdin or enable interactive prompts. Run test sources you trust.

## Interpret a failure

A per-test failure returns status **1** and still emits a complete JSON report. Schema 2 labels failures `compile`, `fixture`, or `runtime`. An output mismatch is a runtime failure and identifies the stream, first mismatched byte offset, and expected and actual lengths. Both JSON schemas omit the captured streams and comparison bytes. Explicit diagnostic messages can still contain user-written text. Invalid arguments return **2**. Manifest or discovery errors are reported on stderr without a test report.

[Tagged compiler testing contract](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/docs/project-testing.md) · [Tagged fixture regression tests](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/tests/scarp_test_stdin_fixtures.rs#L194) · [Command Finder](/tooling/command-finder)
