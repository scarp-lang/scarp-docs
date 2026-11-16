# इंटरैक्टिव Decimal input — alpha.11

<!-- scarp-current-release: v0.0.6-alpha.11 -->
<!-- scarp-cli-release: v0.0.6-alpha.11 -->
<!-- scarp-current-source: 79b57395957f47e1270ee542a856c844b82386de -->

प्रकाशित `input_decimal(prompt)` prompt flush करने के बाद सटीक decimal पढ़ता है। इसे `scarp exec --interactive` के साथ चलाएँ। Redirected UTF-8 input से example फिर से जाँचा जा सकता है।

## सटीक input और output

~~~scarp
bind amount: decimal = input_decimal("राशि> ");
print(decimal_format(amount, 2, "half_even"));
~~~

~~~text
2.675
~~~

~~~text
राशि> 2.68
~~~

~~~sh
scarp exec --interactive examples/interactive/exact_decimal.srp < examples/interactive/exact_decimal.stdin
~~~

UTF-8 prompt `राशि> ` है। Input `2.675` को `half_even` mode में दो places पर `2.68` दिखाया गया है। यह सुविधा पुराने alpha.10 binary में नहीं है।

[Decimal गणना गाइड](/hi/language/decimal-alpha11) · [आधिकारिक रिलीज़](/hi/releases/v0.0.6-alpha.11).
