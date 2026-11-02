# Built-ins and standard library status

**Scarp v0.0.5-alpha.1 does not have a general-purpose standard library or package manager.** What exists today is a set of interpreted built-in numerical operations, source-language output statements, and a **Rust embedding API**. They are not interchangeable.

## Newer released alpha.2 built-ins

**v0.0.5-alpha.2**, published November 2, adds immutable **integer collections** with operations such as `ints_range`, `ints_window`, `ints_set`, `ints_join`, `ints_to_vector`; explicit checked `to_float` and `to_integer` conversions; seven Unicode text queries; numerical `variance`, `stddev`, `relu`, `sigmoid` and `tanh`; and additional score/loss utilities. The [compiler-verified alpha.2 tutorial](/tutorials/alpha2-collections-and-learning) exercises these capabilities using real published programs. This section does **not** backport them into the alpha.1 table below, nor claim a full package system.

## Built-in numerical operations

The following names appear in the compiler's current references and example fixtures. These are not a promise of a complete scientific-computing library; verify signatures and error behavior in the linked sources before use.

| Area | Shipped examples |
| --- | --- |
| Vector construction and inspection | `len`, `fill`, checked `values[index]` |
| Elementwise vector work | `scale`, `clamp` |
| Reductions and products | `sum`, `mean`, `dot`, `mse` |
| Classification/numerical helpers | `softmax`, `argmax`, `onehot` |
| Tiles and matrices | `tile`, `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd`, `tilescale` |

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(sum(values), mean(values));
print(dot(values, [2.0, -1.0, 0.5, 2.0]));
~~~

Additional numerical kernels include specialized vector window, norm, log-space, and loss operations. For **signatures, input validation, finite-result rules and exact support**, refer to the compiler's [vector](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md) and [tile](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md) references. These functions are intentionally not described as generic collections or a package API.

## Output statements

`print`, `println`, `write`, `eprint`, and `ewrite` are **language statements**, not imported library functions. See [output](/language/output).

## Rust embedding API

See the practical [Rust embedding reference](/reference/rust-embedding) for the host API boundaries and code examples.

Scarp's **host library**, implemented in Rust, exposes lexer, parser, resolution, compile and interpreter operations. For example:

~~~rust
let mut output = Vec::new();
scarp::run(r#"print("Hello from Scarp!");"#, &mut output).unwrap();
assert_eq!(output, b"Hello from Scarp!\n");
~~~

Multiple-file programs require explicit `modules::compile_file` or an in-memory loader API; source-only entry points do not automatically resolve filesystem imports. This is a Rust API and cannot be imported as a Scarp source module.

**Verified against:** [compiler README](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/README.md), [embedding reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/embedding.md).
