# Program input with `read_line()` — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

**Published prerelease only:** [v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6); [immutable compiler input contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/program-input.md). Older `v0.0.6-alpha.5` binaries cannot read program input.

## Read a line

`read_line() -> string` consumes one explicitly supplied UTF-8 input line. It removes LF or CRLF; all other valid text, including spaces, is preserved. It does **not** display a prompt or implicitly parse a number.

~~~scarp
bind name: string = read_line();
print("Hello", name);
~~~

Create `greeting.srp` with that source and `greeting.txt` containing `Ada` followed by a newline. On a Unix-like shell, execute with a redirected file:

~~~sh
scarp exec greeting.srp < greeting.txt
~~~

Expected output is `Hello Ada` followed by a newline. This small demonstration follows the [tag-pinned language contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/program-input.md); for an upstream test fixture including imports, text conversions and tuples, see the [combined release example](/releases/v0.0.6-alpha.6).

## Execution modes and limits

| Mode | Input behavior |
| --- | --- |
| `exec`, historical `run`, project `launch` | Read from redirected or piped stdin |
| Static `verify` and source inspection | Do not execute input |
| Evaluating `check` | A selected `read_line()` fails with E0054 |
| Terminal-connected input | Rejected with E0054; this is not an interactive REPL |
| Rust embedding | Explicit caller-provided buffered reader APIs, no global stdin |

The default raw limits are **65,536 bytes per line**, **1,048,576 cumulative bytes** and **4,096 selected reads**. They can be changed with `--max-input-line-bytes`, `--max-input-bytes` and `--max-input-reads` **before the source path**. The terminator counts toward raw byte limits, even though it is omitted from the returned string. A final nonempty unterminated line is valid; a subsequent read reaches EOF.

| Diagnostic | Meaning |
| --- | --- |
| `E0054` | No reader or forbidden input mode |
| `E0055` | EOF before a new line |
| `E0056` | Invalid UTF-8 |
| `E0057` | Reader error |
| `E0058` | Input quota or bounded allocation failure |

Ordinary work and text-allocation budgets apply in addition to input quotas. Program output is captured and replayed **only after successful evaluation**; input already consumed cannot be rolled back. A pipe might still block waiting for its producer: execution budgets are not I/O timeouts.

## Next

To convert a line to a number, explicitly use `text_to_integer(text_trim(read_line()))`; never assume automatic conversion. Read [text foundations](/language/text-foundations-alpha6), [immutable tuples](/language/tuples-alpha6) and [the exact tagged example](/releases/v0.0.6-alpha.6). [हिन्दी पाठ](/hi/language/program-input-alpha6).
