# Build your first Scarp project with symbol navigation (alpha.6)

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-project-lab: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

**A complete, beginner-friendly project tutorial for the [published Scarp v0.0.6-alpha.1 prerelease](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1).** It uses the exact [symbol-navigation example](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/symbol_navigation.srp), [imported module](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/modules/navigation_values.srp), and [expected stdout](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/examples/symbol_navigation.stdout) from the tagged compiler source. The source commit is [`aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`](https://github.com/scarp-lang/scarp/commit/aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8).

You will create a real project, organize two source files, check code without running it, explore definitions and references, and finally execute the project. **This is interpreter-backed Scarp, not native compilation.** Start with the [alpha.6 installation and checksum instructions](/releases/v0.0.6-alpha.1) if you have not installed the compiler. Older alpha.5 builds cannot run the symbol/reference inspection commands.

## 1. Understand the folder structure

A *project* is a directory with a small `Scarp.project` manifest. A *module* is another `.srp` file your code imports. We will keep the entry script in `src/main.srp` and its imported module next to it, under `src/modules/`.

~~~text
navigation-lab/
  Scarp.project
  src/
    main.srp
    modules/
      navigation_values.srp
~~~

From the **parent directory** where you want this project, run `scarp create navigation-lab`. Choose a location where `navigation-lab` does **not already exist**. The command refuses to adopt or overwrite an existing directory, even an empty one. It generates `Scarp.project` and `src/main.srp`. Create the additional `src/modules/` directory yourself and replace the generated `main.srp` with the full source below.

The compiler's generated manifest is exactly:

~~~text
scarp-project: 1
name: navigation-lab
entry: src/main.srp
~~~

The manifest version is `1`. Its `entry` must be a relative `.srp` file inside the project. This is a small development manifest, **not** a package manager, a dependency file, or a project-wide search mechanism.

## 2. Add your reusable module

Create `navigation-lab/src/modules/navigation_values.srp` and save the following code exactly:

~~~scarp
bind private_seed = 2;
pub bind offset = private_seed;
pub pure funcra adjust(n: integer) -> integer { return n + offset; }
~~~

Here `bind private_seed` is private to this module. The `pub` keyword exports `offset` and `adjust` to importing source files. `pure funcra adjust` is a typed function with no output side effects. `offset` is a module scalar constant—not a mutable runtime global.

## 3. Write the main entrypoint

Replace the generated `navigation-lab/src/main.srp` with the full published example:

~~~scarp
import "modules/navigation_values.srp" as library;

bind base = library.offset;
pure funcra twice(value: integer = library.offset) -> integer
    needs value >= 0;
    ensures result == value * 2;
{
    return value * 2;
}

var total = 0;
repeat 3 as step {
    bind base = twice(value: library.adjust(n: base + step));
    total += base;
}
print(total);
~~~

Read the code in order: `import "...srp" as library` gives a local alias; `library.offset` accesses a public module symbol; `pure funcra twice` declares a typed function; `needs` and `ensures` check pre- and postconditions **at runtime**; `var total` allows assignment; and `repeat` runs a counted loop. The inner `bind base` shadows the outer name without changing the outer binding.

The import path is resolved **relative to `src/main.srp`**, not relative to your terminal's current working directory. Keep the module under `src/modules/` exactly as shown.

## 4. Verify, inspect, then launch

Run the following commands from the **parent** of `navigation-lab`, using the published alpha.6 `scarp` executable:

~~~sh
scarp version
scarp create navigation-lab
scarp verify navigation-lab
scarp inspect modules --json navigation-lab
scarp inspect symbols --json navigation-lab
scarp inspect references --json navigation-lab
scarp launch navigation-lab
scarp exec navigation-lab/src/main.srp
~~~

What happens?

| Command | Purpose | Executes ordinary program statements? |
| --- | --- | --- |
| `scarp create navigation-lab` | Generate a **new** project before editing files | No; writes project scaffold files |
| `scarp verify navigation-lab` | Parse and statically check the entrypoint and imports | **No**; successful verification is silent |
| `scarp inspect modules --json navigation-lab` | Show a static inventory of loaded modules | No |
| `scarp inspect symbols --json navigation-lab` | List definitions and declarations in the source graph | No |
| `scarp inspect references --json navigation-lab` | List where the compiler resolves those symbols | No |
| `scarp launch navigation-lab` | Run the project's manifest entrypoint | **Yes**, through the interpreter |
| `scarp exec navigation-lab/src/main.srp` | Run the same entry file directly | **Yes**, through the interpreter |

**Important:** The table groups the commands in learning order: run `create` only once, **edit both source files before running `verify`**, then execute the rest. `verify` does compile-time checking, including constant evaluation, but does not execute the program's ordinary statements or runtime contracts.

Both `launch` and `exec` produce the same exact stdout:

~~~text
30
~~~

## 5. Learn symbols and references

A *symbol* is a named definition such as `library`, `twice`, `total`, `offset`, or `adjust`. A *reference* is a code location that **uses** a symbol. The two alpha.6 inspectors produce distinct JSON responses:

| Inspector | Required JSON kind | What you can learn |
| --- | --- | --- |
| `inspect symbols --json` | `scarp.symbols` | Where functions, imports, constants, parameters, and bindings were defined |
| `inspect references --json` | `scarp.references` | Which reads, writes, calls, and named-argument labels refer to those definitions |

Both responses have `schema_version: 1`. The `files` array identifies discovered source files; `symbols` holds definitions; and the references view additionally contains `references`. Each reference's `target` is a symbol ID **from the same snapshot**. Byte spans use half-open UTF-8 offsets; human-readable line/column positions are one-based Unicode-scalar positions.

Try finding the distinct `base` definitions, the `library` alias, and the `adjust` function. A reference to the imported function navigates to the module's definition, while a named argument such as `n:` links to its parameter. Symbol IDs are **not stable across edits**. Neither command is an LSP server or a rename feature. See [alpha.6 CLI symbols reference](/tooling/cli-alpha6).

## 6. Fix common mistakes safely

| Symptom | Explanation and next step |
| --- | --- |
| `create` refuses `navigation-lab` | The folder already exists; **do not delete it blindly**. Reuse the tutorial files you created or select a fresh name and matching manifest |
| `verify` cannot find a module | Check the spelling and exact location of `src/modules/navigation_values.srp` |
| The project directory is rejected | Ensure `Scarp.project` exists in the supplied directory with the three fields in order; there is **no implicit parent-directory lookup** |
| `inspect symbols` is unrecognized | Confirm `scarp version` reports alpha.6, not alpha.5 |
| A command fails but prints no inventory | Inspection reports errors on stderr and does **not** emit a successful partial JSON index |

Usage errors generally exit **2**; invalid projects, source errors, and runtime failures generally exit **1**. The `--diagnostic-format=json` flag formats **error diagnostics on stderr**; `--json` formats **successful inspection data on stdout**.

## 7. Check your understanding

1. Why must an imported name be marked `pub` before another file can use it?
2. What is the difference between `verify` and `launch`?
3. Which inspector would help find every call to `twice`?
4. Why should an editor refresh symbol IDs after you change source code?

You can answer by reviewing your files and inspecting JSON—no additional Scarp features are required.

**Reproducibility:** This guide's `Scarp.project`, complete files, and stdout are mirrored under [`conformance/alpha6-project/`](https://github.com/scarp-lang/scarp-docs/tree/main/conformance/alpha6-project). TypeScript evidence checks compare both language versions with the tagged source, and CI runs the project using the exact published compiler commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`. The [alpha.6 release guide](/releases/v0.0.6-alpha.1) states the compiler's wider version limits.
