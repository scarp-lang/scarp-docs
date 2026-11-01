# Language overview

This is a **version-specific** guide to Scarp v0.0.5-alpha.1, not a promise of a frozen language specification. Source files conventionally use `.srp` and must contain UTF-8 text.

## A short example

~~~scarp
pure funcra double(value: integer) -> integer {
    return value * 2;
}
var n = 3;
while n < 6 {
    print(double(n));
    n += 1;
}
~~~

Expected output:

~~~text
6
8
10
~~~

The example uses typed function parameters and return values, an immutable function body, a mutable local binding, and a boolean while condition.

## Source rules

- Identifiers consist of ASCII letters, digits, and underscores, and may not start with a digit.
- Identifiers are case-sensitive. Single-line comments start with `//`; block comments are not supported.
- Whitespace is flexible; Unicode content is supported in comments and string literals.
- Strings use double quotes. Supported escapes are `\\`, `\"`, `\n`, `\t`, and `\r`.
- Most declarations, assignments, calls, output, and control statements require a `;`. Braced blocks themselves do not.
- Lexical scopes are established with `{` and `}`; declarations do not become visible before their initializer.

## Reference map

The following chapters cover [variables](/language/variables), [types](/language/types), [operators](/language/operators), [control flow](/language/control-flow), [functions](/language/functions), [modules](/language/modules), [output](/language/output), and [memory](/language/memory). The compiler implements additional numerical operations; refer to [vectors and tiles](/language/numerics).

::: warning Not implemented
Class declarations, closures, user-defined generics, a package manager, native builds, and a general-purpose standard library are **not** present in this prerelease. Do not confuse design proposals with compiler capabilities.
:::

**Verified against:** [compiler language reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md), [current tests](https://github.com/scarp-lang/scarp/tree/v0.0.5-alpha.1/tests).
