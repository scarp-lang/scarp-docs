# Module loading and trust boundaries

Scarp's **v0.0.5-alpha.1 module loader is experimental**, intentionally local and bounded. Its filesystem path checks are not a comprehensive security sandbox. This page is for developers running local source graphs or embedding the interpreter in Rust.

## Relative paths and trust root

The CLI uses the entry file's parent directory as its trusted import root. Each `import "path.srp" as alias;` is interpreted relative to the **importing file**. Canonicalized paths must remain within that root; symlinks resolving outside are rejected. The import syntax supports `/` separators and a `.srp` suffix; it rejects absolute paths, drive/URI prefixes, backslashes, empty components, control characters, and escaping `..` components.

The interpreter does **not** download remote modules or look up packages. It rejects import cycles, even when a cyclic dependency would not have been executed. Modules are parsed, linked and checked before running the selected entry program. There is no arbitrary script execution during discovery.

## Default source-graph limits

The defaults below belong to the **module loader**, not the seven runtime-budget flags:

| Limit | Value | Scope |
| --- | ---: | --- |
| Files (`max_files`) | 128 | Unique canonical source files including entry |
| Import depth (`max_depth`) | 32 | Longest chain of import edges |
| Source bytes per file (`max_file_bytes`) | 1,048,576 | UTF-8 content of each file |
| Total source bytes (`max_total_bytes`) | 8,388,608 | Unique source files combined |
| Imports (`max_imports`) | 1,024 | Number of import declarations |
| Expansion bytes (`max_expansion_bytes`) | 8,388,608 | Expanded name and literal text |

CLI defaults are fixed; a Rust host can specify a `ModuleLimits` value for `modules::compile_file` or `modules::compile_with_loader`. For runtime work, calls, output captures and numerical buffers, see [runtime budgets](/reference/budgets).

## Embedding untrusted code

Filesystem canonicalization checks do not remove every race between checking a directory tree and opening a file. The official compiler explicitly assumes a **trusted filesystem tree**. If your host handles untrusted files, use an isolated source tree or an in-memory `SourceLoader` and apply appropriate external OS/process controls. The work/source budgets do **not** limit every allocation, process memory, disk access by the host, or wall-clock runtime; they should not be presented as a complete sandbox.

## Diagnostic shortcuts

| Code | Meaning |
| --- | --- |
| `E0037` | Unsupported nested import/declaration or unsuitable source-only API |
| `E0038` | Missing/unreadable module or invalid UTF-8 |
| `E0039` | Import cycle |
| `E0040` | Graph or expansion resource limit |
| `E0041` | Private member |
| `E0042` | Unknown alias/member or wrong symbol kind |
| `E0043` | Module path policy violation |

**Compiler evidence:** [source modules specification](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md), [module loader implementation](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/src/modules/loader.rs), [module CLI reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/reference/cli.md).
