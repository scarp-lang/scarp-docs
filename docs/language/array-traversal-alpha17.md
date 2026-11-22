# Fixed-array traversal and Boolean prompts — alpha.17

<!-- scarp-cli-release: v0.0.6-alpha.17 -->
<!-- scarp-current-source: 7831a37939965f557ce746e1d86bf82d3d629f74 -->

These capabilities first appeared in [published v0.0.6-alpha.17](/releases/v0.0.6-alpha.17). They are release-scoped, not available in the historical alpha.1 reference.

## Loop through immutable arrays

Use `array_len(values)` as a `repeat` count, then access elements by their zero-based index. `array_get_or` handles a missing index without raising the bounds error.

~~~scarp
bind readings = [array: 10, 20, 30];
var total = 0;
repeat array_len(readings) as index {
    total += readings[index];
}
print("Total:", total);
print("Missing reading:", array_get_or(readings, 3, 0));
print("Empty length:", array_len([array: <integer>]));
~~~

~~~text
Total: 60
Missing reading: 0
Empty length: 0
~~~

A zero-length fixed array returns length `0`; `repeat 0 as index` performs no iterations. The fallback expression is evaluated **even for a valid index**. For strict indexing use `values[index]`, which raises E0063 for an invalid index.

## Typed terminal Boolean input

`input_boolean(prompt)` requires interactive input and parses **only** `true` or `false`, lowercase, not `1`/`0`, `yes`/`no`, or title case. Invalid text produces E0084 and EOF before a line produces E0055. The input source and prompt are subject to normal resource budgets.

~~~sh
scarp exec --interactive --input-file examples/interactive/boolean_prompt.stdin examples/interactive/boolean_prompt.srp
~~~

~~~scarp
// Run with scarp exec --interactive examples/interactive/boolean_prompt.srp.
repeat 2 as attempt {
    bind confirmed: boolean = input_boolean("Continue (true/false)? ");
    if confirmed {
        print("Continuing");
    } else {
        print("Stopped");
        break;
    }
}
~~~

~~~text
true
false
~~~

~~~text
Continue (true/false)? Continue (true/false)? Continuing
Stopped
~~~

The executable and example files must be from the same release; the `--input-file` option was published earlier, so the example can be replayed without typing. A normal terminal can instead supply these lines interactively.

## Upgrade note

The next [published alpha.18](/releases/v0.0.6-alpha.18) adds immutable `array_set` and automatic `scarp exec` entrypoint selection. Neither change introduces in-place indexed assignment or native code generation.

[Tagged compiler example](https://github.com/scarp-lang/scarp/blob/7831a37939965f557ce746e1d86bf82d3d629f74/examples/array_traversal.srp) · [Boolean input example](https://github.com/scarp-lang/scarp/blob/7831a37939965f557ce746e1d86bf82d3d629f74/examples/interactive/boolean_prompt.srp)
