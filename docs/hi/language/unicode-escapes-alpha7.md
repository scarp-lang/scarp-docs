# Unicode scalar escapes — Scarp v0.0.6-alpha.7

<!-- scarp-current-release: v0.0.6-alpha.7 -->
<!-- scarp-current-source: b1c1fd232b418267d95520c69ee563ac99ecae30 -->

प्रकाशित [v0.0.6-alpha.7](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.7) से string literals में `\u{HEX}` मान्य है। Braces में 1–6 ASCII hex digits लिखें; lexer Unicode scalar को UTF-8 bytes में बदलता है।

~~~scarp
print("\u{41}", "\u{0928}", "\u{1F44B}");
~~~

यह `A`, देवनागरी का एक अक्षर और emoji print करता है। पुराने escapes `\\`, `\"`, `\n`, `\t`, `\r` और सीधे UTF-8 characters चलते रहते हैं।

## सीमाएँ

गलत `\u{}`, `\u{0x41}`, `\u{D800}`, `\u{110000}`, अधूरा brace या छह से अधिक digits पर `E0003` मिलता है। U+D800–U+DFFF surrogate range Unicode scalar नहीं है; आखिरी मान्य scalar U+10FFFF है।

`"e\u{301}"` और `"\u{E9}"` दिखाई देने में मिल सकते हैं पर इनकी scalar sequences अलग हैं। कोई automatic normalization नहीं है।

## वास्तविक compiler source

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

[Compiler tests](https://github.com/scarp-lang/scarp/blob/b1c1fd232b418267d95520c69ee563ac99ecae30/tests/unicode_string_escapes.rs) · [प्रकाशित release](/hi/releases/v0.0.6-alpha.7) · [Conditional expressions](/hi/language/conditional-expressions-alpha7)
