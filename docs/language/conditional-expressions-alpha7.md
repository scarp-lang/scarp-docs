# Conditional expressions — Scarp v0.0.6-alpha.7

<!-- scarp-current-release: v0.0.6-alpha.7 -->
<!-- scarp-current-source: b1c1fd232b418267d95520c69ee563ac99ecae30 -->

First published in [v0.0.6-alpha.7](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.7). The historical [control-flow guide](/language/control-flow) documents statement-level branching; the new form produces a value.

## Syntax and contract

~~~scarp
bind rating = 76;
bind label = if rating >= 80 { "excellent" } elif rating >= 50 { "passed" } else { "failed" };
print(label);
~~~

Every condition is `boolean`, every arm contains exactly **one expression without its own semicolon**, and every result has the identical type. Final `else` is required. The interpreter evaluates only the selected arm, but the compiler parses, resolves and typechecks **all** arms.

The value can appear in bindings, arithmetic, function arguments/defaults, contracts, return values and tuples. Existing `if` statements retain their different grammar.

## Verified compiler-tagged example

~~~scarp
bind score = 73;
bind label = if score >= 90 {
    "\u{1F44B}"
} elif score >= 60 {
    "\u{0928}\u{092E}\u{0938}\u{094D}\u{0924}\u{0947} \u{1F44B}"
} else {
    text_repeat("unreached", -1)
};
print(label, if true { 7 } else { 1 / 0 });
~~~

~~~text
नमस्ते 👋 7
~~~

Rejected examples: `if true { 1 }` (no else), `if true { 1 } else { "text" }` (mismatched types), `if true { 1; } else { 2 }` (statement-like arm). Module constants and the experimental C11/ELF64 backend reject conditional expressions.

[Source tests](https://github.com/scarp-lang/scarp/blob/b1c1fd232b418267d95520c69ee563ac99ecae30/tests/conditional_expressions.rs) · [Published release](/releases/v0.0.6-alpha.7) · [Unicode escape guide](/language/unicode-escapes-alpha7)
