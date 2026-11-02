# How Scarp documentation is verified

This site targets the **published v0.0.5-alpha.1 Scarp prerelease**. We treat compiler source, tests, actual release fixtures, and published artifacts as evidence. Design proposals and open pull requests are **not** proof that a feature shipped.

## Three independent validation layers

1. **Markdown and navigation:** `npm run check:docs` detects missing local links/anchors, unsupported code-fence names, broken navigation targets and mismatched site configuration. It does not prove that external web links load.
2. **Published fixture provenance:** `npm run check:fixtures` validates the source/output pairs and checks the Git blob SHA-1 of **all 18 mirrored files** against IDs from the published compiler tag's tree. CI additionally compares each mirrored byte sequence to the checked-out compiler examples.
3. **Compiler execution:** GitHub Actions checks out commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671`, builds the released Rust interpreter, then runs `check` and `run` on eight examples and verifies their stdout byte-for-byte. It also exercises `tokens`.

The CI job additionally checks that published-tag compiler source links in these pages correspond to paths present in that pinned checkout. It does **not** claim that arbitrary external URLs have been checked over HTTP or that every Markdown code block is executed.

The separate `npm run check:snippets` and `npm run test:snippets` steps reject common deprecated syntax in executable Markdown examples. They do not attempt to parse or run arbitrary Scarp programs. The `npm run check:tutorial-evidence` gate requires all eight compiler programs to appear unchanged in bilingual tutorials, while compiler conformance independently verifies byte-exact runtime output.

## Reproduce the checks

```sh
npm run check:docs
npm run check:fixtures
```

For compiler-backed checks, obtain a local checkout of exactly the pinned commit, then run:

```sh
npm run check:fixtures -- /path/to/scarp/examples
npm run check:evidence -- /path/to/scarp
npm run test:compiler -- /path/to/scarp/target/debug/scarp
```

The `test:compiler` step requires a built Scarp binary. Its version-string check catches obvious mismatches, while the checkout commit and blob checks protect the test source baseline. These are **test/verification procedures**, not newly implemented Scarp CLI commands.

## Updating for a new release

Change the pinned commit and feature claims only together with the compiler tag, a reviewed set of examples, and a passing CI run. If `main` gains a feature that is not yet released, mark it **development-only** or omit it from the shipped guide. See the [feature status](/reference/status) and [maintenance checklist](/project/maintenance).
