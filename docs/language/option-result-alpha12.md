# Typed Option, Result and checked early propagation — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

Published alpha.12 supports concrete `option<T>` and `result<T, E>` values. `Some`/`None` express presence/absence; `Ok`/`Err` carry a successful payload or a checked error. In a compatible function return type, `bind title = expression?;` either binds a successful payload or returns early on failure/absence.

## Tagged compiler example

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

## Important type rules

`validate_title` returns `Err` for missing or empty titles and `Ok(title)` for accepted text. `submit` propagates failure with `?`, skipping the remainder of its body. `has_title` propagates absence from `option<string>` into a compatible `option<boolean>` result. This is **not** unchecked extraction, exception throwing, or arbitrary user-defined generic type construction.

The code and expected output are verbatim release-pinned fixtures. The older alpha.11 compiler does not ship this published `?` feature.

[Published release](/releases/v0.0.6-alpha.12) · [Task-board tutorial](/tutorials/task-board-alpha12).
