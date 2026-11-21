# Interactive input और output fixtures — alpha.10

<!-- scarp-cli-release: v0.0.6-alpha.10 -->
<!-- scarp-current-source: 44fcd0f77ccb92648cdb1fc7632495c506c87cb3 -->

[v0.0.6-alpha.10](/hi/releases/v0.0.6-alpha.10) · [Tagged input contract](https://github.com/scarp-lang/scarp/blob/44fcd0f77ccb92648cdb1fc7632495c506c87cb3/docs/program-input.md).

## Terminal prompt के लिए explicit opt-in

~~~sh
scarp exec --interactive examples/interactive/greeting.srp < examples/interactive/greeting.stdin
~~~

`--interactive` के बिना `input`, `ask`, `ask_or` या typed input prompts नहीं चलते। `--input-file PATH` से पहले से लिखा UTF-8 input भेज सकते हैं।

## वास्तविक greeting

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

## वास्तविक typed calculator

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

## EOF और streams

`ask_or` EOF पर fallback देता है, खाली line पर नहीं। `try_read_line()` EOF पर `(false, "")` और खाली line पर `(true, "")` देता है। `flush_stdout()` तथा `flush_stderr()` interactive execution में output flush करते हैं।

Project tests `.stdin`, `.stdout` और `.stderr` exact files compare करते हैं। JSON v1/v2 output streams नहीं दिखाते; explicit diagnostics में निजी text आ सकता है। केवल trusted code चलाएँ।

## alpha.16 के बाद के डेवलपमेंट बिल्ड

`--interactive` के साथ `input_boolean(prompt)` ठीक वही छोटे अक्षरों वाले
मान स्वीकार करता है जो Scarp में लिखे जाते हैं, `true` और `false`।
अमान्य लाइन पर E0084 आता है। अगर पढ़ने के लिए कोई अगली लाइन न हो,
तो E0055 आता है।
[बूलियन प्रॉम्प्ट का उदाहरण](https://github.com/scarp-lang/scarp/blob/82237c9497caa9ea165e37683561cd45c9438cfb/examples/interactive/boolean_prompt.srp)
और [इनपुट फ़ाइल](https://github.com/scarp-lang/scarp/blob/82237c9497caa9ea165e37683561cd45c9438cfb/examples/interactive/boolean_prompt.stdin)
देखें।
