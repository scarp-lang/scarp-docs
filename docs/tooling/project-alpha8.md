# Published Scarp alpha.8 project CLI and test commands

<!-- scarp-current-release: v0.0.6-alpha.8 -->
<!-- scarp-cli-release: v0.0.6-alpha.8 -->
<!-- scarp-current-source: 37253e7805c0ca594560700dd1deb3928458e60d -->

This is the verified **v0.0.6-alpha.8** command reference, pinned to [compiler source 37253e7805c0ca594560700dd1deb3928458e60d](https://github.com/scarp-lang/scarp/tree/37253e7805c0ca594560700dd1deb3928458e60d). The previous alpha.7 release **does not** contain the new declarative-project, assertion or test-runner workflow. See the [full runnable calculator tutorial](/tutorials/calculator-alpha8) for real files and [official published prerelease](/releases/v0.0.6-alpha.8) for checksums.

## Create, verify, run and inspect projects

~~~sh
scarp init my-calculator
scarp verify my-calculator
scarp run my-calculator
scarp project info --json my-calculator
~~~

~~~sh
scarp test --list examples/projects/calculator
scarp test --require-tests examples/projects/calculator
scarp test --json --filter input examples/projects/calculator
~~~

~~~scarp
assert(2 + 2 == 4);
assert(2 + 2 == 4, "math should be correct");
~~~

~~~text
project "calculator" {
    version: "0.1.0"
    entry: "src/main.srp"
    type: "application"
    dependencies {}
}
~~~

`scarp init DIRECTORY` creates a **new** `scarp.project` project, refusing existing directories, including an empty one. `scarp verify` checks project source without executing normal runtime statements; `scarp run` **executes** the configured entrypoint. Without a directory, those commands operate on the **current working directory** when a valid project manifest is present. Single-file `scarp exec FILE.srp` still works.

`scarp project info --json DIRECTORY` reads validated name, version, entrypoint, manifest and format without executing source. JSON schema version 1 includes `schema_version`, `name`, `version`, `entry`, `type`, `manifest` and `format`. Invalid manifests or unsafe paths fail without producing a success JSON record.

The manifest example above is copied from the compiler-tagged calculator project. `dependencies {}` only reserves future grammar: **no registry, dependencies or installation** yet. Entry path must be relative and contained in the project. The legacy `Scarp.project` format remains supported for older `create`/`launch` projects; avoid carrying both formats into one project.

## Understand the test flags

| Action | Published command | Result |
| --- | --- | --- |
| Execute a project test suite | `scarp test DIRECTORY` | Runs every direct `tests/*.srp` program with the actual interpreter |
| Read-only discovery | `scarp test --list DIRECTORY` | Lists tests without executing them |
| JSON report | `scarp test --json DIRECTORY` | Emits one structured report, separating user program output |
| Select a filename substring | `scarp test --filter input DIRECTORY` | Literal, case-sensitive matching; no regex/glob |
| Guard CI against empty tests | `scarp test --require-tests DIRECTORY` | Fails if zero immediate `.srp` tests are found |

Tests are sorted by filename and discovery is **nonrecursive**, limited to **64 immediate files**. A missing or empty `tests/` directory counts as zero tests and ordinarily succeeds; use `--require-tests` for CI. `tests/name.stdin` is optional UTF-8 input for `tests/name.srp`, not shell stdin; each test has its own fixture. Only selected tests should use their matching input. Bounded input, file containment and module safety checks still apply.

## Native boolean assertions

`assert(condition);` or `assert(condition, "literal explanation");` is a Scarp **statement**, not a function. Condition must type-check as `boolean`; an optional message must be a quoted string literal of at most **256 UTF-8 bytes**. The statement is silent on success. On false it fails with source-location diagnostic **E0065**. Static `scarp verify` checks predicate types but does not execute assertions; `scarp test` and `scarp run` do. `assert` is now reserved: rename any historical variable/function using that identifier. The experimental native backends do **not** support this statement.

## Boundaries

Project source is executed only by runtime commands. Neither project-info nor test listing runs program statements. No package manager, lockfile resolution, native `scarp compile`, cross-release compatibility guarantee, or automatic parent-directory discovery is included. Use the exact [alpha.8 release](/releases/v0.0.6-alpha.8), [old alpha.4 workflow](/guide/quickstart-alpha4) and [version-aware command finder](/tooling/command-finder) to avoid mixing behaviors.
