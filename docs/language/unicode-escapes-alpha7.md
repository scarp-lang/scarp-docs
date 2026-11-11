# Unicode scalar escapes — Scarp v0.0.6-alpha.7

<!-- scarp-current-release: v0.0.6-alpha.7 -->
<!-- scarp-current-source: b1c1fd232b418267d95520c69ee563ac99ecae30 -->

Published [v0.0.6-alpha.7](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.7) adds `\u{HEX}` to double-quoted string literals. Put 1–6 ASCII hexadecimal digits between braces; the lexer decodes that Unicode scalar to UTF-8.

~~~scarp
print("\u{41}", "\u{0928}", "\u{1F44B}");
~~~

This prints A, a Devanagari letter and an emoji. Existing escapes `\\`, `\"`, `\n`, `\t`, `\r` and direct UTF-8 characters remain valid.

## Validation and boundaries

Invalid forms such as `\u{}`, `\u{0x41}`, `\u{D800}`, `\u{110000}`, a missing brace, or more than six digits report `E0003`. Surrogates U+D800–U+DFFF are excluded; U+10FFFF is the maximum scalar.

`"e\u{301}"` and `"\u{E9}"` can appear similar but contain different scalar sequences. The lexer performs no Unicode normalization.

## Published end-to-end fixture

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

[Compiler tests](https://github.com/scarp-lang/scarp/blob/b1c1fd232b418267d95520c69ee563ac99ecae30/tests/unicode_string_escapes.rs) · [Release notes](/releases/v0.0.6-alpha.7) · [Conditional expressions](/language/conditional-expressions-alpha7)
