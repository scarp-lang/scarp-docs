# Scarp modules: public APIs, imports, and static inspection

<!-- scarp-modules-release: v0.0.5-alpha.1+v0.0.5-alpha.2 -->

This field guide connects **published Scarp module behavior** to full compiler-tested programs: imports and visibility from [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1), plus compile-time scalar constants and the static `scarp modules` inspector from [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2). The [latest published prerelease is alpha.3](/releases/v0.0.5-alpha.3); it is **not a stable language release**.

::: warning Release evidence, not a compatibility promise
The alpha.1 example is pinned to compiler commit `afe8b5380c9d6c4774162e51c6c9bc8b90901671`. The alpha.2 examples and failures are pinned to `e4db8e191cd7ea623123cae7348450ca6c95b170`. Separate CI jobs test them against those exact published compilers. **Do not use alpha.1 for the alpha.2 `modules` command or computed module constants**, and do not infer alpha.3 cross-version compatibility from these examples.
:::

## 1. Build a three-file module graph (alpha.1)

A module is a local UTF-8 `.srp` file. An `import "relative/path.srp" as alias;` declaration lets a source refer to another file's explicitly **public** members. The path is relative to the **importing file**, not always to the entry file.

Create the following hierarchy. Use the unchanged source from the official tagged [module example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/module_demo.srp):

~~~text
module_demo.srp
modules/
  settings.srp
  linear.srp
~~~

First, `modules/settings.srp` declares public immutable scalar constants:

~~~scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
~~~

Next, `modules/linear.srp` imports `settings.srp` **from its own directory** and exports a public pure function:

~~~scarp
import "settings.srp" as settings;

pub pure funcra predict(features: vector) -> vector
    needs len(features) == 2;
    ensures len(result) == 2;
{
    bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
    return scale(matvec(weights, features), settings.gain);
}
~~~

Finally, the entry `module_demo.srp` imports both local files:

~~~scarp
import "modules/linear.srp" as linear;
import "modules/settings.srp" as settings;

bind scores = linear.predict([2.0, 1.0]);
print(settings.title);
print(scores);
print(argmax(scores), onehot(len(scores), argmax(scores)));
~~~

Published expected stdout:

~~~text
Modular inference
[4.0, 1.0]
0 [1.0, 0.0]
~~~

The entry reads `settings.title` and calls `linear.predict(...)`. The function uses `settings.gain` from its own import and performs vector/matrix calculations. The module graph is loaded, checked, and linked before executing the entry. A `pub` declaration is visible across files; private helpers remain accessible only within their defining module.

### Run with the tagged alpha.1 compiler

From the directory containing `module_demo.srp` and the complete `modules/` folder, use the **alpha.1** executable:

~~~sh
scarp --version
scarp check module_demo.srp
scarp run module_demo.srp
~~~

A valid `check` command is silent; `run` writes the three expected lines. The `check` command is **not** the static-only `verify` introduced in alpha.3. See the [original source-module reference](/language/modules) and [loading/security rules](/reference/source-loading).

## 2. Read public and private declarations (alpha.2)

The next complete example is pinned to the [published alpha.2 inspector entry](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/module_inspection.srp).

Create `modules/inspection.srp` first:

~~~scarp
pub bind label = "module tools";
bind offset = 1;

pub pure funcra adjusted(value: integer, step: integer = 2) -> integer
    needs step >= 0;
    ensures result >= value;
{
    return helper(value) + step;
}

pure funcra helper(value: integer) -> integer {
    return value + offset;
}
~~~

Then create the entry file `module_inspection.srp`:

~~~scarp
import "modules/inspection.srp" as tools;
print(tools.label, tools.adjusted(39));
~~~

Expected stdout **only when running the program**:

~~~text
module tools 42
~~~

The library exports public `label` and `adjusted` but keeps `offset` and `helper` **private**. The public function is allowed to call its private helper. The entry can call `tools.adjusted(39)`; it cannot call `tools.helper(...)` or read `tools.offset`.

**Key distinction:** `scarp modules module_inspection.srp` compiles a *static inventory* of imports, dependencies, symbols, visibility, purity, parameter types, and defaults. It **does not execute** the entry's `print` or ordinary function bodies. Private symbols can appear in the inventory, but inspection **does not make them public**. Use `run` to get the shown stdout.

## 3. Understand the alpha.2 JSON inspection format

Save this published self-contained [`inspection_json.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.srp):

~~~scarp
pub bind base: integer = 6;
pub bind answer: integer = base * 7;
pure funcra echo(value: integer = answer) -> integer {
    return value;
}
print(echo());
~~~

Output from **`scarp run inspection_json.srp`**:

~~~text
42
~~~

The published [module JSON snapshot](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.modules.json) is **metadata**, not the runtime output:

~~~json
{"schema_version":1,"entry":0,"modules":[{"id":0,"path":"inspection_json.srp","imports":[],"dependencies":[],"dependents":[],"symbols":[{"name":"base","public":true,"span":[9,13],"kind":"constant","type":"integer"},{"name":"answer","public":true,"span":[37,43],"kind":"constant","type":"integer"},{"name":"echo","public":false,"span":[77,81],"kind":"function","pure":true,"result":"integer","parameters":[{"name":"value","type":"integer","has_default":true,"span":[82,87]}]}]}],"constant_dependencies":[{"source":0,"declaration":[37,43],"target":0,"target_declaration":[9,13],"span":[55,59]}]}
~~~

- `schema_version: 1` identifies the shape of the metadata contract.
- `modules` records source IDs, imports, dependencies, dependents, and public/private symbol records.
- The `symbols` array distinguishes `public: true` from `public: false`, and includes the declared types and function parameters.
- `constant_dependencies` connects `answer` to `base` as a compile-time reference.
- `span` arrays are **half-open, source-local UTF-8 byte ranges**. They are not Unicode character indices.
- The snapshot was produced using an in-memory loader. The filesystem CLI may report different `path` labels, so treat paths as loader-provided display names, **not stable cross-machine identifiers**.

A module constant initialized by `base * 7` is supported in **alpha.2**, but not in the original **alpha.1** literal-only module-constant model. Inspecting modules performs type and import validation, but no runtime program execution. It is **not** a package manager, native code generator, or JSON parser for Scarp code.

### Run and inspect with the tagged alpha.2 compiler

From the directory containing `module_inspection.srp`, `inspection_json.srp`, and the required `modules/` folder, use the **alpha.2** executable:

~~~sh
scarp --version
scarp check module_inspection.srp
scarp run module_inspection.srp
scarp modules module_inspection.srp
scarp modules --json inspection_json.srp
scarp run inspection_json.srp
~~~

Run/inspect are intentionally separate. `modules --json` emits static machine-readable metadata while `run` prints program results. See the [alpha.2 tooling reference](/tooling/alpha2-inspection) and [three-file constant-expression tutorial](/tutorials/alpha2-module-constants-and-inspection).

## 4. Compiler failure: a private imported symbol (alpha.2 E0041)

Visibility is enforced, not merely documented. Place the exact tagged [`library.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/library.srp) alongside `private.srp`:

~~~scarp
// café 🌍
bind secret = 3;
pub bind value = 4;
pub pure funcra take(x: integer) -> integer { return x; }
~~~

Now create the published failing [`private.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/private.srp):

~~~scarp
import "library.srp" as library;
print(library.secret);
~~~

The exact alpha.2 compiler stderr is:

~~~text
error[E0041]: library.secret is private
 --> private.srp:2:7
  |
2 | print(library.secret);
  |       ^^^^^^^^^^^^^^
 = note: the private declaration is here
 --> library.srp:2:6
  |
2 | bind secret = 3;
  |      ^^^^^^
 = help: mark the declaration pub in its defining module
~~~

**Why it fails:** `library.secret` exists but lacks `pub`. The diagnostic `E0041` identifies both the forbidden access and its original declaration. Repair the API only if appropriate by exporting that declaration with `pub`; otherwise keep the member private and use a permitted public interface. Both `check` and `run` fail with exit code **1** and **empty stdout** for this published fixture.

## 5. Compiler failure: a circular import (alpha.2 E0039)

Circular module graphs fail even when their symbols are not used. First create the published [`loop.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/loop.srp):

~~~scarp
import "cycle.srp" as cycle;
~~~

Then create [`cycle.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/tests/fixtures/modules/cycle.srp):

~~~scarp
import "loop.srp" as loop;
~~~

The tagged compiler reports:

~~~text
error[E0039]: circular import reaches "cycle.srp"
 --> loop.srp:1:8
  |
1 | import "cycle.srp" as cycle;
  |        ^^^^^^^^^^^
 = note: this import continues the cycle
 --> cycle.srp:1:8
  |
1 | import "loop.srp" as loop;
  |        ^^^^^^^^^^
 = help: remove an import edge; mutually recursive functions belong in one module
~~~

**Why it fails:** `cycle.srp` imports `loop.srp`, which imports `cycle.srp` again. `E0039` identifies the cycle and its import edges. Resolve the graph by removing an import edge or reorganizing mutually dependent functions into one module. Both `check` and `run` fail with exit code **1** and **empty stdout**.

## 6. Module rules to remember

| Rule | Meaning |
| --- | --- |
| `import "file.srp" as alias;` | Explicit local source import; no wildcard or network/package imports |
| `pub bind name = ...;` | Export an immutable scalar module constant; **alpha.1 literal-only**, restricted scalar expressions added in **alpha.2** |
| `pub pure funcra ...` | Export a public function; private helpers may remain inside the same module |
| `alias.member` | Refer to one imported member; imported names are not automatically unqualified or re-exported |
| `scarp modules <path>` | Alpha.2 static inventory, not program execution |
| `scarp modules --json <path>` | Alpha.2 schema-v1 inventory, not the program's stdout |
| `E0041` | Private symbol cannot be accessed from an importing file |
| `E0039` | Cyclic source-import graph; remove an import edge |

Imports are restricted to the trusted source root; unsafe traversal, absolute/URI import paths, and network fetching are not supported. The filesystem loader is **not a race-proof security sandbox** against concurrent hostile filesystem changes. See [source loading and security](/reference/source-loading), [runtime budgets](/reference/budgets), and the [published feature matrix](/reference/status).

**Evidence:** These five source/output pairs and the JSON snapshot are pinned to their release-specific compiler fixtures. Documentation checks verify exact source/output fences in English and Hindi; existing CI jobs execute the alpha.1 and alpha.2 successful programs and published error fixtures, while a dedicated inspection smoke test validates visibility metadata.
