# दस्तावेज़ रखरखाव और रिलीज़ जाँच

Documentation changes compiler के वास्तविक व्यवहार, नाम और रिलीज़ के साथ मेल खाने चाहिए। English और Hindi दोनों भाषाओं के पृष्ठ मिलकर ही एक पूर्ण documentation update हैं।

## Compiler त्रुटि fixtures

[Alpha.2 error repairs](/hi/tutorials/alpha2-diagnostics-and-repairs) में छह जानबूझकर असफल प्रकाशित tests हैं, जो बारह सफल examples से अलग हैं। `npm run check:alpha2-errors` source/stderr blobs, दोनों translations और supporting modules जाँचता है। `npm run check:alpha2-errors -- /path/to/alpha2/tests/fixtures` से tagged checkout तथा `npm run test:alpha2-errors -- /path/to/alpha2/scarp` से वास्तविक error output जाँचें। Error messages version-specific हैं।

## Alpha.1 → alpha.2 माइग्रेशन जाँच

मुख्य baseline बदलने से पहले `npm run test:alpha2-backcompat -- /path/to/alpha2/scarp` को प्रकाशित **alpha.2** interpreter पर चलाएँ। CI पुराने 11 alpha.1 fixtures बिना बदले चलाकर stdout bytes और `tokens` जाँचती है। यह सभी programs के लिए backward compatibility की गारंटी नहीं है। [अपग्रेड गाइड](/hi/reference/upgrade-readiness) देखें।

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

पहले प्रकाशित tag, source SHA, compiler tests और release artifacts की पुष्टि करें। इसके बाद `data/compiler-baseline.json`, code fixtures, language/status/CLI references और दोनों भाषाओं के pages अपडेट करें। Development proposal को released सुविधा न बताएं।

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
