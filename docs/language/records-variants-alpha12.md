# Records, tagged variants and nested destructuring — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

Published alpha.12 adds **source-defined typed records**, tagged variants and exhaustive checked `match on`. Use `record Task` for named fields and `variant Submission` for disjoint tagged outcomes. `new Task { ... }` constructs a record; `new Submission::Accepted(...)` constructs a tagged payload. These are not runtime class inheritance or reflection.

## Tagged record/variant validation

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

## Nested tuple and array destructuring

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

## Typed UI-event data (not a graphical UI)

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

## How the patterns work

`case Rejected(message)` names a tagged payload; `case Accepted(task)` provides a record whose field is read through `task->title`. `(result, state)` destructures a tuple; `[first, second, third]` destructures a fixed array. `_` ignores a position. Nested patterns can combine records, tuples and fixed arrays. The UI-event sample models event **data**, but does not create windows or a visual event loop.

Records and variants have checked shapes and cases. These samples are pinned to the published interpreter; the native backends support a narrower subset. Every runnable code block and expected stdout above comes from the exact tagged source.

[Release and downloads](/releases/v0.0.6-alpha.12) · [Option/Result patterns](/language/option-result-alpha12) · [Task-board project](/tutorials/task-board-alpha12).
