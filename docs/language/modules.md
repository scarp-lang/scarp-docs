# Source modules

**For a complete verified walkthrough**, see the [modules, visibility and static-inspection guide](/language/modules-and-visibility): three-file alpha.1 imports, alpha.2 public/private metadata, JSON output and tagged visibility/cycle diagnostics.

**Available in v0.0.5-alpha.1.** Earlier v0.0.4-alpha.4 binaries did **not** have imports. Source modules are local `.srp` files with explicit aliases and a constrained public declaration model.

**New in published [v0.0.5-alpha.2](/tutorials/alpha2-module-constants-and-inspection):** module constant initializers now support restricted compile-time scalar expressions, and `scarp modules` can display static import/declaration metadata or schema-version-1 JSON. The tutorial includes complete multi-file source and checked stdout. Below, the original alpha.1 behavior and examples remain version-specific; alpha.1 supported only scalar literal module constants.

## Importing a module

A top-level entry file may use:

~~~scarp
import "modules/settings.srp" as settings;
print(settings.title);
~~~

The corresponding `modules/settings.srp` can contain:

~~~scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
~~~

The first example prints `Modular inference`. The compiler's [module demo](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp) exercises both public values and a public numerical function.

## What a library file can export

Use `pub` for **functions** and **immutable scalar literal constants**. A library source file contains imports, functions, and scalar literal bindings. It cannot contain file-level print calls, loops, mutable bindings, vector/tile constants, or computed constant initializers. Put computation inside functions.

A public function can be called as `alias.name(...)`, and a public constant can be read as `alias.name`. Imports are not re-exported, and wildcard imports and multi-hop qualified names are unsupported. Function bodies in the importing file cannot capture arbitrary caller locals.

## Path and security rules

Imports are resolved relative to the *importing file*, with `/` separators and a `.srp` extension. The CLI trusts the entry file's parent folder as the root. Absolute paths, escaping the root with `..`, backslashes, URLs, and package/network imports are rejected. Cyclic imports also fail. This is not a security sandbox against concurrent filesystem changes by an attacker.

The module loader limits file count, depth, byte sizes, and import count; see the [runtime budget and module-limit reference](/reference/budgets). Rust embedders can use a custom in-memory loader.

For a complete runnable entry file with two local imports, follow the [three-file module tutorial](/tutorials/modules-walkthrough). For default limits and threat boundaries, read [source loading](/reference/source-loading).

**Verified against:** [module reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md), [module source fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/linear.srp), [module tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/modules.rs).
