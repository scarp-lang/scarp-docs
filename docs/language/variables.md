# Variables and scopes

In v0.0.5-alpha.1, Scarp uses **`bind`** for immutable values and **`var`** for mutable values. Earlier prereleases used different declaration syntax; see [compatibility](/reference/compatibility).

**New since published alpha.2:** Optional checked annotations such as `bind count: integer = 42;` are covered in the [verified typed-bindings and conversions lesson](/language/typed-bindings-alpha2). This page's examples and original implementation references remain pinned to **alpha.1**; do not infer that alpha.1 accepts declaration annotations.

## Immutable bindings

~~~scarp
bind width = 6;
bind height = 7;
bind area = width * height;
print(area); // 42
~~~

Bindings must have a name, `=`, an initializer, and a trailing semicolon. The value's type is inferred. There are no uninitialized declarations or implicit new variables. A name becomes visible *after* its initializer; self-references, forward references, and duplicates in one scope are errors.

## Mutable bindings

~~~scarp
var count = 2;
bind snapshot = count;
count += 5;
print(count);    // 7
print(snapshot); // 2
~~~

A mutable value may be changed with `=`, `+=`, `-=`, `*=`, and `/=`. Compound operations require numeric values of the same type. A reassignment must preserve the original inferred type. Reassigning a copy does not change the original snapshot.

## Lexical scopes and shadowing

~~~scarp
var total = 1;
{
    bind total = total + 10;
    print(total); // 11
}
total += 2;
print(total); // 3
~~~

The initializer in the inner block reads the outer `total`, then introduces a new one that hides it. On block exit the inner name goes out of scope. Assignment resolves the **nearest** visible binding; it cannot skip an immutable inner binding to mutate an outer one.

## Restrictions

File and function scopes are distinct. Functions cannot implicitly capture arbitrary top-level script variables. Blocks are statements, not expressions. There is no string concatenation via `+`, implicit conversion, increment operator, or assignment expression. See [memory and lifetimes](/language/memory) for how scope retirement works internally.

**Verified against:** [variable reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/variables.md), [mutability tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/mutability.rs).
