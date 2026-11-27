# Generic functions and string operators

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

This lesson targets published [v0.0.7-alpha.3](/releases/v0.0.7-alpha.3). Examples target the interpreter, not a native executable.

## Type inference

Inference selects the exact argument type. Explicit type arguments use `::<...>`. Numeric constraints preserve decimal precision.

~~~scarp
pure funcra identity<T>(value: T) -> T { return value; }
pure funcra square<T: Numeric>(x: T) -> T { return x * x; }
print(identity(100), identity("Scarp"), identity(true));
print(identity::<integer>(7), square(0.1d));
~~~

~~~text
100 Scarp true
7 0.01
~~~

## Contextual inference

The expected binding type can determine a missing type parameter. A call without an argument or expected type must use explicit type arguments.

~~~scarp
pure funcra vacant<T>() -> list<T> { return [list: <T>]; }
bind names: list<string> = vacant();
bind counts = vacant::<integer>();
print(names, counts);
~~~

~~~text
[list: <string>] [list: <integer>]
~~~

## Option payloads

Option payloads retain the specialized type. Both cases must be handled. A generic Result can also preserve its error type through propagation.

~~~scarp
pure funcra some<T>(value: T) -> option<T> {
    return new option<T>::Some(value);
}
pure funcra unwrap<T>(input: option<T>, fallback: T) -> T {
    match on input {
        case Some(value) { return value; }
        case None { return fallback; }
    }
}
print(unwrap(some("Scarp"), "missing"));
~~~

~~~text
Scarp
~~~

## Result payloads and propagation

A generic Result may transform its success payload while retaining the exact error type required by propagation with `?`. Here the successful value becomes a one-element tuple; a failure is returned unchanged.

~~~scarp
pure funcra wrap<T, E>(input: result<T, E>) -> result<tuple<T>, E> {
    bind value = input?;
    return new result<tuple<T>, E>::Ok((value,));
}
funcra display(input: result<tuple<integer>, string>) -> unit {
    match on input {
        case Ok((value,)) { print(value); }
        case Err(error) { print(error); }
    }
}
display(wrap(new result<integer, string>::Ok(12)));
display(wrap(new result<integer, string>::Err("failed")));
~~~

~~~text
12
failed
~~~

## Strings

Concatenation takes two strings. Repetition takes a string and integer. Raw literals preserve backslashes; triple quotes preserve newlines.

~~~scarp
bind greeting = "Hello" + " Scarp";
print(greeting);
print("ab" * 3);
print(r"literal\n");
print("""first
second""");
~~~

~~~text
Hello Scarp
ababab
literal\n
first
second
~~~

## Errors and limits

`print(vacant())` lacks type context. A Numeric constraint rejects strings. Negative repetition fails; zero yields an empty string. Integer-left repetition, implicit conversion and interpolation are unsupported. Generic expansion is bounded.

A function may declare up to 64 type parameters; specialization is limited to 256 distinct instances, with expanded-source and plan-node budgets. User-defined generic records, variants and callable values are not supported.

[Pinned generic contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/generic-functions.md) · [Pinned string contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/string-operators.md).
