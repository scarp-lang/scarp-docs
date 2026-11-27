# Generic functions और string operators

यह पाठ प्रकाशित [v0.0.7-alpha.3](/hi/releases/v0.0.7-alpha.3). उदाहरण interpreter के लिए हैं, native executable के लिए नहीं।

## Type inference

Inference argument के exact type को चुनता है। Explicit type arguments के लिए `::<...>` लिखें। Numeric constraint decimal precision को बनाए रखता है।

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

Binding का expected type शेष type parameter निर्धारित कर सकता है। Argument और expected type न होने पर explicit type argument दें।

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

Option payload का specialized type सुरक्षित रहता है। दोनों cases को संभालें। Generic Result में propagation के समय error type भी सुरक्षित रहता है।

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

## Strings

Concatenation में दो strings और repetition में string व integer चाहिए। Raw literal backslash सुरक्षित रखता है और triple quotes newline सुरक्षित रखते हैं।

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

## त्रुटियाँ और सीमाएँ

`print(vacant())` में पर्याप्त type context नहीं है। Numeric constraint string स्वीकार नहीं करता। Negative repetition विफल होती है; zero repetition खाली string देती है। Integer-left repetition, implicit conversion और interpolation उपलब्ध नहीं हैं। Generic expansion पर compiler की सीमाएँ लागू हैं।

Compiler में प्रति function 64 type parameters और 256 distinct specializations की सीमा है; expanded source और plan node budgets भी लागू हैं। Generic records, variants और callable values अभी उपलब्ध नहीं हैं।

[मूल generic contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/generic-functions.md) · [मूल string contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/string-operators.md).
