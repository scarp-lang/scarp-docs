# वर्ज़न अनुकूलता

[Interactive version-aware Command Finder](/hi/tooling/command-finder) से हर प्रकाशित compiler में उपलब्ध CLI commands और unavailable सुविधाएँ देखें।

Scarp के शुरुआती prereleases में syntax और API बदले हैं। यहाँ प्रकाशित रिलीज़ के आधार पर सही व्यवहार चुनें। नए और पुराने features की साक्ष्य-आधारित सूची [प्रकाशित फीचर स्थिति](/hi/reference/status) में है।

| संस्करण | प्रमुख प्रकाशित सुविधा |
| --- | --- |
| **[v0.0.7-alpha.3](/hi/releases/v0.0.7-alpha.3)** | **नवीनतम (27 नवंबर):** Generic functions, contextual type inference, generic Option/Result, bounded string operators तथा private aggregate locals के साथ experimental native integer specialization; सामान्य native executable compiler नहीं। |
| **[v0.0.7-alpha.2](/hi/releases/v0.0.7-alpha.2)** | **पूर्व (26 नवंबर):** Experimental ELF64 object CLI, bounded direct calls और Rust aggregate layout queries; सामान्य native executable compiler नहीं। |
| **[v0.0.7-alpha.1](/hi/releases/v0.0.7-alpha.1)** | **ऐतिहासिक (25 नवंबर):** Fixed-array concatenation, integer reductions, bounded frame reuse और experimental ELF64 scalar control flow; सामान्य native CLI नहीं। |
| **[v0.0.6-alpha.20](/hi/releases/v0.0.6-alpha.20)** | **पूर्व (24 नवंबर):** Exact decimal literals, persistent tuple updates, numeric tuple ordering, lowercase `scarp.project` और experimental Rust native functions; सामान्य native CLI नहीं। |
| **[v0.0.6-alpha.19](/hi/releases/v0.0.6-alpha.19)** | Checked Rust host callable handles and cumulative quotas |
| **[v0.0.6-alpha.18](/hi/releases/v0.0.6-alpha.18)** | 22 नवंबर: बिना filename `scarp exec`, immutable `array_set` और Lifetime memory सुधार; general native compiler नहीं |
| **[v0.0.6-alpha.17](/hi/releases/v0.0.6-alpha.17)** | **पिछली (21 नवंबर):** `array_len`, `array_get_or`, `input_boolean` और सटीक type diagnostics |
| **[v0.0.6-alpha.16](/hi/releases/v0.0.6-alpha.16)** | **पूर्व (20 नवंबर):** pure `median`/`quantile`, Unicode text utilities, checked 64-bit integers तथा Rust cache limits; अभी interpreter CLI, general native compiler नहीं |
| **[v0.0.6-alpha.15](/hi/releases/v0.0.6-alpha.15)** | **पूर्व (19 नवंबर):** 1 MiB निरीक्षण सीमा, UTF-8 string comparison budget, loader revision checks और checked ELF64 shifts; native compiler CLI नहीं |
| **[v0.0.6-alpha.14](/hi/releases/v0.0.6-alpha.14)** | **पूर्व (18 नवंबर):** nested pattern diagnostics, Rust editor-cache quotas तथा checked ELF64 host API; सामान्य native compilation नहीं |
| **[v0.0.6-alpha.13](/hi/releases/v0.0.6-alpha.13)** | **पिछला (17 नवंबर):** Rust cache revision eviction, editor workspace generation और Option/Result में immutable payload reuse; नया Scarp syntax या CLI नहीं |
| **[v0.0.6-alpha.12](/hi/releases/v0.0.6-alpha.12)** | **पूर्व प्रकाशित (16 नवंबर 2026):** typed records, exhaustive variants, Option/Result, immutable lists/maps और tested task-board; interpreter-only aggregates |
| **[v0.0.6-alpha.11](/hi/releases/v0.0.6-alpha.11)** | **प्रकाशित (15 नवंबर 2026):** exact `decimal`, स्पष्ट rounding/conversions और `input_decimal`; interpreter-only, native compile नहीं |
| **[v0.0.6-alpha.10](/hi/releases/v0.0.6-alpha.10)** | **प्रकाशित (14 नवंबर 2026):** interactive input, immutable arrays, exact `.stdout`/`.stderr` tests और expanded BigInt; सामान्य native compile नहीं |
| **[v0.0.6-alpha.9](/hi/releases/v0.0.6-alpha.9)** | **पहले प्रकाशित (13 नवंबर 2026):** सटीक signed BigInt, स्पष्ट conversion, सीमित digits/work और `scarp test --json=v2` structured failures; native compile CLI नहीं |
| **[v0.0.6-alpha.8](/hi/releases/v0.0.6-alpha.8)** | **पहले प्रकाशित (12 नवंबर 2026):** declarative `scarp.project`, `scarp init/run/verify`, `scarp test`/JSON/filter/`.stdin`, read-only `project info` तथा `assert`/E0065; पुराने manifests समर्थित, native compile और package registry नहीं |
| **[v0.0.6-alpha.7](/hi/releases/v0.0.6-alpha.7)** | **पहले प्रकाशित (11 नवंबर 2026):** strict typed conditional expressions और Unicode scalar escapes; native emitters/module constants में conditional expressions नहीं |
| **[v0.0.6-alpha.6](/hi/releases/v0.0.6-alpha.6)** | **पहले प्रकाशित (10 नवंबर 2026):** सीमित redirected input, explicit scalar/text conversion और immutable tuples; सामान्य native CLI या terminal prompt नहीं |
| **[v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5)** | **पहले प्रकाशित (9 नवंबर):** निश्चित Top-P, Pearson correlation और सीमित Rust ELF64 object API; सामान्य `scarp compile` नहीं |
| **[v0.0.6-alpha.4](/hi/releases/v0.0.6-alpha.4)** | **पहले प्रकाशित (8 नवंबर):** sampled calculus, cosine similarity, सीमित Rust native object API |
| **[v0.0.6-alpha.3](/hi/releases/v0.0.6-alpha.3)** | **पहले प्रकाशित prerelease (7 नवंबर):** Top-K चयन, temperature softmax और private scalar-IR जाँच; नया native CLI नहीं |
| **[v0.0.6-alpha.2](/hi/releases/v0.0.6-alpha.2)** | **पिछली प्रकाशित prerelease (6 नवंबर):** वैकल्पिक Rust caching और dependency invalidation APIs; नया Scarp CLI command या syntax नहीं |
| **`v0.0.6-alpha.1`** | **पिछला प्रकाशित, 5 नवंबर 2026:** static symbols/references JSON inspection तथा `rms(vector)`; [release](/hi/releases/v0.0.6-alpha.1), [पूरा project lab](/hi/tutorials/project-symbol-navigation-alpha6) |
| **`v0.0.5-alpha.5`** | पिछला, 4 नवंबर 2026: project-directory module inspection; केवल Rust embedding के लिए सीमित C11 emitter; [release](/hi/releases/v0.0.5-alpha.5) |
| **`v0.0.5-alpha.4`** | 3 नवंबर: नया project create, static verify DIRECTORY, launch; [project guide](/hi/releases/v0.0.5-alpha.4) |
| `v0.0.1` | integer arithmetic, शुरुआती printing |
| `v0.0.2` | bindings, scopes, strings, boolean, branching |
| `v0.0.3-beta.1` | while/repeat, budget सीमाएँ, पुराने output spellings |
| `v0.0.3-beta.3` | typed `funcra` functions और contracts |
| `v0.0.4-alpha.1` | finite scalar floats |
| `v0.0.4-alpha.4` | vectors और tiles के साथ संख्यात्मक milestone |
| **`v0.0.5-alpha.1`** | relative source modules, public symbols; मुख्य docs baseline |
| **`v0.0.5-alpha.2`** | **2 नवंबर 2026 को प्रकाशित पिछला prerelease:** typed declarations, bitwise integers, Unicode और [जाँचे गए उदाहरण](/hi/releases/v0.0.5-alpha.2) |
| **`v0.0.5-alpha.3`** | **ऐतिहासिक prerelease:** Scarp-first CLI, static `verify`, `inspect`, offline `diagnose`, bounded text construction; [चार पूरे उदाहरण](/hi/releases/v0.0.5-alpha.3) |

## Alpha.1 से alpha.2 में जाँचा हुआ अपग्रेड

[Compiler-verified अपग्रेड परीक्षण](/hi/reference/upgrade-readiness) में पुराने **11 alpha.1 source programs** को बिना बदले नए प्रकाशित alpha.2 compiler पर चलाया जाता है। CI उनके stdout bytes तथा silent `check` की तुलना करती है। इससे सभी पुराने programs के compatible होने की गारंटी नहीं होती और मुख्य reference का alpha.1 baseline नहीं बदलता।

## नया प्रकाशित alpha.3 और CLI migration

**ऐतिहासिक संस्करण [v0.0.5-alpha.3](/hi/releases/v0.0.5-alpha.3)** 2 नवंबर 2026 को जारी हुआ। इसका source commit `7715c28df09c7703b39e14fddb963275b25df476` है। इसमें `exec`, static `verify`, `inspect`, offline `diagnose` तथा Unicode text construction जुड़ते हैं। पुराने `run`/`check`/`tokens`/`modules` अभी समर्थित हैं। **Alpha.1 → alpha.2 परीक्षण से alpha.3 के हर पुराने program की compatibility सिद्ध नहीं होती।** चार alpha.3 प्रोग्राम नए guide में अलग जाँचे जाते हैं।

## पिछले प्रकाशित alpha.5 की compatibility सीमा

आधिकारिक [v0.0.5-alpha.5](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.5) का exact commit `2eeed0aa52ccb59523307841ad8ffbd83f8911a8` है। Alpha.5 में पहली बार `scarp inspect modules --json DIRECTORY` उपलब्ध है; alpha.4 में केवल file inspection समर्थित था। C11 scalar emitter सिर्फ **Rust embedding API** में है, `scarp compile` CLI नहीं। [alpha.5 CLI](/hi/tooling/cli-alpha5), [C11 सीमाएँ](/hi/reference/c11-backend-alpha5) और [इंस्टॉलेशन](/hi/guide/installation-alpha5) देखें।

पुराने version की syntax की सामान्य compatibility **सिद्ध नहीं** है। पुराने examples को उसी tagged version से जाँचें; version-specific tutorials और manifests को बदलकर नया tag न दें।

## प्रकाशित alpha.6 symbols और CLI की compatibility सीमा

पहले प्रकाशित alpha.6 compiler [v0.0.6-alpha.1](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.1) का source commit `aa329a22cf2bf92d2c9814a26ff9c8b67a72e6e8` है। इसमें `scarp inspect symbols --json` तथा `scarp inspect references --json` से file या explicit project directory के definitions/references देख सकते हैं। साथ में `rms(vector)` भी प्रकाशित हुआ है। Symbol IDs केवल **एक compilation snapshot** के लिए हैं; कोई तैयार LSP, rename या user-facing incremental compilation service नहीं है; बाद के alpha.2 में अलग Rust cache APIs आई हैं। [Alpha.6 CLI](/hi/tooling/cli-alpha6), [RMS पाठ](/hi/language/rms-alpha6) और [project lab](/hi/tutorials/project-symbol-navigation-alpha6) पढ़ें।

[सात चरणों वाला learning path](/hi/guide/learning-path) हर पुराने tutorial के लिए **सही compiler release** बताता है। नए features के आने से सभी पुराने source files के compatible होने का प्रमाण नहीं मिलता। Native `.srp` executable compiler CLI और general tensor runtime अभी नहीं हैं।

## नवीनतम alpha.2 में Rust caching की सीमा

[6 नवंबर की प्रकाशित prerelease](/hi/releases/v0.0.6-alpha.2) में whole-graph resolution, tokens और AST के लिए सीमित, वैकल्पिक Rust cache APIs, dependency invalidation तथा source eviction शामिल हैं। **नया Scarp syntax या CLI command नहीं आया है।** पुराने alpha.1 examples अपने मूल compiler version पर सत्यापित रहते हैं। Cache hit से import, syntax, type और resource checks नहीं छोड़ी जातीं।

## पुराना स्रोत migrate करना

नए source में अपरिवर्तनीय declaration `bind name = expr;`, mutable declaration `var name = expr;` है। पुराने `let`/`let mut` syntax को वर्तमान `bind`/`var` से बदलें। `print` और `println` alias हैं, लेकिन बहुत पुराने binaries इन्हें अलग तरह से समझते थे।

## दस्तावेज़ सही रखें

उसी tagged executable के साथ उदाहरण जाँचें जिसके version का दावा कर रहे हैं। `main` पर experimental work को प्रकाशित version समझने की गलती न करें। [फ़ीचर स्थिति](/hi/reference/status) और [परीक्षण प्रमाण](/hi/reference/evidence) देखें।
