# Learn Scarp: a release-aware path from first program to project tooling

<!-- scarp-learning-release: v0.0.6-alpha.1 -->
<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-learning-compiler: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

**Unsure which command belongs to your installed compiler?** Use the [interactive version-aware CLI Command Finder](/tooling/command-finder) to avoid mixing older `run` / `check` with newer static `verify` or project inspection.

**Current compiler:** The newest published prerelease is [v0.0.6-alpha.6](/releases/v0.0.6-alpha.6), introducing bounded redirected program input, explicit text/number conversion and immutable tuples. Study [input](/language/program-input-alpha6), [text](/language/text-foundations-alpha6) and [tuples](/language/tuples-alpha6) after the fundamentals. The earlier [alpha.5 release](/releases/v0.0.6-alpha.5) added [Top-P](/language/nucleus-selection-alpha5) and [Pearson correlation](/language/pearson-correlation-alpha5). The alpha.1 symbol-navigation lesson below remains tied to its original checked examples.

**Learning from a historical prerelease?** After checking the [published alpha.5 numerical APIs](/releases/v0.0.6-alpha.5), follow the [pinned v0.0.6-alpha.4 first program](/guide/first-program-alpha4) and [Scarp by Example course](https://github.com/scarp-lang/scarp-by-example). Those examples use the `scarp verify FILE.srp` and `scarp exec FILE.srp` commands that were available in their tagged versions. The seven stages below remain pinned to their original release evidence.

**Start here if you are new to Scarp.** This track connects complete, compiler-backed lessons from the first program through numerical modeling, project modules, and the symbol-navigation tools introduced in the **[published v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)** prerelease.

Scarp is experimental. There is **no single compiler version guaranteed to run every example from every historical guide**. Each stage names the release used to verify its examples. Read the language concept in order, but **run a sample only with the release named by that lesson**, or test it yourself with another compiler. The general language reference remains pinned to v0.0.5-alpha.1; newer guides are separate release-specific evidence.

## Choose a route

| Your goal | Recommended starting point | What you need |
| --- | --- | --- |
| I've never coded in Scarp | [Stage 1: foundations](#stage-1-foundations) | A text editor and the tutorial's **alpha.1** release if executing its exact original fixtures |
| I can write basic `bind`, `var` and `funcra` | [Stage 2: modules and numerical examples](#stage-2-modules-and-numerical-examples) | The separately tested **alpha.1** interpreter |
| I know the basic syntax and want newer data tools | [Stage 3: alpha.2 collections](#stage-3-typed-values-collections-and-diagnostics) | **v0.0.5-alpha.2** for alpha.2 examples |
| I need file-checking tools | [Stage 4: static CLI](#stage-4-static-compiler-cli) | **v0.0.5-alpha.3** |
| I want an actual project directory | [Stage 5: projects](#stage-5-verified-project-workflow) | **v0.0.5-alpha.4** |
| I want project-wide module inspection | [Stage 6: project module inspection](#stage-6-project-module-inspection) | **v0.0.5-alpha.5** |
| I want the newest released tooling | [Stage 7: navigation and RMS](#stage-7-source-navigation-and-rms) | **v0.0.6-alpha.1** |

Use the [step-by-step alpha.6 installer](/guide/installation-alpha6) for platform-specific download, checksum and source-build commands. For a **fresh alpha.6 installation**, select the Windows x64, Linux x64 or macOS ARM64 archive and its matching checksum from the [published alpha.6 release](/releases/v0.0.6-alpha.1). Compare the SHA-256 digest **before executing** the downloaded binary. The older [alpha.5 installation walkthrough](/guide/installation-alpha5) is historical and its archive names do not identify alpha.6 packages. Check the executable you actually invoke:

~~~sh
scarp version
~~~

If you are unable to run one of the older binaries, you can still read that historical syntax lesson; use the newer [alpha.6 project lab](/tutorials/project-symbol-navigation-alpha6) for an independently verified, current end-to-end run instead of assuming compatibility.

## Stage 1: Foundations

<!-- scarp-learning-stage: foundations v0.0.5-alpha.1 -->

**Pinned sample release: [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1).** Learn what a UTF-8 `.srp` source file is, and why statements end with `;`.

1. [Your first program](/guide/first-program): create a small `.srp` file and distinguish the historical `scarp run` command from the newer Scarp-first CLI.
2. [Variables and scopes](/language/variables): immutable `bind`, mutable `var`, assignment, and shadowing.
3. [Typed functions](/tutorials/verified-functions): write `funcra`, return values, and read parameter contracts.
4. [Repeat and while loops](/tutorials/repeat-and-loops): choose an iteration form and understand its bounds.
5. [Output and newlines](/tutorials/verified-output): learn how program stdout is produced.

**Checkpoint:** Explain why `bind` cannot be reassigned, identify a function's return type, and predict the output of one of the pinned examples **before checking its `.stdout` fixture**. Historical alpha.1 `check` has different semantics from alpha.3's static `verify`; do not call them equivalent.

## Stage 2: Modules and numerical examples

<!-- scarp-learning-stage: modules-numerics v0.0.5-alpha.1 -->

**Pinned sample release: v0.0.5-alpha.1.** This stage develops practical, supported numerical programming, not full tensors, automatic differentiation or a GPU runtime.

1. [Source modules walkthrough](/tutorials/modules-walkthrough): use relative `import`, `pub` and local source modules.
2. [Verified vectors](/tutorials/verified-vectors): learn `len`, `sum`, `mean`, `dot`, and element-wise operations.
3. [Verified tiles](/tutorials/verified-tiles): operate on the limited numerical tile representation.
4. [Classification and probabilities](/tutorials/verified-classification): read a complete small matrix inference example, `softmax` and `onehot`.

**Checkpoint:** Explain why importing a file is not downloading a package, and reproduce a pinned vector or classification program's output with its **named alpha.1 interpreter**. Refer to [the 11 baseline conformance programs](/reference/evidence); the examples are tested, not merely syntax sketches.

## Stage 3: Typed values, collections and diagnostics

<!-- scarp-learning-stage: collections-diagnostics v0.0.5-alpha.2 -->

**Pinned sample release: [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2).** These capabilities must **not** be retroactively labeled alpha.1 features.

1. [Typed bindings and conversions](/language/typed-bindings-alpha2): understand explicit numeric conversions and typed declarations.
2. [Bitwise operators](/language/bitwise-operators-alpha2): masks, shifts and error conditions.
3. [Unicode and text queries](/language/unicode-text): distinguish character queries from raw bytes.
4. [Integer collections, scores and probabilities](/tutorials/alpha2-collections-and-learning): read exact published source and stdout.
5. [Diagnostics and repairs](/tutorials/alpha2-diagnostics-and-repairs): recognize failing examples and avoid treating diagnostics as successful output.

**Checkpoint:** Match a valid alpha.2 example to its documented result, then explain one negative test and the relevant error behavior. The [alpha.1 → alpha.2 upgrade readiness test](/reference/upgrade-readiness) checks **11 selected old programs**, not universal compatibility.

## Stage 4: Static compiler CLI

<!-- scarp-learning-stage: static-cli v0.0.5-alpha.3 -->

**Pinned command release: [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3).**

1. [File-oriented alpha.3 quickstart](/guide/quickstart-alpha3) introduces `scarp exec FILE.srp` and `scarp verify FILE.srp`.
2. [Scarp-first CLI reference](/tooling/cli) explains `inspect`, `diagnose` and error formats.
3. [Release-specific alpha.3 examples](/releases/v0.0.5-alpha.3) show which code and output are actually verified.

**Checkpoint:** Distinguish static `verify` from executing code with `exec`. Do **not** use `create` or `launch` in an alpha.3-only environment: they first appeared in the next published stage.

## Stage 5: Verified project workflow

<!-- scarp-learning-stage: projects v0.0.5-alpha.4 -->

**Pinned command release: [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4).**

1. [Project quickstart](/guide/quickstart-alpha4) introduces `scarp create`, `verify PROJECT_DIRECTORY` and `launch PROJECT_DIRECTORY` using a **real compiler-generated `Scarp.project`**.
2. [File-to-project migration](/guide/migrate-alpha3-to-alpha4) compares earlier alpha.3 file commands with the new directory workflow.
3. [Project release details](/releases/v0.0.5-alpha.4) explain manifest versioning and source safety.

**Checkpoint:** Create a **new** directory (the command refuses to overwrite existing folders), locate its exact entrypoint, verify it without running ordinary statements, and launch the interpreter. No package registry or native `.srp` executable build is implied.

## Stage 6: Project module inspection

<!-- scarp-learning-stage: project-inspection v0.0.5-alpha.5 -->

**Pinned command release: [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5).**

1. [Alpha.5 CLI reference](/tooling/cli-alpha5) adds static `scarp inspect modules --json PROJECT_DIRECTORY`.
2. [Alpha.5 release notes](/releases/v0.0.5-alpha.5) explain which project inspect behavior is newly verified.
3. [Experimental C11 API boundary](/reference/c11-backend-alpha5) distinguishes the **Rust embedding-only emitter** from the **nonexistent** `scarp compile` command.

**Checkpoint:** Explain the difference between an explicit project directory and automatic workspace discovery (the latter is not shipped). A source file may be checked without launching the program; an inspect result is not a runtime trace.

## Stage 7: Source navigation and RMS

<!-- scarp-learning-stage: navigation-rms v0.0.6-alpha.1 -->

**Pinned release: [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)**, published November 5, 2026 from compiler source `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`.

1. [Complete two-file project lab](/tutorials/project-symbol-navigation-alpha6) is the recommended **current end-to-end example**. It includes an exact tagged module, a generated-manifest layout, and expected stdout `30`.
2. [Symbol and reference inspection](/tooling/cli-alpha6) teaches schema-v1 JSON, local definitions, reference targets and source spans.
3. [Root-mean-square (RMS)](/language/rms-alpha6) introduces the published numerical builtin, finite inputs, bounds and errors.
4. [Published alpha.6 release evidence](/releases/v0.0.6-alpha.1) lists exact source, assets and limitations.

After creating and editing the project as instructed in the lab, run the following in the **parent folder** of `navigation-lab`:

~~~sh
scarp verify navigation-lab
scarp inspect symbols --json navigation-lab
scarp inspect references --json navigation-lab
scarp launch navigation-lab
~~~

**Checkpoint:** Confirm `launch` prints `30` followed by a newline. Find both shadowed `base` declarations and the imported `adjust` definition in the static inventory. Explain why symbol IDs cannot be saved and reused after recompilation. **No LSP server, automatic rename, incremental cache, general tensors, or native `.srp` code generation is included.**

## Final practice: a version-matched capstone

This is a learning exercise, **not** a new officially verified program. Use the unmodified [alpha.6 project lab](/tutorials/project-symbol-navigation-alpha6) as your reference and work through these checks.

- **Source map:** identify the entry file, imported module, public functions/constants, and private declaration.
- **Static safety:** use `verify` and both JSON inspectors; compare definitions with their references before you change code.
- **Runtime check:** use `launch`; compare the untouched project with the pinned `30` stdout. If you edit the code, **its output is no longer guaranteed to match the published fixture**.
- **Version reasoning:** explain why the historical `run`/`check` examples, alpha.4 projects, and alpha.6 symbols belong to different release-scoped guides.

Continue to [feature status](/reference/status), [version compatibility](/reference/compatibility), and [evidence methodology](/reference/evidence). All published packages here remain prereleases; completion of these stages does not imply stable language APIs or unsupported future features.
