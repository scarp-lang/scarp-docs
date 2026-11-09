# अपने Scarp version के लिए सही CLI command खोजें

Scarp के प्रयोगात्मक compiler releases में CLI बदलती रही है। नए release का command पुराने executable में **उपलब्ध नहीं** भी हो सकता है। खासकर alpha.1/alpha.2 का `check`, alpha.3 के static `verify` के बराबर **नहीं** है।

नीचे अपने **वास्तव में इंस्टॉल किए प्रकाशित compiler version** और काम को चुनें। यह interactive tool उसी release में उपलब्ध command दिखाएगा या बताएगा कि सुविधा तब तक प्रकाशित नहीं हुई थी। उपलब्ध commands को clipboard में कॉपी भी कर सकते हैं।

<ScarpCommandFinder />

## Commands कैसे चलाएँ?

पहले असली binary का version जाँचें। Alpha.3 या नए compiler में `scarp version` और alpha.1/alpha.2 में `scarp --version` चलाएँ। `FILE.srp` की जगह अपनी source file का path दें। `PROJECT_DIRECTORY` की जगह `Scarp.project` manifest वाला स्पष्ट project folder दें। `scarp create demo` चलाने से **नया folder** बनता है; यह पुराने folder को overwrite नहीं करता।

यह widget पेज लोड होने के बाद **browser में ही काम करता है**। यह GitHub से data नहीं माँगता, आपके कंप्यूटर का executable नहीं पहचानता, आपकी files नहीं पढ़ता और Scarp code execute नहीं करता। इसके links अलग-अलग प्रकाशित releases के जाँचे हुए संदर्भों तक ले जाते हैं। **नवीनतम प्रकाशित release [v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5)** है; compiler की बदलती `main` branch नहीं।

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

## Alpha.5 की नई संख्यात्मक सुविधाएँ

प्रकाशित [v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5) में `pearson_correlation`, `top_p` और `top_p_values` नए interpreter numerical built-ins हैं, लेकिन **नया CLI command नहीं है**। Nucleus ranking निश्चित है, random sampling नहीं। [पूरा numerical reference](/hi/language/scientific-kernels-alpha5) पढ़ें; `scarp compile` अभी भी उपलब्ध नहीं है।
