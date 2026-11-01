# Build a program with source modules

**Requires Scarp v0.0.5-alpha.1.** Earlier v0.0.4-alpha.4 packages do not support `import`.

Source modules are local `.srp` files. An import has an explicit alias; a library exposes only its `pub` functions and supported immutable scalar constants. This walkthrough uses the exact code from the published compiler's [module demo](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp).

## 1. Create your folder layout

```text
my-program/
  main.srp
  modules/
    settings.srp
    linear.srp
```

## 2. Create a settings module

Save `modules/settings.srp`:

```scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
```

These are **literal scalar constants**; modules do not initialize runtime global state. A library cannot export a mutable `var` or a runtime-computed value. Use a public function for calculations.

## 3. Create a numerical function module

Save `modules/linear.srp`:

```scarp
import "settings.srp" as settings;

pub pure funcra predict(features: vector) -> vector
    needs len(features) == 2;
    ensures len(result) == 2;
{
    bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
    return scale(matvec(weights, features), settings.gain);
}
```

`settings.srp` is resolved **relative to `linear.srp`**, not relative to the current shell folder. `pure` means this function cannot use output or impure user calls. `needs` and `ensures` are executable checks—not static mathematical proofs.

## 4. Create an entry script

Save `main.srp`:

```scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;

bind scores = linear.predict([2.0, 1.0]);
print(settings.title);
print(scores);
print(argmax(scores), onehot(len(scores), argmax(scores)));
```

From the `my-program` directory, run:

```sh
scarp check main.srp
scarp run main.srp
```

Expected stdout of `run`:

```text
Modular inference
[4.0, 1.0]
0 [1.0, 0.0]
```

The corresponding conformance fixture includes all three files and checks the output byte-for-byte against the pinned prerelease.

## 5. Understand the boundaries

The CLI trusts the parent of the entry script as its import root. Paths must be portable `/`-separated relative `.srp` names inside that root. Absolute paths, path traversal escaping the root, network imports, wildcard imports, import cycles, runtime module globals, and re-exports are unsupported.

Library files permit imports, functions and scalar literal declarations, but no top-level output or mutable globals. See [source-module reference](/language/modules) and [import/security boundaries](/reference/source-loading).

**Compiler evidence:** [module reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md), [main fixture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp), [linear module](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/modules/linear.srp).
