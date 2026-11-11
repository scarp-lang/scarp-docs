# Conditional expressions सीखें — Scarp v0.0.6-alpha.7

<!-- scarp-current-release: v0.0.6-alpha.7 -->
<!-- scarp-current-source: b1c1fd232b418267d95520c69ee563ac99ecae30 -->

यह सुविधा पहली बार प्रकाशित [v0.0.6-alpha.7](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.7). पुराने [control flow पाठ](/hi/language/control-flow) में statement-level `if` है। नया form एक value लौटाता है।

## Syntax और नियम

~~~scarp
bind rating = 76;
bind label = if rating >= 80 { "excellent" } elif rating >= 50 { "passed" } else { "failed" };
print(label);
~~~

हर condition `boolean`, हर result एक expression और सभी result types **एकदम समान** होने चाहिए। `{ 1; }` valid expression arm नहीं है; `{ 1 }` मान्य है। आखिर में `else` आवश्यक है। Interpreter चुनी हुई branch चलाता है, पर नहीं चुनी गई branch भी parse, resolve और typecheck होती है।

ये expressions bindings, function arguments/defaults, return values, contracts और tuples में प्रयोग किए जा सकते हैं। Statements के `if` की अलग syntax है।

## रिलीज़ का वास्तविक उदाहरण

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

नकारात्मक उदाहरण: `if true { 1 }` (अंतिम else नहीं), `if true { 1 } else { "text" }` (अलग types), `if true { 1; } else { 2 }` (statement-like arm). Module constants और experimental C11/ELF64 backend के लिए यह अभी समर्थित नहीं है।

[स्रोत tests](https://github.com/scarp-lang/scarp/blob/b1c1fd232b418267d95520c69ee563ac99ecae30/tests/conditional_expressions.rs) · [प्रकाशित रिलीज़](/hi/releases/v0.0.6-alpha.7) · [Unicode guide](/hi/language/unicode-escapes-alpha7)
