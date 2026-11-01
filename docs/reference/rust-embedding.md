# Embed the Scarp interpreter in Rust

**Experimental API, v0.0.5-alpha.1.** The `scarp` crate can be used as a **local path dependency** in a Rust host. It is not a Scarp standard-library module and does not imply a published crate-registry package or native `.srp` compilation.

## Choose the API for your task

| API | Purpose | Runs selected arithmetic? | Writes output? |
| --- | --- | --- | --- |
| `scarp::parse(source)` | Construct syntax AST | No | No |
| `scarp::compile(source)` | Resolve names/types to an immutable plan | No | No |
| `scarp::check(source)` | Validate and evaluate the selected path | Yes | No |
| `scarp::run(source, writer)` | Execute with explicit output | Yes | stdout writer |
| `scarp::run_with_io(source, out, err)` | Execute with two writers | Yes | Both writers |
| `modules::compile_file(path, limits)` | Compile an entry and its relative imports | No | No |
| `modules::compile_with_loader(path, loader, limits)` | Compile a virtual source graph | No | No |

Source-string APIs do **not** load imports implicitly. For multi-file source, use a module API. The Rust host owns the output writers and is responsible for their final flush policy.

## Single-file execution without global output redirection

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let source = r#"print("Hello from Scarp!");"#;
    let mut output = Vec::new();
    scarp::run(source, &mut output)?;
    assert_eq!(output, b"Hello from Scarp!\n");
    Ok(())
}
```

The compiler builds a plan and validates the selected execution before replaying output. Source errors and runtime-budget failures produce no program output. A writer I/O error may still leave previously written bytes.

## File-based modules

```rust
use scarp::{modules, ExecutionOptions};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let limits = modules::ModuleLimits::default();
    let program = modules::compile_file("main.srp", limits)?;
    program.check(ExecutionOptions::default())?;
    let (mut out, mut err) = (Vec::new(), Vec::new());
    program.execute(&mut out, &mut err, ExecutionOptions::default())?;
    Ok(())
}
```

The host chooses `ModuleLimits` and execution options independently. For untrusted virtual sources, supply a custom or in-memory `SourceLoader` rather than assuming the default filesystem loader is a secure sandbox.

## Lifecycle and compatibility

Compiled plans are immutable. Every execution starts fresh storage and budget counters, so a previous run's mutations do not persist. Return values, captured output and numerical windows can retain immutable shared backing storage even after a local binding retires.

Exact Rust types and signatures may change in later prereleases. If you need to embed Scarp, pin your path checkout to a specific commit or release and run the compiler's Rust tests. Refer to the official [embedding guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/embedding.md), [module loader docs](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md), and [module source code](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/src/modules).
