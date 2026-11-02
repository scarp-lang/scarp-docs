# Output streams: `print` and `write`

This lesson demonstrates the **published Scarp v0.0.5-alpha.1** output behavior with a complete compiler-owned program. `print` ends a line; `write` does not. The file below is also a conformance fixture, so its actual bytes are tested by the released interpreter in CI.

## 1. Create the program

Save this full source as `output.srp`:

~~~scarp
// Output without a final newline.
bind name = "Scarp";
write("Hello, ");
print(name, 3, true,);
print();
write("done");
~~~

Verify and run it:

~~~sh
scarp check output.srp
scarp run output.srp
~~~

The **visible** standard output is:

~~~text
Hello, Scarp 3 true

done
~~~

**Important:** There is **no final newline after `done`**. Code fences display text and do not by themselves convey the presence or absence of a final newline. The published [output.stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.stdout) fixture records the exact bytes, and the [compiler-conformance job](https://github.com/scarp-lang/scarp-docs/blob/main/scripts/test-compiler.ts) checks the real interpreter output byte-for-byte.

## 2. Explain each output call

- `write("Hello, ");` writes a prefix without a line break.
- `print(name, 3, true,);` writes the arguments separated by spaces, **then** a newline. The trailing comma is supported by this published example.
- `print();` writes a blank line.
- `write("done");` appends `done` without a final line break.

In other words, the program emits `Hello, Scarp 3 true`, two newline characters, and then `done`. If you pipe output into another program, its final-newline behavior can matter.

## 3. Use the right output method

Use `print` for ordinary line-oriented messages, and `write` when you deliberately want to concatenate output without automatically ending a line. For CLI diagnostics and output budgets, refer to the [output reference](/language/output) and [diagnostics](/reference/diagnostics).

**Compiler evidence:** [source example](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.srp) and [expected output](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/examples/output.stdout). Check the [verified functions](/tutorials/verified-functions), [loops](/tutorials/repeat-and-loops), and [vectors](/tutorials/verified-vectors) tutorials next.

::: warning Prerelease scope
These details are verified for the v0.0.5-alpha.1 interpreter only. See [feature status](/reference/status).
:::
