# Symbol navigation and CLI — v0.0.6-alpha.1

<!-- scarp-cli-release: v0.0.6-alpha.1 -->
<!-- scarp-alpha6-release: aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8 -->

**Published in [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1)**, from source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8`. The existing [alpha.5 CLI guide](/tooling/cli-alpha5) is the historical reference for project module inspection. The new commands are **not available** in alpha.5.

## Commands

Run these from the [tagged compiler repository](https://github.com/scarp-lang/scarp/tree/v0.0.6-alpha.1) with an alpha.6 executable. The symbol-navigation sample imports `examples/modules/navigation_values.srp`.

~~~sh
scarp guide inspect symbols
scarp guide inspect references
scarp inspect symbols --json examples/symbol_navigation.srp
scarp inspect references --json examples/symbol_navigation.srp
scarp inspect references --json path/to/project
scarp verify examples/symbol_navigation.srp
scarp exec examples/symbol_navigation.srp
~~~

The two new `inspect` commands **do not execute ordinary program statements**. `scarp exec` does: it prints `30` for this tagged example. The `guide` command prints contextual help.

## What the JSON means

The outputs are UTF-8 JSON objects ending with a newline, containing these common fields:

~~~json
{
  "schema_version": 1,
  "kind": "scarp.references",
  "span_encoding": "utf-8-bytes",
  "column_encoding": "unicode-scalar",
  "position_base": 1
}
~~~

The `symbols` response uses `kind: "scarp.symbols"`; `references` uses `kind: "scarp.references"`. Both contain `files` and `symbols` arrays, and the latter additionally has a `references` array.

Each symbol has an ID, name, kind, owning symbol, visibility, mutability, optional module target and optional declaration location. Each reference identifies its target symbol ID, usage kind and token location. Byte spans are **half-open UTF-8 offsets**; human-readable lines and columns are **one-based Unicode scalar positions**. File paths follow the compiler loader's display policy, so don't compare absolute paths across machines.

Lexical shadowing creates distinct symbols. Import paths link to modules; named-argument labels link to parameters. Builtins and implicit contract result values can have a `null` definition location; do not invent a physical source position. No source bodies, constant values or defaults are returned.

## Project and error handling

An explicit project directory is supported, provided it has a valid `Scarp.project`. No parent-directory discovery happens automatically. Usage errors return exit **2**; source/module/manifest failures return exit **1** without a successful partial index. Existing errors take precedence over index exhaustion `E0050`. `--diagnostic-format=json` controls **error stderr**, while `--json` selects the successful **inventory on stdout**.

An index belongs to **one compilation snapshot**. Symbol IDs can change after edits. Limits default to 65,536 symbols, 1,048,576 references, 8 MiB of retained definition-name UTF-8 data and 4,194,304 logical indexing work units. These are indexing quotas, **not** process memory or runtime instruction counts.

## Rust host API and limitations

Compiler embedders can use `modules::compile_indexed_file`, `compile_indexed_with_loader` or `resolve_indexed` and query `goto_definition(source_id, byte_offset)` and `find_references(symbol_id)`. These return immutable navigation data without runtime execution. The source of truth for exact schema details is the [tagged compiler contract](https://github.com/scarp-lang/scarp/blob/v0.0.6-alpha.1/docs/symbol-index.md).

**Not included:** LSP server, rename command, incremental analysis, incomplete-source recovery, or stable IDs across edits. No `scarp build` or `scarp compile` command. See also [RMS](/language/rms-alpha6) and [release provenance](/releases/v0.0.6-alpha.1).
