# प्रयोगात्मक scalar C11 emitter — v0.0.5-alpha.5

<!-- scarp-c-backend-release: v0.0.5-alpha.5 -->
<!-- scarp-c-backend-source: 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 -->

यह API [alpha.5 compiler prerelease](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) में source commit 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 पर **Rust embedding** के लिए प्रकाशित हुई है। यह **scarp compile CLI command नहीं**, न ही सामान्य native Scarp executable generator या stable ABI है।

## Rust embedding API

Tagged library में scarp::c_backend::emit_c(source: &str) और emit_program(&ResolvedProgram) हैं। ये पूरे freestanding C11 source का **string**, या compiler diagnostic, लौटाते हैं। API अपने आप C compiler/linker नहीं चलाती, file नहीं लिखती, registry/network का उपयोग नहीं करती।

एक Rust embedding host का उदाहरण:

~~~rust
let c_source = scarp::c_backend::emit_c(
    "var total = 0; repeat 4 as n { total += n; } print(total);"
)?;
~~~

Generated C को compile करना हो तो host को अलग से **C11 toolchain** चुनना पड़ेगा। यह Rust API का उदाहरण है, Scarp CLI command नहीं। प्रकाशित interpreter example [alpha.5 guide](/hi/releases/v0.0.5-alpha.5) में है।

## समर्थित और असमर्थित सुविधाएँ

| C11 emitter स्वीकारता है | C11 emitter अस्वीकारता है |
| --- | --- |
| Scalar integers/booleans, checked arithmetic और bit operations, comparison तथा short-circuit logic | Floats, vectors, numerical tiles, functions और recursion |
| bind/var scalar slots, updates, if, while, counted repeat, nested loops, break/continue | Unsupported imports, computed strings तथा dynamic collections |
| Single-argument stdout print/println में scalar या literal UTF-8 text | Multi-argument output, stderr, write और unsupported intrinsics |

**Unsupported C forms पर E0049** मिलता है। गलत shift पर E0046 और negative repeat count पर E0019 होता है। ये **C backend के प्रतिबंध** हैं; interpreter की सारी language features हटाई नहीं गई हैं।

इस emitter की सीमाएँ हैं: **256 scalar slots**, **4096 operations**, **1024 expression nodes प्रति expression**, **16384 total nodes** और **65536 bytes literal text payload**। Generated C में caller-owned struct scarp_workspace और struct scarp_host हैं। केवल work और print budgets समर्थित हैं, interpreter के सभी ExecutionOptions नहीं।

scarp_validate बिना output के budgeted verification करता है। scarp_run validation के बाद host callback को output देता है। Callback failure से पहले लिखे bytes बने रह सकते हैं। Toolchain, stable ABI, memory sandbox या native artifact creation की गारंटी यह API नहीं देती।

## प्रकाशित प्रमाण

[Tagged C backend implementation](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/src/c_backend.rs), [C backend tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/tests/c_backend.rs), [Proposal 0035](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/docs/proposals/0035-native-scalar-c11.md) और [GitHub release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) वास्तविक स्रोत हैं। Compiler की CI interpreter/C differential tests करती है। Docs इस सुविधा को native compiler नहीं कहती।

[alpha.5 CLI](/hi/tooling/cli-alpha5), [इंस्टॉलेशन](/hi/guide/installation-alpha5), [फीचर स्थिति](/hi/reference/status) भी देखें।
