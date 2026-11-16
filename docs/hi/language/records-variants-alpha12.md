# Records, variants और destructuring — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

प्रकाशित alpha.12 में **source-defined typed records**, tagged variants और exhaustiveness जाँचने वाला `match on` उपलब्ध है। `record Task` डेटा के नाम वाले fields बताता है और `variant Submission` अलग tagged outcomes का contract है। `new Task { ... }` से record तथा `new Submission::Accepted(...)` से variant बनता है। ये class inheritance या reflection का वादा नहीं हैं।

## Tagged records और variants से validation

[variant_validation.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/variant_validation.srp) · [expected stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/variant_validation.stdout)

~~~scarp
// A submission returns exactly one outcome with a typed payload.
record Task { title: string }
variant Submission {
    Accepted(record Task),
    Rejected(string),
}

pure funcra submit(title: string) -> variant Submission {
    if title == "" {
        return new Submission::Rejected("Enter a task title");
    }
    return new Submission::Accepted(new Task { title: title });
}

funcra present(outcome: variant Submission) -> unit {
    match on outcome {
        case Rejected(message) { print(message); }
        case Accepted(task) { print("Saved", task->title); }
    }
}

present(submit(""));
present(submit("Review settings"));
~~~

~~~text
Enter a task title
Saved Review settings
~~~

~~~sh
scarp verify examples/variant_validation.srp
scarp exec examples/variant_validation.srp
~~~

## Nested tuple/array destructuring

[data_destructure.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/data_destructure.srp) · [expected stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/data_destructure.stdout)

~~~scarp
// Structural destructuring evaluates one initializer for multiple bindings.
pure funcra make_pair(value: integer) -> tuple<integer, string> {
    return (value * 2, "ready");
}

bind (result, state) = make_pair(21);
print(result, state);

var [first, second, third] = [array: 3, 5, 7];
first += second;
print(first, third);

// The underscore ignores the corresponding element, without storing it.
bind (_, answer) = (true, 42);
print(answer);

{
    bind (result, note) = (5, "inner");
    print(result, note);
}
print(result);

bind ([(quantity, unit_price), (_, spare_price)], currency) =
    ([array: (2, 15), (1, 7)], "INR");
print(quantity * unit_price + spare_price, currency);
~~~

~~~text
42 ready
8 7
42
5 inner
42
37 INR
~~~

~~~sh
scarp verify examples/data_destructure.srp
scarp exec examples/data_destructure.srp
~~~

## Typed UI-event डेटा (graphical UI नहीं)

[ui_event_patterns.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/ui_event_patterns.srp) · [expected stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/ui_event_patterns.stdout)

~~~scarp
// Describe events from a small panel using the same patterns as declarations.
record Button {
    label: string,
    position: tuple<integer, integer>,
    active: boolean,
}

variant Event {
    Click(record Button),
    Resize(tuple<integer, integer>),
    Batch(array<integer, 2>),
    Idle,
}

funcra render(event: variant Event) -> unit {
    match on event {
        case Click({position: (x, y), label: name}) { print("Click", name, x, y); }
        case Resize((width, height)) { print("Resize", width, height); }
        case Batch([first, _]) { print("First item", first); }
        case Idle { print("Idle"); }
    }
}

bind button = new Button { position: (4, 9), active: true, label: "Save" };
bind {label: title} = button;
print("Button", title);
render(new Event::Click(button));
render(new Event::Resize((80, 24)));
render(new Event::Batch([array: 5, 8]));
render(new Event::Idle());
~~~

~~~text
Button Save
Click Save 4 9
Resize 80 24
First item 5
Idle
~~~

~~~sh
scarp verify examples/ui_event_patterns.srp
scarp exec examples/ui_event_patterns.srp
~~~

## Patterns कैसे पढ़ें

`case Rejected(message)` tagged payload को नाम देता है; `case Accepted(task)` मिलने पर `task->title` से named field पढ़ते हैं। `(result, state)` tuple को दो bindings में बाँटता है। `[first, second, third]` fixed array को अलग bindings में बाँटता है। `_` उस भाग को बिना नाम दिए अनदेखा करता है। Nested patterns field, tuple और array को साथ इस्तेमाल करते हैं। UI-event example events की shape और match logic दिखाता है, **graphical window नहीं** बनाता।

Records और variants compiler से checked types हैं। यह feature interpreter की published capability है; experimental native backends के लिए पूरे aggregate support का दावा नहीं किया गया है। सभी runnable code blocks प्रकाशित source से लिए गए हैं।

[रिलीज़ और डाउनलोड](/hi/releases/v0.0.6-alpha.12) · [Option/Result patterns](/hi/language/option-result-alpha12) · [Task board project](/hi/tutorials/task-board-alpha12).
