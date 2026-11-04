# Migrating from Scarp alpha.3 to alpha.4

<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->

This guide covers the **published** [v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3) to [v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) transition, **not** an upgrade to stable Scarp. Both are experimental interpreter prereleases. The tagged source commits are `7715c28df09c7703b39e14fddb963275b25df476` (alpha.3) and `79141329176f5dce51457e90a6652902f6432135` (alpha.4). The [alpha.4 project tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.4/tests/scarp_projects.rs) are the source of truth for the directory commands.

## Decide whether you need a project

| Workflow | v0.0.5-alpha.3 | v0.0.5-alpha.4 |
| --- | --- | --- |
| `scarp verify FILE.srp` | Supported: static checks | Still supported |
| `scarp exec FILE.srp` | Supported: execute a file | Still supported |
| `scarp create DIRECTORY` | Not available | Creates a **new** project directory |
| `scarp verify DIRECTORY` | Not available | Static-checks the declared project entry |
| `scarp launch DIRECTORY` | Not available | Executes the declared project entry |

**You do not have to migrate existing single-file programs.** In alpha.4, the file workflow remains valid, and there is no automatic project conversion or package management.

## 1. Check your installed release and preserve the existing file workflow

Download alpha.4 from its [official release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4) and verify the archive against its published SHA-256 checksum **before running it**. Make sure `scarp version` reports `0.0.5-alpha.4`. For a source file named `app.srp`, the following commands remain valid:

~~~sh
scarp version
scarp verify app.srp
scarp exec app.srp
~~~

Here `verify` performs static analysis; `exec` actually runs the program. The older `check` command is **not** a substitute for static `verify`: legacy `check` can evaluate selected runtime paths. Existing `run`, `check`, `tokens`, and `modules` commands remain temporarily available but are not the recommended new CLI vocabulary.

## 2. Create a project only if its directory workflow is useful

In a parent directory where `hello-world` does **not** already exist, use the published alpha.4 interpreter:

~~~sh
scarp create hello-world
scarp verify hello-world
scarp launch hello-world
~~~

The new project contains `hello-world/Scarp.project` and `hello-world/src/main.srp`. Its generated manifest is exactly:

~~~text
scarp-project: 1
name: hello-world
entry: src/main.srp
~~~

The generated entry source is:

~~~scarp
print("Hello from Scarp!");
~~~

The expected `launch` output is:

~~~text
Hello from Scarp!
~~~

**Important:** `create` refuses to overwrite any existing destination, including an empty folder. It does not adopt an existing alpha.3 source tree. To reorganize an existing program, first back up your sources, create a **new** project directory, then deliberately copy or edit its `src/main.srp` and related local module files. Preserve relative imports and verify before launching. Do not replace your original directory in place.

## 3. Understand the new manifest and failure boundaries

- `Scarp.project` is a strictly versioned, three-line UTF-8 **development manifest**, not a general dependency file or package lock. Version 1 has only `scarp-project`, `name`, and `entry` in that order.
- Its size limit is **4,096 bytes**. The project name is 1–96 UTF-8 bytes; the `entry` must be an existing, slash-separated, relative `.srp` path **inside** the project, with at most 512 UTF-8 bytes. Parent traversal, backslashes, unknown/duplicate manifest fields, and manifest symlinks are rejected.
- Neither `verify DIRECTORY` nor `launch DIRECTORY` searches parent directories for a manifest. Give the actual project root explicitly.
- `verify DIRECTORY` checks sources, imports, constants, names and types without executing ordinary statements; `launch DIRECTORY` runs the interpreter and can still encounter runtime errors. Only `launch` accepts execution-budget flags.
- Malformed manifests return exit status 1; invalid CLI usage returns 2. Errors support `--diagnostic-format=json` (on stderr, without partial successful output).

To inspect errors while preserving the distinction between validation and execution:

~~~sh
scarp verify --diagnostic-format=json hello-world
scarp launch --diagnostic-format=json hello-world
~~~

There is still **no native compilation, package registry, workspace discovery, dependency installation, or `scarp build` / `scarp compile` command** in this release. For complete syntax and limitations, use the [alpha.4 project quickstart](/guide/quickstart-alpha4), the [published alpha.4 release notes](/releases/v0.0.5-alpha.4), and the [historical alpha.3 CLI reference](/tooling/cli).
