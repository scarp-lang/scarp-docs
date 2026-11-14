# Interactive input and output fixtures — alpha.10

<!-- scarp-cli-release: v0.0.6-alpha.10 -->
<!-- scarp-current-source: 44fcd0f77ccb92648cdb1fc7632495c506c87cb3 -->

[v0.0.6-alpha.10](/releases/v0.0.6-alpha.10) · [Tagged input contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/program-input.md).

## Explicitly enable prompts

~~~sh
scarp exec --interactive examples/interactive/greeting.srp < examples/interactive/greeting.stdin
~~~

Without `--interactive`, `input`, `ask`, `ask_or` and typed prompts are unavailable. Use `--input-file PATH` to provide reproducible UTF-8 input.

## Tagged greeting

[interactive/greeting.srp](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/greeting.srp)

[interactive/greeting.stdin](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/greeting.stdin)

[interactive/greeting.stdout](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/greeting.stdout)

~~~scarp
bind name = ask_or("Name> ", "Guest");
print("Hello", name);
~~~

~~~text
Name> Hello नमस्ते 🌍
~~~

## Tagged typed calculator

[interactive/typed_calculator.srp](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/typed_calculator.srp)

[interactive/typed_calculator.stdin](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/typed_calculator.stdin)

[interactive/typed_calculator.stdout](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/examples/interactive/typed_calculator.stdout)

~~~scarp
// Run with scarp exec --interactive examples/interactive/typed_calculator.srp.
write("Scarp calculator\n");
flush_stdout();
bind left: float = input_float("First number: ");
bind right: float = input_float("Second number: ");
bind operation: string = input("Operation (+, -, *): ");
if operation == "+" {
    print("Result:", left + right);
} elif operation == "-" {
    print("Result:", left - right);
} elif operation == "*" {
    print("Result:", left * right);
} else {
    eprint("Unknown operation");
}
~~~

~~~text
Scarp calculator
First number: Second number: Operation (+, -, *): Result: -10.0
~~~

~~~sh
scarp exec --interactive examples/interactive/typed_calculator.srp < examples/interactive/typed_calculator.stdin
~~~

## EOF and streams

`ask_or` uses fallback only at EOF, not a genuine blank line. `try_read_line()` returns `(false, "")` at EOF and `(true, "")` for a blank line. `flush_stdout()` and `flush_stderr()` publish streams during interactive execution.

Project tests compare byte-exact `.stdin`, `.stdout` and `.stderr` fixtures. JSON v1/v2 omit output streams; user-authored diagnostic messages may still contain private text. Execute only trusted code.
