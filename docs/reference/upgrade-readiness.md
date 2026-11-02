# Upgrade readiness: Scarp alpha.1 → alpha.2

**Source baseline:** [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) (`afe8b5380c9d6c4774162e51c6c9bc8b90901671`). **Target release:** [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) (`e4db8e191cd7ea623123cae7348450ca6c95b170`), published November 2, 2026.

This page is the first **release-migration verification gate** for Scarp Docs. It checks whether the original **11 published alpha.1 executable fixtures** run unchanged on the newer published compiler. This test does not rename the main reference baseline, and it does not establish full backward compatibility for arbitrary source programs.

## What the upgrade test actually does

The separate `alpha2-conformance` GitHub Actions job checks out and builds the **exact published alpha.2 compiler commit**. The TypeScript command `test:alpha2-backcompat` then reads the original [alpha.1 fixture manifest](https://github.com/scarp-lang/scarp-docs/blob/main/conformance/manifest.json), without copying or updating any source files:

1. Confirm that the compiler prints the expected **alpha.2** version and both manifest source identities remain pinned.
2. Run `scarp check` on each original `.srp` entry program and require exit code 0 with no stdout/stderr.
3. Run `scarp run` on the same original program and compare all stdout **bytes** with its original alpha.1 `.stdout` fixture (including the final newline), requiring exit code 0 and no stderr.
4. Verify the original `hello.srp` still tokenizes using `scarp tokens`.

This complements, but does not replace, the 11-case [alpha.1 baseline conformance](/reference/evidence), the 12-case [alpha.2 feature conformance](/releases/v0.0.5-alpha.2), and the six [alpha.2 negative diagnostic cases](/tutorials/alpha2-diagnostics-and-repairs).

## All 11 programs checked for migration

| Original alpha.1 fixture | Subject being retested on alpha.2 |
| --- | --- |
| `hello.srp` | Basic program output |
| `functions.srp` | Functions, return types and calls |
| `loops.srp` | Conditional and while-loop behavior |
| `repeat.srp` | Counted iteration |
| `output.srp` | Output statements and newline behavior |
| `vectors.srp` | Finite numerical vectors |
| `module_demo.srp` | Relative multi-file module imports |
| `matrix_forward.srp` | Matrix/tile forward operations |
| `matrix_classification.srp` | Classification score calculations |
| `matrix_probabilities.srp` | Probability kernels |
| `matrix_targets.srp` | Target construction |

The original source, imported modules and expected output stay identical to their alpha.1 Git blobs; the only changed test dimension is the **executable version**.

## Reproduce the compatibility gate

Check out the published alpha.2 compiler at commit `e4db8e191cd7ea623123cae7348450ca6c95b170`, build it with Cargo, then, from the **scarp-docs repository root**, run:

~~~sh
npm run test:alpha2-backcompat -- /path/to/alpha2/target/debug/scarp
~~~

On success, the script reports 11 passing checks and a tokens smoke test. Do **not** point it at an alpha.1 binary: its explicit version check will reject that. The [Documentation CI workflow](https://github.com/scarp-lang/scarp-docs/actions/workflows/ci.yml) is the inspectable source of the latest pass/fail result.

## What this does—and does not—prove

A green CI run means that **those particular pinned examples** still pass unchanged on the tested alpha.2 compiler. It is **not** proof that every alpha.1 program, host API, error message, numerical edge case, or third-party project is compatible with alpha.2. Scarp remains an experimental prerelease without a stable language contract.

The main [feature status table](/reference/status), [installation steps](/guide/installation) and older tutorials are still explicitly labeled **alpha.1**. Moving the *entire* reference baseline to alpha.2 needs a separate review of changed syntax, all reference claims and actual compiler execution. See [version compatibility](/reference/compatibility) and the [docs maintenance guide](/project/maintenance).

**Do not treat features merged to compiler `main` after the release tag as published alpha.2 features.**
