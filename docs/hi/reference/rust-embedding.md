# Rust प्रोग्राम में Scarp interpreter उपयोग करें

Scarp interpreter Rust crate API देता है; यह अभी प्रयोगात्मक है और registry package के रूप में नहीं, source checkout के path dependency से उपयोग करना उचित है।

## काम के अनुसार API चुनें

| API | उपयोग |
| --- | --- |
| `scarp::parse` | syntax AST, runtime evaluation नहीं |
| `scarp::compile` | नाम/type resolution; arithmetic नहीं चलता |
| `scarp::check` | चयनित path की evaluation, user output नहीं |
| `scarp::run` | source-string की evaluation, caller-supplied writer |
| `scarp::run_with_io` | stdout और stderr के अलग writer |
| `modules::compile_file` | trusted filesystem में source imports |
| `modules::compile_with_loader` | custom/in-memory module loading |

## बिना global stdout बदले execute करें

~~~rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut output = Vec::new();
    scarp::run("print(1 + 2);", &mut output)?;
    assert_eq!(output, b"3\n");
    Ok(())
}
~~~

`RunError` diagnostic और writer error अलग बताता है। `compile` किए गए immutable program को कई बार चलाने पर हर execution का local state नया बनता है।

## फ़ाइल-आधारित modules

`modules::compile_file` के साथ trusted root से import graph बनता है। Untrusted/in-memory स्रोत के लिए `MemorySourceLoader` या अपनी loader implementation और `ModuleLimits` का उपयोग करें। केवल string-level APIs अपने-आप file imports नहीं पढ़ते।

## APIs और compatibility

Rust में public types/enum variants भविष्य के alpha releases में बदल सकते हैं। [compiler embedding reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/embedding.md) से API की सही signatures मिलाएँ। [लोडिंग सुरक्षा](/hi/reference/source-loading) और [compatibility](/hi/reference/compatibility) पढ़ें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let source = r#"print("Hello from Scarp!");"#;
    let mut output = Vec::new();
    scarp::run(source, &mut output)?;
    assert_eq!(output, b"Hello from Scarp!\n");
    Ok(())
}
```

```rust
use scarp::{modules, ExecutionOptions};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let limits = modules::ModuleLimits::default();
    let program = modules::compile_file("main.srp", limits)?;
    program.check(ExecutionOptions::default())?;
    let (mut out, mut err) = (Vec::new(), Vec::new());
    program.execute(&mut out, &mut err, ExecutionOptions::default())?;
    Ok(())
}
```
