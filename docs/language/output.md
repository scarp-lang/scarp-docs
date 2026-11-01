# Output and streams

Scarp has five supported output statement names in v0.0.5-alpha.1. They are **statements**, not ordinary callable functions.

| Statement | Stream | Appends LF? |
| --- | --- | --- |
| `print(...)` | stdout | Yes |
| `println(...)` | stdout | Yes; supported alias |
| `write(...)` | stdout | No |
| `eprint(...)` | stderr | Yes |
| `ewrite(...)` | stderr | No |

## Examples

~~~scarp
bind language = "Scarp";
write("Hello, ");
print(language, true);
print();
write("done");
~~~

Exact stdout is `Hello, Scarp true\n\ndone`, without a final newline. A comma between arguments produces one space in output; a trailing comma is allowed. `print()` emits a newline, while `write()` emits no bytes.

Output is prepared as immutable snapshots on the selected execution path. If source checking or runtime evaluation fails before replay, no user output is emitted. Actual write errors can occur after some previous bytes have already reached the output destination.

## Error stream vs diagnostics

`eprint` and `ewrite` write user-program output to stderr. Compiler diagnostics are also written to stderr, but they are not the same as a successful program's error-stream output. Check the process exit code.

## Not available

There is no interpolation syntax, automatic formatting template engine, or arbitrary output-stream API in Scarp source code. Rust embedding can supply explicit writers.

**Verified against:** [compiler output reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/output.md), [output example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.srp).
