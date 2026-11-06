# दस्तावेज़ रखरखाव और रिलीज़ जाँच

Documentation changes compiler के वास्तविक व्यवहार, नाम और रिलीज़ के साथ मेल खाने चाहिए। English और Hindi दोनों भाषाओं के पृष्ठ मिलकर ही एक पूर्ण documentation update हैं। मुख्य language-reference baseline अभी [v0.0.5-alpha.1](/hi/reference/status) पर स्थिर है। अलग से सत्यापित नवीनतम प्रकाशित version [v0.0.6-alpha.1](/hi/releases/v0.0.6-alpha.1) है। नए इंस्टॉलेशन के लिए [alpha.6 guide](/hi/guide/installation-alpha6) इस्तेमाल करें।

## Compiler त्रुटि fixtures

[Alpha.2 error repairs](/hi/tutorials/alpha2-diagnostics-and-repairs) में छह जानबूझकर असफल प्रकाशित tests हैं, जो बारह सफल examples से अलग हैं। `npm run check:alpha2-errors` source/stderr blobs, दोनों translations और supporting modules जाँचता है। `npm run check:alpha2-errors -- /path/to/alpha2/tests/fixtures` से tagged checkout तथा `npm run test:alpha2-errors -- /path/to/alpha2/scarp` से वास्तविक error output जाँचें। Error messages version-specific हैं।

## Alpha.1 → alpha.2 माइग्रेशन जाँच

मुख्य baseline बदलने से पहले `npm run test:alpha2-backcompat -- /path/to/alpha2/scarp` को प्रकाशित **alpha.2** interpreter पर चलाएँ। CI पुराने 11 alpha.1 fixtures बिना बदले चलाकर stdout bytes और `tokens` जाँचती है। यह सभी programs के लिए backward compatibility की गारंटी नहीं है। [अपग्रेड गाइड](/hi/reference/upgrade-readiness) देखें।

## नई alpha.3 रिलीज़ के प्रमाण

[Alpha.3 release guide](/hi/releases/v0.0.5-alpha.3) तथा उसका English page **चार पूरे published source/output programs और 11 Git blobs** दिखाते हैं। `npm run check:alpha3` bilingual snippets जाँचता है। `npm run check:alpha3 -- /path/to/tagged-alpha3/examples` से source files की byte comparison होती है। `alpha3-conformance` CI release commit `7715c28df09c7703b39e14fddb963275b25df476` का compiler build करके `npm run test:alpha3 -- /path/to/alpha3/scarp` चलाता है। पुरानी alpha.1 और alpha.2 verification suites अलग रहती हैं।

## TypeScript तथा Vue compatibility

Scarp Docs के .ts और .vue sources की जाँच `vue-tsc` करता है। अभी जाँचा गया समर्थित संयोजन **TypeScript 6.0.x** और **vue-tsc 3.3.x** है। TypeScript 7 में Vue SFC checker के लिए आवश्यक programmatic API अभी उपलब्ध नहीं है, इसलिए `ERR_PACKAGE_PATH_NOT_EXPORTED` आता है। यह upstream integration की सीमा है; TypeScript भाषा को सामान्य रूप से खराब बताने का दावा नहीं।

**विशिष्ट Vue patch समस्या:** `vue-tsc` **3.3.14** में [template URL code-generation bug](https://github.com/vuejs/language-tools/issues/6322) की रिपोर्ट है। Template attribute में सीधे URL होने पर गलत TS2339/TS7006 error आ सकता है। इसलिए अभी **3.3.13** pinned है और Dependabot केवल **3.3.14 version** को ignore करता है; सुधार आने पर बाद वाला patch अपडेट हो सकेगा। मौजूदा CI पास होने से हर भविष्य का Vue template सही होने की गारंटी नहीं मिलती।

इस कारण npm Dependabot, TypeScript के **major upgrades** फिलहाल रोकता है, लेकिन compatible updates की अनुमति है। `npm run check:toolchain` version और configuration जाँचता है; `npm run test:toolchain` regression cases चलाता है; `npm run typecheck` असली TypeScript तथा Vue sources की जाँच करता है। Vue tooling के आधिकारिक समर्थन और पूरे CI/Pages परीक्षण के बाद ही TypeScript 7 का नया PR स्वीकार करें।

## Local quality checks

~~~sh
npm install
npm run check:docs
npm run check:fixtures
npm run check:i18n
npm run docs:build
~~~

`check:docs` internal links/navigation और `check:i18n` दोनों भाषाओं के page pairs तथा कोड-फेंस की संगति जाँचते हैं। Compiler CI 11 copied examples का expected stdout से मिलान करता है।

नए code examples के लिए `npm run check:snippets`, `npm run test:snippets` और `npm run check:tutorial-evidence` भी चलाएँ। ये परीक्षण पुराने syntax, अनुपलब्ध CLI commands और गलत compiler fixtures पकड़ते हैं।

## दो अलग compiler संस्करण

[नया alpha.2 रिलीज़ पृष्ठ](/hi/releases/v0.0.5-alpha.2) 12 प्रकाशित source/output जोड़ों (module dependencies तथा JSON snapshot सहित) को अलग CI job में चलाता है। पुराने 11 उदाहरण अभी alpha.1 compiler से जुड़े हैं। `npm run check:alpha2` hashes और दोनों भाषाओं का प्रमाण जाँचता है; `npm run check:evidence -- /path/to/alpha1 /path/to/alpha2` से दोनों compiler tags की source-link paths जाँचें। सभी पुराने ट्यूटोरियल को समीक्षा के बिना alpha.2 पर न बदलें।

## नए compiler release पर

पहले प्रकाशित tag, source SHA, compiler tests और release artifacts की पुष्टि करें। नए compiler release के लिए **अलग release-specific manifest**, सटीक source/output fixtures, CI pin और English/Hindi language/status/CLI pages एक ही PR में अपडेट करें। **`data/compiler-baseline.json` को बिना अलग compatibility और fixture validation के नवीनतम release पर न बदलें**; पुराने alpha.1 tutorials उसी baseline से जुड़े रहते हैं। नए features को केवल अपने सत्यापित release में दिखाएँ। Development proposal को published सुविधा न बताएं।

## GitHub Actions और Pages

`main` पर merge होने के बाद GitHub Actions static VitePress site को GitHub Pages पर deploy करता है। Workflow की ताज़ा स्थिति और पिछली deployments [Actions history](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml) में देखें। केवल deployment count बढ़ाने के लिए workflow को बार-बार न चलाएँ।

## गुणवत्ता और सुरक्षा

Unverified social accounts, unsupported compiler features, बाहरी auto-translation scripts, undocumented network requests या secret tokens सीधे docs में न जोड़ें। Source links की जाँच करें। अनुवाद में Scarp का executable code अपरिवर्तित रखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

```sh
npm install --no-audit --no-fund
npm run check:docs
npm run check:fixtures
npm run docs:build
```
