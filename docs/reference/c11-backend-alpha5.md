# Experimental scalar C11 emitter — v0.0.5-alpha.5

<!-- scarp-c-backend-release: v0.0.5-alpha.5 -->
<!-- scarp-c-backend-source: 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 -->

This functionality **shipped in the official [alpha.5 compiler prerelease](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5)** at source commit 2eeed0aa52ccb59523307841ad8ffbd83f8911a8. It is a **Rust embedding API only**. There is no scarp compile CLI command, no native Scarp executable output, and no stable ABI.

## API for Rust embedding hosts

The tagged Rust library exports scarp::c_backend::emit_c(source: &str) and emit_program(&ResolvedProgram). The return value is a complete freestanding C11 translation-unit **string**, or a diagnostic. The emitter does not write output files, invoke a C compiler or linker, or access a registry.

A Rust embedding host can request generated C text:

~~~rust
let c_source = scarp::c_backend::emit_c(
    "var total = 0; repeat 4 as n { total += n; } print(total);"
)?;
~~~

The host must separately select and supply a C11 compiler to compile that text. This is a Rust API illustration, not a Scarp CLI example. The complete interpreter-verifiable program is in the [published alpha.5 guide](/releases/v0.0.5-alpha.5).

## Exactly which features are supported?

| Experimental C backend accepts | C backend rejects |
| --- | --- |
| Scalar integer and boolean values, checked arithmetic and bit operations, comparison and short-circuit boolean logic | Floats, vectors, numerical tiles, user functions, recursion |
| bind and var scalar slots, updates, if, while, repeat COUNT as index, nested loops, break and continue | Unsupported imports, computed string construction, dynamic collections |
| Single-argument stdout print/println for scalar expressions or literal UTF-8 text | Multi-argument output, stderr, write and unsupported intrinsics |

**Unsupported C emission uses E0049.** Invalid shifts use E0046; negative repeat counts use E0019. These are restrictions on the C backend; they do **not** remove features from the interpreter.

The emitter caps each program at **256 scalar slots**, **4096 operations**, **1024 expression nodes per expression**, **16384 total nodes**, and **65536 bytes of literal string payload**. The generated freestanding C11 unit offers caller-owned struct scarp_workspace and struct scarp_host. It supports work/print budgets only, not all interpreter ExecutionOptions.

The generated scarp_validate checks execution without writing output. scarp_run validates before replaying output to a synchronous host callback. A callback failure may leave earlier output bytes written. Host tooling, ABI stability, memory isolation, compilation and linking are outside this API's guarantees.

## Source-backed evidence

The exact published files are [src/c_backend.rs](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/src/c_backend.rs), [tests/c_backend.rs](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/tests/c_backend.rs) and [Proposal 0035](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/docs/proposals/0035-native-scalar-c11.md). The compiler release CI tested interpreter/C differential behavior and build restrictions. This page does not claim a general-purpose native compiler.

See the [alpha.5 release notes](/releases/v0.0.5-alpha.5), [alpha.5 CLI](/tooling/cli-alpha5) and [feature status](/reference/status).
