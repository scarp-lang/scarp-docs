# Scarp alpha.2 source-module inspection and diagnostic explanations

**Available in the published [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) prerelease (November 2, 2026).** These commands are not present in the [alpha.1 CLI baseline](/tooling/cli). This guide describes new alpha.2 tooling without relabeling older binaries or claiming a package manager/native compiler.

## Four supported inspection commands

Run these from a directory with the tagged compiler's examples, using the alpha.2 executable:

~~~sh
scarp modules examples/bit_fields.srp
scarp modules --json examples/bit_fields.srp
scarp explain E0044
scarp modules --help
~~~

The ordinary module command emits a **static source inventory** of modules, dependencies and visible/private declarations. It validates the source graph but does not execute ordinary statements, defaults or function bodies. A program can be statically inspectable even when its runtime execution would fail. Imported module constants are a special case: restricted scalar expressions are checked and evaluated during compilation.

The [compiler-verified module constants and JSON tutorial](/tutorials/alpha2-module-constants-and-inspection) includes two complete imported-source graphs and the exact published schema-version-1 JSON snapshot. Its CI conformance checks the published source and expected outputs without confusing static inventory with runtime printing.

## JSON schema and source locations

The JSON variant produces a compact object followed by a newline. Its top-level fields include `schema_version` (currently **1**), `entry`, `modules`, and `constant_dependencies`. Each module provides paths, imports, relationships and symbols. Source spans are **half-open file-local UTF-8 byte offsets**, not display columns or universal path identities.

Use the [tagged JSON inspection reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-json.md) for the exact schema and [tagged module inspection reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-inspection.md) for output ordering. Client tools should check schema version and avoid assuming source labels are stable across machines.

For the full source and expected stderr of **six released compiler failures**, including E0044 and E0045, follow the [alpha.2 errors and repairs tutorial](/tutorials/alpha2-diagnostics-and-repairs). It contrasts real program errors with the source-free `explain` help command.

## Explain a diagnostic without loading a program

`scarp explain E0044` describes a numeric conversion error and suggests repairs. `E0045` denotes an invalid Unicode scalar index. The command does not load or run a source file and cannot replace source-specific spans and related diagnostic notes. Code spellings must be canonical uppercase identifiers.

## Exit behavior and constraints

- Successful inspection or explanation: exit status **0**, writes stdout.
- Source graph validation, import or type error: status **1**, diagnostic on stderr and no partial inventory output.
- Invalid CLI usage or an unknown diagnostic code: status **2**.
- `modules --json` must be placed before the source path; a filename starting with `-` uses the `--` separator.
- Runtime budget options belong to `run` and `check`, not the modules inventory command.
- Inspection does not grant network imports, bypass filesystem trust rules, run user statements or compile `.srp` into a native executable.

The [alpha.2 compiler execution checks](/reference/evidence) exercise help and diagnostic explanation, and separately test normal/JSON inspection on a tagged source fixture. See the [alpha.2 verified examples](/releases/v0.0.5-alpha.2) and [collection tutorial](/tutorials/alpha2-collections-and-learning).
