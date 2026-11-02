# दस्तावेज़ रखरखाव और रिलीज़ जाँच

Documentation changes compiler के वास्तविक व्यवहार, नाम और रिलीज़ के साथ मेल खाने चाहिए। English और Hindi दोनों भाषाओं के पृष्ठ मिलकर ही एक पूर्ण documentation update हैं।

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
