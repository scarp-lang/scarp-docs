# Typed Option, Result और early propagation — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

प्रकाशित alpha.12 में `option<T>` और `result<T, E>` ठोस typed values के रूप में उपलब्ध हैं। `Some` और `None` किसी value के मौजूद होने या न होने को बताते हैं। `Ok` और `Err` परिणाम का सही payload या error बताते हैं। उपयुक्त function return type में `bind title = expression?;` सफल value bind करता है या error/absence पर function से जल्दी return करता है।

## प्रकाशित tagged example

[typed_propagation.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_propagation.srp) · [expected stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_propagation.stdout)

~~~scarp
// Development-only: explicit propagation from immutable bindings.
record Task { title: string }

pure funcra validate_title(value: option<string>) -> result<string, string> {
    match on value {
        case None { return new result<string, string>::Err("title missing"); }
        case Some(title) {
            if title == "" {
                return new result<string, string>::Err("title empty");
            }
            return new result<string, string>::Ok(title);
        }
    }
}

// Failure skips the remaining body and returns Err from this function.
// The successful payload is bound to title, with no unchecked extraction.
pure funcra submit(value: option<string>) -> result<record Task, string> {
    bind title: string = validate_title(value)?;
    return new result<record Task, string>::Ok(new Task { title: title });
}

// Absence also propagates between distinct Option payload types.
pure funcra has_title(value: option<string>) -> option<boolean> {
    bind title = value?;
    return new option<boolean>::Some(title != "");
}

funcra present(outcome: result<record Task, string>) -> unit {
    match on outcome {
        case Ok(task) { print("Saved", task->title); }
        case Err(message) { print("Rejected", message); }
    }
}

present(submit(new option<string>::Some("Review PR")));
present(submit(new option<string>::Some("")));
present(submit(new option<string>::None()));
match on has_title(new option<string>::None()) {
    case None { print("No title"); }
    case Some(value) { print(value); }
}
match on has_title(new option<string>::Some("Ready")) {
    case None { print("No title"); }
    case Some(value) { print(value); }
}
~~~

~~~text
Saved Review PR
Rejected title empty
Rejected title missing
No title
true
~~~

~~~sh
scarp verify examples/typed_propagation.srp
scarp exec examples/typed_propagation.srp
~~~

## महत्वपूर्ण type नियम

`validate_title` में `Err` missing/empty title को reject करता है और `Ok(title)` सही text लौटाता है। `submit` में `?` failure को propagate करके बाकी body skip करता है। `has_title` में वही operator `option<string>` से `option<boolean>` के सही return contract में absence को propagate करता है। यह **unchecked unwrap**, exception throwing या arbitrary generic type constructors का विकल्प नहीं है।

सभी examples exact tagged source और expected stdout से लिए गए हैं। पुराने alpha.11 compiler में यह published `?` सुविधा उपलब्ध नहीं है।

[आधिकारिक रिलीज़](/hi/releases/v0.0.6-alpha.12) · [Task board tutorial](/hi/tutorials/task-board-alpha12).
