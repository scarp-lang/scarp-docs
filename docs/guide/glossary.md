# Scarp glossary for new developers

This glossary explains common words in the **v0.0.5-alpha.1** documentation. Scarp is still experimental: these descriptions explain the published interpreter, not a promise that future versions will behave identically.

## Source file (`.srp`)

A UTF-8 text file containing Scarp code. Save a file such as `hello.srp`, then run it with the [CLI](/tooling/cli). The file extension does not mean the program has been compiled into a native executable.

## Interpreter

A program that reads and executes Scarp source. The current Scarp distribution is an **interpreter** implemented in Rust. See [installation](/guide/installation).

## Token, lexer, and parser

A **token** is one meaningful piece of source text, such as a name, number, or operator. The **lexer** converts source text into tokens; the **parser** uses them to build the program structure. Run `scarp tokens hello.srp` to inspect the tokens. Tokenization alone does not validate a complete program.

## Binding (`bind`) and variable (`var`)

A **binding** associates a name with a value. `bind` creates an immutable binding, while `var` allows reassignment.

~~~scarp
bind language = "Scarp";
var visits = 1;
visits += 1;
print(language, visits);
~~~

See [variables and scopes](/language/variables).

## Type

A **type** describes what kind of value an operation expects: for example `integer`, `float`, `string`, or `boolean`. Scarp checks operations against its implemented types. See [types and values](/language/types).

## Scope

The part of a program in which a name is visible. Braced blocks introduce lexical scopes. Refer to [variables and scopes](/language/variables) for examples.

## Function (`funcra`)

A named block of reusable operations. Scarp's published function syntax uses `funcra`, with explicit parameter and return types. `pure` can be used for functions that meet the language's purity rules. See [functions](/language/functions).

## Control flow

Constructs that determine which code executes and how often, such as `if`, `elif`, `else`, `while`, and `repeat`. See [control flow](/language/control-flow) and the [loop tutorial](/tutorials/repeat-and-loops).

## Module

A Scarp source file imported by another source file. Current modules are source-based; a package manager is not part of this prerelease. See [modules](/language/modules).

## Standard output and standard error

Two distinct process output streams. Scarp's output operations may write ordinary results to **stdout** or diagnostic output to **stderr**. See [output streams](/language/output).

## CLI

The **command-line interface** is how you invoke the interpreter from a terminal. For example:

~~~sh
scarp --version
scarp check hello.srp
scarp run hello.srp
~~~

`check` and `run` have different purposes; read the [CLI reference](/tooling/cli) before using them in automation.

## Runtime budget

An interpreter limit intended to bound some forms of work while a program runs. This is not a memory-safety or sandbox guarantee. See [runtime budgets](/reference/budgets) and [source loading and security](/reference/source-loading).

## Fixture and conformance test

A **fixture** is a known input program paired with expected behavior, often including its stdout. A **conformance test** runs the program and compares actual behavior to that expectation. The [verified examples](/examples/) and [testing evidence](/reference/evidence) explain how this documentation checks claims against compiler-owned programs.

## Prerelease and compatibility

A **prerelease** is an early version whose behavior may change. Before following an example, run `scarp --version` and compare with the [documented feature status](/reference/status) and [compatibility notes](/reference/compatibility).

Continue with [your first program](/guide/first-program) or [the language overview](/language/overview).