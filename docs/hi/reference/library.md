# Built-ins और standard library की स्थिति

**सामान्य-purpose standard library अभी प्रकाशित नहीं है।** लेकिन interpreter में कई विशिष्ट numerical built-ins उपलब्ध हैं। Built-ins को package manager या stable public library का विकल्प न समझें।

## नई alpha.2 built-ins

**2 नवंबर 2026** को प्रकाशित **v0.0.5-alpha.2** में immutable **integer collections** (`ints_range`, `ints_window`, `ints_set`, `ints_join`, `ints_to_vector`), स्पष्ट checked `to_float`/`to_integer` conversions, Unicode text queries, और `variance`, `stddev`, `relu`, `sigmoid`, `tanh` जैसे numerical functions शामिल हैं। इन्हें [सत्यापित alpha.2 ट्यूटोरियल](/hi/tutorials/alpha2-collections-and-learning) में वास्तविक source/output के साथ सीखें। नीचे के पुराने numerical संदर्भ को alpha.1 के लिए अलग रखा गया है।

## Numerical operations

वैक्टर पर `len`, `sum`, `mean`, `dot`, `mse`, `fill`, `scale`, `clamp`, `softmax` आदि उपलब्ध हैं। कुछ अन्य operations compensated reductions, norms, log-space kernels, selection और classification loss से संबंधित हैं। Tile/matrix के लिए `tile`, `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd`, `tilescale` उपलब्ध हैं।

इनमें arity, type, shape और domain checks होते हैं। Float values finite रहने चाहिए। पूरा current set और exact signatures [compiler के numerical references](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md) तथा [tiles](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/tiles.md) में देखें।

## आउटपुट statements

`print`, `println`, `write`, `eprint`, `ewrite` output statements हैं; ये general callable built-ins नहीं हैं। इनके व्यवहार के लिए [output](/hi/language/output) देखें।

## Rust embedding API

Host Rust application में interpreter APIs उपलब्ध हैं: `scarp::compile`, `scarp::run`, `scarp::check`, `modules::compile_file` और अन्य stage-specific APIs। यह **Rust host library API** है, Scarp language की standard library नहीं। [Rust में embedding](/hi/reference/rust-embedding) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(sum(values), mean(values));
print(dot(values, [2.0, -1.0, 0.5, 2.0]));
~~~

~~~rust
let mut output = Vec::new();
scarp::run(r#"print("Hello from Scarp!");"#, &mut output).unwrap();
assert_eq!(output, b"Hello from Scarp!\n");
~~~
