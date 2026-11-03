# Scarp की फीचर और रिलीज़ स्थिति

<!-- scarp-release-status: v0.0.5-alpha.3 -->
<!-- scarp-main-reference-baseline: v0.0.5-alpha.1 -->

**नवीनतम प्रकाशित compiler: [v0.0.5-alpha.3](/hi/releases/v0.0.5-alpha.3), 2 नवंबर 2026।** मुख्य language-reference अध्याय जानबूझकर **v0.0.5-alpha.1** पर आधारित हैं। Alpha.2 और alpha.3 में सत्यापित सुविधाएँ उनके अलग release guides में हैं। **तीनों experimental prereleases हैं।** स्थिर compatibility की कोई गारंटी नहीं है।

नए programs के लिए [alpha.3 quickstart](/hi/guide/quickstart-alpha3) और [वर्तमान CLI](/hi/tooling/cli) पढ़ें। पुराने programs migrate करने से पहले [version compatibility](/hi/reference/compatibility) जाँचें।

## प्रकाशित releases का compiler प्रमाण

| प्रकाशित रिलीज़ | Source commit | परीक्षण का दायरा | प्रमाण |
| --- | --- | --- | --- |
| **[v0.0.5-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1)** (1 नवंबर 2026) | `afe8b5380c9d6c4774162e51c6c9bc8b90901671` | **11** मूल runnable examples, मुख्य reference का आधार | [परीक्षण प्रमाण](/hi/reference/evidence) |
| **[v0.0.5-alpha.2](/hi/releases/v0.0.5-alpha.2)** (2 नवंबर 2026) | `e4db8e191cd7ea623123cae7348450ca6c95b170` | **12** tagged programs का अलग compiler-tested suite | [Alpha.2 guide](/hi/releases/v0.0.5-alpha.2) |
| **[v0.0.5-alpha.3](/hi/releases/v0.0.5-alpha.3)** (2 नवंबर 2026) | `7715c28df09c7703b39e14fddb963275b25df476` | **4** पूरे tagged programs, JSON diagnostic और CLI tests | [Alpha.3 guide](/hi/releases/v0.0.5-alpha.3) |

यह संख्या प्रत्येक release के **अलग सत्यापित examples** की है; पूरे language features की संख्या या हर पुराने program की compatibility का प्रमाण नहीं। [Alpha.1 → alpha.2 upgrade gate](/hi/reference/upgrade-readiness) में मूल 11 programs को alpha.2 पर दोबारा चलाया जाता है; इससे alpha.3 की सामान्य backward compatibility सिद्ध नहीं होती।

## मुख्य संदर्भ: v0.0.5-alpha.1 में उपलब्ध सुविधाएँ

यह table **केवल alpha.1 baseline** का है, नवीनतम alpha.3 की पूरी सूची नहीं:

| उपलब्ध सुविधा | Alpha.1 का प्रकाशित प्रमाण |
| --- | --- |
| `bind`, `var`, scopes, shadowing, mutation | [Variables](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/variables.md) |
| Checked `integer`, finite `float`, `string`, `boolean` | [Language reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/language.md) |
| `if`, `elif`, `else`, `while`, `repeat` | [Iteration tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/loops.rs) |
| Typed `funcra`, defaults, contracts, purity, recursion | [Function tests](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/tests/functions.rs) |
| `print`, `println`, `write`, `eprint`, `ewrite` | [Output guide](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/output.md) |
| Numerical vectors, tiles और kernels | [Vector reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/vectors.md) |
| Local relative imports, public functions और scalar constants | [Modules](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md) |
| पुराने `run`, `check`, `tokens` और help/version commands | [Alpha.1 CLI archive](/hi/tooling/cli-alpha1) |
| Runtime budgets, automatic value retirement | [Budgets](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/budgets.md) |

## प्रकाशित alpha.2 के सत्यापित उदाहरण

नीचे के **12 programs** प्रकाशित **[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2)** tag से हैं और अलग compiler conformance CI में चलते हैं।

| ठीक वही प्रकाशित source | इससे दिखाई गई सुविधा | ट्यूटोरियल |
| --- | --- | --- |
| [`bit_fields.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/bit_fields.srp) | Bit patterns, masks और shifts | [विवरण](/hi/releases/v0.0.5-alpha.2) |
| [`scalar_conversions.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/scalar_conversions.srp) | जाँचे हुए स्पष्ट numeric conversions | [विवरण](/hi/releases/v0.0.5-alpha.2) |
| [`typed_declarations.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/typed_declarations.srp) | सुस्पष्ट type वाले bindings | [विवरण](/hi/releases/v0.0.5-alpha.2) |
| [`unicode_text.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/unicode_text.srp) | Unicode लंबाई और text queries | [विवरण](/hi/releases/v0.0.5-alpha.2) |
| [`numerical_kernels.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/numerical_kernels.srp) | सांख्यिकी तथा activation functions | [विवरण](/hi/releases/v0.0.5-alpha.2) |
| [`integer_collections.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.srp) | अपरिवर्तनीय integer collections | [विवरण](/hi/tutorials/alpha2-collections-and-learning) |
| [`score_selection.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.srp) | स्थिर score selection | [विवरण](/hi/tutorials/alpha2-collections-and-learning) |
| [`vector_probabilities.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.srp) | Vector probabilities | [विवरण](/hi/tutorials/alpha2-collections-and-learning) |
| [`classification_training.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.srp) | प्रोग्राम में लिखी loss gradient | [विवरण](/hi/tutorials/alpha2-collections-and-learning) |
| [`constant_expressions.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/constant_expressions.srp) | सीमित compile-time module constants | [विवरण](/hi/tutorials/alpha2-module-constants-and-inspection) |
| [`module_inspection.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/module_inspection.srp) | Static module inspection | [विवरण](/hi/tutorials/alpha2-module-constants-and-inspection) |
| [`inspection_json.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/inspection_json.srp) | Schema version वाला module JSON | [विवरण](/hi/tutorials/alpha2-module-constants-and-inspection) |

Module-based examples के लिए `modules/` में अतिरिक्त प्रकाशित files भी चाहिए। लिंक वाले पूरे tutorials देखें। एक example किसी विशेष व्यवहार का प्रमाण है, पूरी सामान्य collections या ML framework का नहीं।

## प्रकाशित alpha.3 के सत्यापित उदाहरण

ये **4 programs** **[v0.0.5-alpha.3](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.3)** से लिए गए हैं और अलग CI में चलाए जाते हैं।

| ठीक वही प्रकाशित source | इससे दिखाई गई सुविधा | ट्यूटोरियल |
| --- | --- | --- |
| [`text_construction.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/text_construction.srp) | Unicode text बनाना और दोहराना | [विवरण](/hi/releases/v0.0.5-alpha.3) |
| [`float_refinement.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/float_refinement.srp) | Finite-float का चरणबद्ध refinement | [विवरण](/hi/releases/v0.0.5-alpha.3) |
| [`collection_module.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/collection_module.srp) | Imported module से typed integer return | [विवरण](/hi/releases/v0.0.5-alpha.3) |
| [`coefficient_fit.srp`](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.3/examples/coefficient_fit.srp) | स्पष्ट coefficient fitting (स्वचालित differentiation नहीं) | [विवरण](/hi/releases/v0.0.5-alpha.3) |

Alpha.3 में **Scarp-first CLI** के `exec`, static-only `verify`, `inspect tokens`, `inspect ast`, `inspect modules`, `guide`, `version` और offline `diagnose --json` उपलब्ध हैं। पुराने `run`, `check`, `tokens`, `modules` compatibility के लिए बचे हैं। **`verify` सामान्य runtime statements नहीं चलाता; पुराना `check` कुछ runtime paths चला सकता है।** AST inspection केवल parser output है, स्थिर JSON नहीं। [वर्तमान CLI guide](/hi/tooling/cli) देखें।

## नए alpha.3 में भी अनुपलब्ध सुविधाएँ

नीचे की क्षमताएँ प्रकाशित alpha.3 compiler में **अभी उपलब्ध नहीं** हैं; development branches या proposals अलग हो सकते हैं:

- `.srp` से native executable बनाना, `scarp build` या `scarp compile` commands।
- Package manager/registry, पूरी general-purpose standard library और arbitrary application arguments का forwarding।
- User-defined classes, structs, traits, general generics तथा closures।
- Arbitrary tensors या general heterogeneous collections। लेकिन alpha.2 से सीमित `integers` collection **उपलब्ध है**।
- Network imports, wildcard imports, module re-exports और arbitrary runtime globals।
- Self-hosted compiler, स्थिर भाषा specification और हर prerelease के बीच compatibility guarantee।

**Release सीमा:** Tag बनने के बाद compiler `main` में जोड़ी गई सुविधा अगली प्रकाशित release और उसके परीक्षण तक **development-only** है। केवल proposal या open PR देखकर shipped नहीं मानें।

## इस reference का रखरखाव

नई सुविधा के लिए **release tag, source commit, runnable example/test तथा version-specific guide** आवश्यक हैं। English/Hindi दोनों tables को TypeScript checker pinned release manifests से मिलाता है। CI वास्तविक tagged compilers भी चलाती है। [परीक्षण नीति](/hi/reference/evidence) और [official compiler releases](https://github.com/scarp-lang/scarp/releases) देखें।
