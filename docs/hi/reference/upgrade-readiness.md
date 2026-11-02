# अपग्रेड की तैयारी: Scarp alpha.1 → alpha.2

**पुराना baseline:** [v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) (`afe8b5380c9d6c4774162e51c6c9bc8b90901671`)। **नया प्रकाशित संस्करण:** [v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) (`e4db8e191cd7ea623123cae7348450ca6c95b170`), 2 नवंबर 2026।

यह Scarp Docs के लिए **अपग्रेड सत्यापन का पहला चरण** है। इसमें पुराने प्रकाशित **11 alpha.1 executable examples** को बिना बदले, नए alpha.2 compiler पर चलाया जाता है। इससे पूरा मुख्य reference अभी alpha.2 नहीं बन जाता और हर पुराने program के compatible होने की गारंटी नहीं मिलती।

## अपग्रेड टेस्ट में क्या होता है?

अलग `alpha2-conformance` GitHub Actions job **सटीक प्रकाशित alpha.2 commit** को checkout करके Rust compiler बनाती है। फिर TypeScript `test:alpha2-backcompat` script मूल [alpha.1 fixture manifest](https://github.com/scarp-lang/scarp-docs/blob/main/conformance/manifest.json) पढ़ती है। किसी पुराने source को बदला नहीं जाता।

1. `scarp --version` से **alpha.2** version और दोनों pinned manifests की पहचान जाँचना।
2. सभी पुराने `.srp` files पर `scarp check` चलाकर exit code 0 तथा खाली stdout/stderr माँगना।
3. उन्हीं files पर `scarp run` चलाकर **हर stdout byte** की पुराने alpha.1 `.stdout` से तुलना करना, अंतिम newline सहित।
4. पुराने `hello.srp` पर `scarp tokens` भी सत्यापित करना।

इससे अलग 11-program [alpha.1 baseline](/hi/reference/evidence), 12-program [alpha.2 features](/hi/releases/v0.0.5-alpha.2) और छह [alpha.2 diagnostic failures](/hi/tutorials/alpha2-diagnostics-and-repairs) की जाँच जारी रहती है।

## माइग्रेशन के लिए सभी 11 examples

| पुराना alpha.1 example | alpha.2 में दोबारा जाँच |
| --- | --- |
| `hello.srp` | सामान्य program output |
| `functions.srp` | Functions और return types |
| `loops.srp` | Conditional तथा while loop |
| `repeat.srp` | Counted iteration |
| `output.srp` | Output और newline |
| `vectors.srp` | Numerical vectors |
| `module_demo.srp` | Multi-file module imports |
| `matrix_forward.srp` | Matrix/tile गणना |
| `matrix_classification.srp` | Classification scores |
| `matrix_probabilities.srp` | Probability calculations |
| `matrix_targets.srp` | Target construction |

मूल source, imported modules और expected output में बदलाव नहीं किया गया। केवल **compiler executable का version** बदला जाता है।

## अपने कंप्यूटर पर चलाएँ

प्रकाशित alpha.2 commit `e4db8e191cd7ea623123cae7348450ca6c95b170` checkout करें, Cargo से compiler बनाएँ, फिर **scarp-docs repository root** से चलाएँ:

~~~sh
npm run test:alpha2-backcompat -- /path/to/alpha2/target/debug/scarp
~~~

सफल होने पर सभी 11 cases और एक tokens smoke test पास होंगे। यदि alpha.1 binary देंगे तो version check उसे अस्वीकार करेगा। वर्तमान CI परिणाम [Documentation CI workflow](https://github.com/scarp-lang/scarp-docs/actions/workflows/ci.yml) में देखें।

## इस प्रमाण की सीमाएँ

Green CI का अर्थ केवल इतना है कि **ये 11 exact examples** प्रकाशित alpha.2 compiler पर बिना बदले चले। इसका अर्थ यह नहीं कि हर alpha.1 source program, host API, error message, numerical edge case या third-party project compatible है। Scarp अभी experimental prerelease है।

मुख्य [feature status](/hi/reference/status), [installation](/hi/guide/installation) और पुराने tutorials अभी **alpha.1** पर आधारित हैं। मुख्य reference का पूर्ण alpha.2 migration करने से पहले प्रत्येक feature claim, बदले हुए syntax और compiler execution की अलग समीक्षा चाहिए। [Version compatibility](/hi/reference/compatibility) और [maintenance guide](/hi/project/maintenance) देखें।

**नए compiler `main` पर merged, मगर अभी tag में अप्रकाशित, काम को alpha.2 में उपलब्ध न बताएँ।**
