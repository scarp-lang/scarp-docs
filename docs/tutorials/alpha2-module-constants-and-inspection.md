# Verified Scarp alpha.2: module constants and source inspection

**Compiler: v0.0.5-alpha.2, published November 2, 2026.** This tutorial reproduces **three complete tagged examples** and their exact expected stdout. Imported source files are reproduced **before** the entry script, so the TypeScript evidence checker can detect missing or reordered dependencies. Each fixture is checked and executed in the separate alpha.2 CI job.

This tutorial is specific to the [published alpha.2 release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2), not the main [alpha.1 reference](/reference/status). The compiler is an interpreter; module inspection does not produce an executable.

## 1. Compile-time scalar constants across three files

Create these files with the exact paths shown. Paths in an `import` are resolved relative to **the importing file**.

**`modules/constant_base.srp`** — public literal constants:

~~~scarp
pub bind base = 10;
pub bind multiplier = 4;
pub bind label = "constant expressions";
~~~

**`modules/constants.srp`** — compile-time expressions and a pure function:

~~~scarp
import "constant_base.srp" as settings;
bind step = 2;
pub bind answer = settings.base * settings.multiplier + step;
pub bind label = settings.label;
pub bind ready = answer == 42 and not false;
pub bind ratio = (1.5 * 2.0) / 4.0;

pub pure funcra adjust(value: integer = answer) -> integer
needs ready;
ensures result >= answer;
{
    return value;
}
~~~

**`constant_expressions.srp`** — entry program:

~~~scarp
import "modules/constants.srp" as constants;
pub bind doubled = constants.answer * 2;
print(constants.label, constants.answer, doubled, constants.ready, constants.ratio, constants.adjust());
~~~

Expected stdout from the [published output file](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/constant_expressions.stdout):

~~~text
constant expressions 42 84 true 0.75 42
~~~

`settings.base * settings.multiplier + step` is evaluated while compiling the module, not through a runtime global initialization system. `pub bind doubled` is another module constant. The imported pure function can read published constants and use its default argument. **Constant initializers remain deliberately restricted**: arbitrary runtime function calls, indexing, collections and side effects are not allowed in the initializer expression. See the [compiler's tagged constant expression reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/constant-expressions.md).

## 2. Inspect a module without running its entry statements

**`modules/inspection.srp`** — notice public and private declarations:

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

**`module_inspection.srp`** — import and call:

~~~scarp
import "modules/inspection.srp" as tools;
print(tools.label, tools.adjusted(39));
~~~

Expected stdout **when running the program**:

~~~text
module tools 42
~~~

The distinct `scarp modules module_inspection.srp` command **does not run** the `print`. It reports source/module metadata, including import relationships, public/private declarations, parameters and function signatures. A private symbol can be visible in the inventory **without being importable** from another module. Use `scarp run module_inspection.srp` to produce the stdout above.

## 3. Versioned JSON module metadata

**`inspection_json.srp`** — a self-contained source module with two compile-time constants and one function:

~~~scarp
pub bind base: integer = 6;
pub bind answer: integer = base * 7;
pure funcra echo(value: integer = answer) -> integer {
    return value;
}
print(echo());
~~~

Expected stdout **on `scarp run`**:

~~~text
42
~~~

This published [JSON inspection snapshot](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.modules.json) records the source-local metadata (not the runtime output):

~~~json
{"schema_version":1,"entry":0,"modules":[{"id":0,"path":"inspection_json.srp","imports":[],"dependencies":[],"dependents":[],"symbols":[{"name":"base","public":true,"span":[9,13],"kind":"constant","type":"integer"},{"name":"answer","public":true,"span":[37,43],"kind":"constant","type":"integer"},{"name":"echo","public":false,"span":[77,81],"kind":"function","pure":true,"result":"integer","parameters":[{"name":"value","type":"integer","has_default":true,"span":[82,87]}]}]}],"constant_dependencies":[{"source":0,"declaration":[37,43],"target":0,"target_declaration":[9,13],"span":[55,59]}]}
~~~

`schema_version: 1` is the format identifier. `span` values are **half-open UTF-8 byte offsets**, not line numbers or Unicode-character offsets. The `constant_dependencies` record connects `answer` to `base`. A native filesystem CLI inspection may serialize a **different module path label** from the in-memory snapshot, because its source loader uses the actual path. Do not treat these path labels as cross-machine identifiers. The new test compares stable metadata and typed spans to the published snapshot while allowing the path label to vary.

## Run the examples with the matching compiler

Use the **alpha.2 executable** and preserve all `modules/` files in the same relative directory as the entry programs:

~~~sh
scarp check constant_expressions.srp
scarp run constant_expressions.srp
scarp modules module_inspection.srp
scarp modules --json inspection_json.srp
scarp run inspection_json.srp
~~~

A successful `check` is silent. `run` produces the expected stdout above; `modules` provides static information and `--json` selects its machine-readable form. Neither is a native compiler or a package manager.

**Evidence:** [tagged Scarp examples](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.2/examples), [module inspection reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-inspection.md) and [verification approach](/reference/evidence).
