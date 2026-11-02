# Scarp alpha.2 module inspection और diagnostics का स्पष्टीकरण

**[v0.0.5-alpha.2](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.2) प्रकाशित prerelease (2 नवंबर 2026) में उपलब्ध।** ये नए commands पुराने [alpha.1 CLI संदर्भ](/hi/tooling/cli) में शामिल नहीं थे। इससे package manager या native compiler उपलब्ध होने का दावा नहीं होता।

## चार inspection commands

प्रकाशित alpha.2 executable और उसके examples वाले फ़ोल्डर से ये commands चलाएँ:

~~~sh
scarp modules examples/bit_fields.srp
scarp modules --json examples/bit_fields.srp
scarp explain E0044
scarp modules --help
~~~

सामान्य module command modules, dependencies तथा public/private declarations का **static inventory** दिखाता है। Source graph का validation होता है, पर सामान्य runtime statements, default values या function bodies execute नहीं होते। कुछ scalar module constant expressions का compile-time evaluation अलग नियम है।

## JSON schema और source location

JSON रूप एक compact object और अंत में newline देता है। इसके प्रमुख fields `schema_version` (अभी **1**), `entry`, `modules` तथा `constant_dependencies` हैं। एक module में path, imports, relations और symbols की जानकारी होती है। Source spans **file-local UTF-8 byte offsets** हैं: `[start,end)` अर्थात आरंभ शामिल और अंत बाहर।

पूरी field definitions के लिए [tagged JSON reference](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-json.md) और [module inspection](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/docs/module-inspection.md) देखें। Editor tools में schema version जाँचें और मशीन बदलने पर filesystem labels समान होने का अनुमान न लगाएँ।

## बिना source file के diagnostic समझें

`scarp explain E0044` numerical conversion की समस्या समझाता है। `E0045` गलत Unicode scalar index से संबंधित है। यह command source file खोले या चलाए बिना सामान्य guidance देता है; वास्तविक error के source-span और related notes अधिक विशिष्ट होते हैं।

## Exit status और सीमाएँ

- सफलता पर exit status **0** तथा stdout।
- Source graph, import या type error पर status **1**, stderr diagnostic और कोई partial inventory नहीं।
- गलत command उपयोग या अज्ञात diagnostic code पर status **2**।
- `modules --json` को filename से पहले लिखें। `-` से शुरू होने वाले नाम पर `--` separator का प्रयोग करें।
- Runtime budget flags `run`/`check` के लिए हैं; static `modules` के लिए नहीं।
- इस tool से network import, user statements का execution या `.srp` native binary compilation नहीं होता।

[Alpha.2 source evidence](/hi/reference/evidence) में help, explain और static module inspection को tagged compiler से जाँचा जाता है। अधिक [नए उदाहरण](/hi/releases/v0.0.5-alpha.2) और [collection tutorial](/hi/tutorials/alpha2-collections-and-learning) देखें।
