# How Scarp documentation is verified

## Latest published alpha.5 compiler evidence

[Scarp v0.0.5-alpha.5](/releases/v0.0.5-alpha.5) was published November 4, 2026 from pinned source `2eeed0aa52ccb59523307841ad8ffbd83f8911a8`. The GitHub release contains three native archives, matching sidecar checksums, and SHA256SUMS. It is a prerelease, not stable.

Docs carry the [scalar-repeat source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/examples/native_scalar_repeat.srp) and **byte-exact** stdout. CI builds the tagged alpha.5 compiler and checks static verify, interpreter exec, identical file/project module JSON inventory, the legacy alias, and invalid-manifest diagnostics. Experimental C11 emission is a **Rust-only embedding API**; no native compile CLI has shipped. See [C11 limits](/reference/c11-backend-alpha5).

This site targets the **published v0.0.5-alpha.1 Scarp prerelease**. We treat compiler source, tests, actual release fixtures, and published artifacts as evidence. Design proposals and open pull requests are **not** proof that a feature shipped.

**New release:** Scarp [v0.0.5-alpha.2](/releases/v0.0.5-alpha.2) was published on November 2. It now has **12 additional, separately pinned programs and 28 upstream Git blob hashes** across the [release guide](/releases/v0.0.5-alpha.2) and [collections tutorial](/tutorials/alpha2-collections-and-learning). `npm run check:alpha2` checks the complete bilingual release-page code/output fences and byte-for-byte fixture provenance; the `alpha2-conformance` CI job checks out exact source commit `e4db8e191cd7ea623123cae7348450ca6c95b170`, builds the published compiler, and tests those programs. The 11-case suite below remains tied only to alpha.1—these are **two distinct release suites**, not a claim that the main docs baseline was already migrated.

## Negative diagnostic conformance

The published [alpha.2 errors and repairs tutorial](/tutorials/alpha2-diagnostics-and-repairs) adds **six intentionally failing programs** and **14 additional pinned test-fixture files** (source, stderr and required module dependencies). `npm run check:alpha2-errors` verifies their upstream Git blob SHA-1 identifiers and requires full source/expected-stderr code fences in both English and Hindi, including imported support files. The independent `alpha2-conformance` job additionally compares each fixture to the published compiler test checkout and runs `check` and `run`, expecting exit code 1, empty stdout and published diagnostic stderr (with only absolute imported-module filesystem path labels normalized to the snapshot filenames). These are **negative** conformance cases—not additional successful examples, and they do not change the twelve successful alpha.2 or eleven alpha.1 cases.

## Upgrade readiness verification

The [alpha.1 → alpha.2 upgrade gate](/reference/upgrade-readiness) runs the original **11 source/output fixtures** on the released alpha.2 compiler, independently of the alpha.1 baseline job and the 12 newer alpha.2 examples. It requires success for each `check`, byte-identical `run` stdout, and a tokenization smoke test. The old manifest and baseline remain pinned to alpha.1. This tests a defined set of examples rather than promising compatibility for arbitrary programs.

## Historical published alpha.3 evidence

The [v0.0.5-alpha.3 release guide](/releases/v0.0.5-alpha.3) is a **third independent release track**, pinned to compiler commit `7715c28df09c7703b39e14fddb963275b25df476`. `npm run check:alpha3` verifies four full bilingual source/stdout examples, their imported module, the published E0015 diagnostic JSON fixture and **11 upstream Git blob hashes**. The `alpha3-conformance` GitHub Actions job additionally builds that exact compiler and runs `verify` (static), `exec` (runtime), legacy `run` and new inspection/diagnostic commands. This does **not** rename the original 11 alpha.1 or 12 alpha.2 cases, nor assert universal compatibility with the newest release.

## Three independent validation layers

1. **Markdown and navigation:** `npm run check:docs` detects missing local links/anchors, unsupported code-fence names, broken navigation targets and mismatched site configuration. It does not prove that external web links load.
2. **Published fixture provenance:** `npm run check:fixtures` validates the source/output pairs and checks the Git blob SHA-1 of **all 24 mirrored files** against IDs from the published compiler tag's tree. CI additionally compares each mirrored byte sequence to the checked-out compiler examples.
3. **Compiler execution:** GitHub Actions checks out commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671`, builds the released Rust interpreter, then runs `check` and `run` on 11 examples and verifies their stdout byte-for-byte. It also exercises `tokens`.

The CI job additionally checks that published-tag compiler source links in these pages correspond to paths present in that pinned checkout. It does **not** claim that arbitrary external URLs have been checked over HTTP or that every Markdown code block is executed.

The separate `npm run check:snippets` and `npm run test:snippets` steps reject common deprecated syntax in executable Markdown examples. They do not attempt to parse or run arbitrary Scarp programs. The `npm run check:tutorial-evidence` gate requires all 11 compiler programs to appear unchanged in bilingual tutorials, while compiler conformance independently verifies byte-exact runtime output.

## Reproduce the checks

```sh
npm run check:docs
npm run check:fixtures
```

For compiler-backed checks, obtain a local checkout of exactly the pinned commit, then run:

```sh
npm run check:fixtures -- /path/to/scarp/examples
npm run check:evidence -- /path/to/alpha1 /path/to/alpha2
npm run test:compiler -- /path/to/scarp/target/debug/scarp
```

The `test:compiler` step requires a built Scarp binary. Its version-string check catches obvious mismatches, while the checkout commit and blob checks protect the test source baseline. These are **test/verification procedures**, not newly implemented Scarp CLI commands.

## Updating for a new release

Change the pinned commit and feature claims only together with the compiler tag, a reviewed set of examples, and a passing CI run. If `main` gains a feature that is not yet released, mark it **development-only** or omit it from the shipped guide. See the [feature status](/reference/status) and [maintenance checklist](/project/maintenance).
