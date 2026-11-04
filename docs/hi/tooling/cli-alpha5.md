# Scarp CLI — प्रकाशित v0.0.5-alpha.5

<!-- scarp-cli-release: v0.0.5-alpha.5 -->
<!-- scarp-alpha5-cli-reference: 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 -->

यह वर्तमान प्रकाशित Scarp CLI reference है। इसका आधार [GitHub release v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) (4 नवंबर 2026) तथा exact source commit 2eeed0aa52ccb59523307841ad8ffbd83f8911a8 है। CLI अभी Rust interpreter चलाती है; यह **native executable बनाने वाली compiler CLI नहीं** है।

नए इंस्टॉलेशन के लिए [alpha.5 इंस्टॉलेशन](/hi/guide/installation-alpha5) पढ़ें। पुराने versions पर काम करते समय अलग [alpha.4 CLI](/hi/tooling/cli-alpha4), [alpha.3 CLI](/hi/tooling/cli) तथा [alpha.1 CLI](/hi/tooling/cli-alpha1) के निर्देश देखें।

## किस release में कौन-सी command है?

| Command या सुविधा | पहला प्रकाशित version | सामान्य statements चलती हैं? |
| --- | --- | --- |
| scarp exec FILE, static scarp verify FILE, scarp inspect tokens/ast/modules FILE | alpha.3 | exec पर **हाँ**, verify/inspect पर **नहीं** |
| scarp create DIRECTORY, scarp launch DIRECTORY, scarp verify DIRECTORY | alpha.4 | launch पर **हाँ**, create नई files बनाता है, verify static |
| **scarp inspect modules --json DIRECTORY** | **alpha.5** | **नहीं**, static project module inspection |
| scarp modules --json DIRECTORY (पुराना नाम) | alpha.5 | **नहीं** |
| scarp diagnose --json, scarp guide, scarp version | alpha.3 | नहीं |
| Rust C11 emitter emit_c/emit_program | alpha.5 | CLI command नहीं; अलग Rust API |
| scarp compile, scarp build, सामान्य native executable generation | **अभी नहीं** | उपलब्ध नहीं |

## Project-directory module inspection

ऐसे writable parent folder में जाएँ जहाँ hello-scarp नाम का folder **पहले से न हो**। Generated project में version-1 Scarp.project manifest और src/main.srp entrypoint होता है। Commands:

~~~sh
scarp version
scarp create hello-scarp
scarp verify hello-scarp
scarp inspect modules --json hello-scarp
scarp inspect modules --json hello-scarp/src/main.srp
scarp modules --json hello-scarp
scarp launch hello-scarp
~~~

दोनों inspect commands एक ही canonical entrypoint से **schema-version-1 JSON module inventory** देती हैं। पुराना modules alias compatibility के लिए बचा है। Inspect सामान्य runtime statements नहीं चलाता और native artifacts नहीं बनाता।

गलत, अनुपस्थित, बहुत बड़ी या unsafe manifest पर **exit status 1** और stderr diagnostic मिलता है, partial module inventory नहीं। --diagnostic-format=json **errors** का JSON format है; सफल inventory के लिए --json अलग विकल्प है। Project path स्पष्ट देना जरूरी है; parent folders में manifest अपने आप नहीं खोजी जाती। Traversal और escaping symlinks reject होते हैं।

Alpha.4 से create/verify/launch का मूल workflow वही है। create मौजूदा **खाली folder को भी overwrite नहीं करता**। verify DIRECTORY static जाँच है; launch DIRECTORY interpreter से entrypoint चलाता है। Manifest में अधिकतम **4096 UTF-8 bytes**, तीन ordered fields और project के भीतर entry path होना चाहिए।

## प्रकाशित alpha.5 का पूरा interpreter उदाहरण

Release में [native_scalar_repeat.srp](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/examples/native_scalar_repeat.srp) तथा stdout fixture मौजूद हैं। Official archive के examples folder से चलाएँ:

~~~sh
scarp verify examples/native_scalar_repeat.srp
scarp exec examples/native_scalar_repeat.srp
~~~

Interpreter का output:

~~~text
even-index sum
6
triangle cells
6
0
2
~~~

यह counted repeat loops और scalar गणना का example है। इससे **अलग native executable नहीं बनता**।

## Exit codes और diagnostics

| Exit code | अर्थ |
| --- | --- |
| 0 | सफल command |
| 1 | Manifest, source, runtime, I/O या budget error; stderr diagnostic |
| 2 | गलत command/flag या argument की कमी |

Static verify सामान्य runtime statements नहीं चलाता। पुराना check चुनिंदा runtime paths चला **सकता है**, इसलिए verify के समान नहीं है। Module inspection static है; runtime budget flags उसके लिए नहीं हैं। exec/launch अब भी interpreter इस्तेमाल करते हैं। Offline diagnose --json version/platform/capabilities बताता है; सफल report और error diagnostics दो अलग formats हैं।

## Rust-only C11 emitter, CLI compiler नहीं

[प्रयोगात्मक C11 backend](/hi/reference/c11-backend-alpha5) Rust embedding host को scarp::c_backend::emit_c या emit_program से C11 string देता है। Host अपना अलग C compiler प्रदान करे। इस release में scarp compile command या सामान्य native executable build नहीं आया। Unsupported emitter forms पर E0049 मिलता है। Interpreter का समर्थित language subset अधिक बड़ा है।

[alpha.5 release guide](/hi/releases/v0.0.5-alpha.5), [फीचर स्थिति](/hi/reference/status), [इंस्टॉलेशन](/hi/guide/installation-alpha5) और [compatibility](/hi/reference/compatibility) भी देखें।

**प्रमाण:** [Tagged CLI implementation](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/src/main.rs), [project tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.5/tests/scarp_projects.rs), [प्रकाशित release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) और source 2eeed0aa52ccb59523307841ad8ffbd83f8911a8। CI exact published compiler बनाकर file और directory inspection की जाँच करती है।
