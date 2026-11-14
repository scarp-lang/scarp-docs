# अपने Scarp version के लिए सही CLI command खोजें

Scarp के प्रयोगात्मक compiler releases में CLI बदलती रही है। नए release का command पुराने executable में **उपलब्ध नहीं** भी हो सकता है। खासकर alpha.1/alpha.2 का `check`, alpha.3 के static `verify` के बराबर **नहीं** है।

नीचे अपने **वास्तव में इंस्टॉल किए प्रकाशित compiler version** और काम को चुनें। यह interactive tool उसी release में उपलब्ध command दिखाएगा या बताएगा कि सुविधा तब तक प्रकाशित नहीं हुई थी। उपलब्ध commands को clipboard में कॉपी भी कर सकते हैं।

<ScarpCommandFinder />

## Commands कैसे चलाएँ?

पहले असली binary का version जाँचें। Alpha.3 या नए compiler में `scarp version` और alpha.1/alpha.2 में `scarp --version` चलाएँ। `FILE.srp` की जगह अपनी source file का path दें। `PROJECT_DIRECTORY` की जगह `Scarp.project` manifest वाला स्पष्ट project folder दें। `scarp create demo` चलाने से **नया folder** बनता है; यह पुराने folder को overwrite नहीं करता।

यह widget पेज लोड होने के बाद **browser में ही काम करता है**। यह GitHub से data नहीं माँगता, आपके कंप्यूटर का executable नहीं पहचानता, आपकी files नहीं पढ़ता और Scarp code execute नहीं करता। इसके links अलग-अलग प्रकाशित releases के जाँचे हुए संदर्भों तक ले जाते हैं। **नवीनतम प्रकाशित release [v0.0.6-alpha.10](/hi/releases/v0.0.6-alpha.10)** है; compiler की बदलती `main` branch नहीं।

## अलग-अलग commands पहली बार कब आए?

| पहली प्रकाशित release | सुविधा या व्यवहार | प्रमाण |
| --- | --- | --- |
| **v0.0.5-alpha.1** | Interpreter से `scarp run FILE.srp` | [Alpha.1 CLI](/hi/tooling/cli-alpha1) |
| **v0.0.5-alpha.3** | `exec`, static `verify`, `inspect ast` तथा offline `diagnose` | [प्रकाशित alpha.3 CLI](/hi/tooling/cli) |
| **v0.0.5-alpha.4** | Project के `create`, `verify DIRECTORY` और `launch` | [Alpha.4 project guide](/hi/guide/quickstart-alpha4) |
| **v0.0.5-alpha.5** | `inspect modules --json PROJECT_DIRECTORY` | [Alpha.5 CLI](/hi/tooling/cli-alpha5) |
| **v0.0.6-alpha.1** | `inspect symbols --json` तथा `inspect references --json` | [Alpha.6 CLI](/hi/tooling/cli-alpha6) |

Alpha.2 पुराने `run` command के लिए चुना जा सकता है। किसी नई सुविधा के आ जाने से सारे पुराने programs की compatibility **सिद्ध नहीं** होती। Source बदलने से पहले [release-aware learning path](/hi/guide/learning-path), [version compatibility](/hi/reference/compatibility) और [latest installation guide](/hi/guide/installation-alpha6) देखें।

[English command finder](/tooling/command-finder) में वही commands, compiler releases और सुविधाएँ हैं। Browser में JavaScript बंद हो या clipboard अनुमति न मिले तो ऊपर दी table और जुड़े हुए CLI references से सही command पढ़ सकते हैं।

## Alpha.2 version की सीमा

प्रकाशित **v0.0.6-alpha.2** में सीमित Rust caching और dependency invalidation APIs जोड़ी गई हैं। नया `scarp` CLI command **नहीं** आया है। Alpha.1 के पुराने symbols और references commands अभी भी उपलब्ध हैं। [Alpha.2 रिलीज़ विवरण](/hi/releases/v0.0.6-alpha.2) पढ़ें।

पिछला प्रकाशित [v0.0.6-alpha.3](/hi/releases/v0.0.6-alpha.3) Top-K और temperature-softmax के ऐतिहासिक संदर्भ के लिए उपलब्ध है।

## Alpha.4 में वैज्ञानिक functions

प्रकाशित [v0.0.6-alpha.4](/hi/releases/v0.0.6-alpha.4) में `sample_area`, `sample_cumulative_area`, `sample_slopes` और `cosine_similarity` उपलब्ध हैं। कोई नया CLI command नहीं आया। सीमित ELF64 emitter सिर्फ Rust API है, सामान्य native compiler या `scarp compile` नहीं।

## Alpha.5 में नई scientific APIs

प्रकाशित [v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5) में `top_p`, `top_p_values` और `pearson_correlation` जुड़े हैं। नया CLI subcommand **नहीं** आया; सीमित ELF64 object केवल Rust API से बनता है, `scarp compile` से नहीं। [Top-P](/hi/language/nucleus-selection-alpha5) और [Pearson](/hi/language/pearson-correlation-alpha5) देखें।

## Alpha.6 में input, text और tuples

प्रकाशित [v0.0.6-alpha.6](/hi/releases/v0.0.6-alpha.6) में redirected UTF-8 input वाला `read_line()`, explicit scalar/text conversion और immutable tuples उपलब्ध हैं। पुराने `scarp exec` / `run` / `launch` commands ही हैं; नया `scarp compile` या terminal prompt command **नहीं** है। [Input](/hi/language/program-input-alpha6), [Text](/hi/language/text-foundations-alpha6), [Tuples](/hi/language/tuples-alpha6) पढ़ें।

प्रकाशित [v0.0.6-alpha.7](/hi/releases/v0.0.6-alpha.7) में value लौटाने वाले conditional expressions और Unicode scalar escapes आए हैं। सामान्य native build command अभी भी उपलब्ध नहीं है।

## Alpha.8: नया project manifest और tests

**[v0.0.6-alpha.8](/hi/releases/v0.0.6-alpha.8)** में पहली बार `scarp init`, project `scarp run`, `scarp test` तथा `scarp project info` का नया workflow प्रकाशित हुआ। ऊपर version selector में alpha.8 चुनने पर **नई project** बनाने, tests चलाने और metadata पढ़ने के तीन अलग tasks दिखाई देंगे। Alpha.7 या उससे पुराने compiler चुनने पर ये नए tasks **उपलब्ध नहीं** बताए जाएँगे, न कि गलत command सुझाएँगे।

`scarp test --list` program नहीं चलाता, पर सामान्य `scarp test` trusted source **execute** करता है। `--require-tests` खाली suite अस्वीकार करता है। `assert` false होने पर E0065 मिलता है। [Alpha.8 project CLI](/hi/tooling/project-alpha8) और [पूरा calculator project](/hi/tutorials/calculator-alpha8) देखें।

## Alpha.9: structured test reports

प्रकाशित [v0.0.6-alpha.9](/hi/releases/v0.0.6-alpha.9) में `scarp test --json=v2` नया है। पुराना `--json` schema version 1 देता है। Command Finder का नया **संरचित test errors** task चुनें। Alpha.8 या पुराने versions में यह सुविधा अनुपलब्ध दिखेगी। [JSON-v2 मार्गदर्शिका](/hi/tooling/test-json-v2-alpha9) में failure phases और privacy सीमाएँ हैं।

## Alpha.10 interactive prompts

प्रकाशित compiler में `--interactive` और `--input-file PATH` उपलब्ध हैं। विस्तृत [input guide](/hi/tooling/interactive-input-alpha10) तथा [arrays guide](/hi/language/fixed-arrays-alpha10). पुराने versions का command finder अपनी मूल सीमाएँ दिखाता है।
