# Fixed-array traversal और Boolean input — alpha.17

<!-- scarp-cli-release: v0.0.6-alpha.17 -->
<!-- scarp-current-source: 7831a37939965f557ce746e1d86bf82d3d629f74 -->

यह फीचर पहली बार [प्रकाशित v0.0.6-alpha.17](/hi/releases/v0.0.6-alpha.17) में उपलब्ध हुआ। पुराने alpha.1 reference में इसे मौजूद न मानें।

## Immutable array के सभी तत्व पढ़ें

`array_len(values)` से लम्बाई प्राप्त करें और `repeat` में शून्य से शुरू होने वाला index उपयोग करें। `array_get_or` गलत index पर त्रुटि देने के बजाय तय किया गया fallback देता है।

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

खाली fixed array की लम्बाई `0` है और `repeat 0 as index` नहीं चलता। **Index सही होने पर भी** fallback expression को एक बार evaluate किया जाता है। अगर गलत index पर error चाहिए तो `values[index]` लिखें; उसकी त्रुटि E0063 है।

## Terminal से Boolean पढ़ना

`input_boolean(prompt)` interactive mode में केवल lowercase `true` और `false` पढ़ता है। `yes`, `1` या `True` मान्य नहीं हैं। गलत text पर E0084 और पूरी पंक्ति आने से पहले EOF होने पर E0055 मिलता है। Input तथा prompt हमेशा runtime budgets से सीमित हैं।

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

ऊपर `--input-file` से वही दो पंक्तियाँ पढ़ी जाती हैं जो प्रकाशित compiler के उदाहरण में थीं। Terminal पर वही values खुद टाइप करने से पहले `scarp version` जाँचें।

## अगले संस्करण में क्या बदला?

[प्रकाशित alpha.18](/hi/releases/v0.0.6-alpha.18) में immutable `array_set` तथा path के बिना `scarp exec` मिलता है। फिर भी indexed assignment और सामान्य native compilation समर्थित नहीं हैं।

[Compiler example](https://github.com/scarp-lang/scarp/blob/7831a37939965f557ce746e1d86bf82d3d629f74/examples/array_traversal.srp) · [Input example](https://github.com/scarp-lang/scarp/blob/7831a37939965f557ce746e1d86bf82d3d629f74/examples/interactive/boolean_prompt.srp)
