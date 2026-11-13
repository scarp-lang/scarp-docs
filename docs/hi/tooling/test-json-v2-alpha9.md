# Project test JSON v2 रिपोर्ट (v0.0.6-alpha.9)

<!-- scarp-cli-release: v0.0.6-alpha.9 -->

**[Scarp v0.0.6-alpha.9](/hi/releases/v0.0.6-alpha.9) में प्रकाशित।** `scarp test` command पहले [alpha.8](/hi/tooling/project-alpha8) में आया था। Alpha.9 में **संरचित failure report** का विकल्प आया है। पुराने text report और सामान्य `--json` schema version 1 में कोई बदलाव नहीं है।

## Commands

~~~sh
scarp test --json=v2 calculator
scarp test --json=v2 --list calculator
scarp test --json=v2 --require-tests --filter math calculator
~~~

एक command में **सिर्फ एक JSON विकल्प** दें। `--list` केवल test files की सूची देखता है, उन्हें चलाता नहीं। बिना `--list` के सामान्य Scarp code execute होता है; इसलिए विश्वसनीय projects के ही tests चलाएँ।

## रिपोर्ट में क्या मिलेगा?

Report में `schema_version: 2`, `mode` (`run` अथवा `list`), discovered/passed/failed की गिनती, तथा क्रम में `tests` entries होती हैं। Failed test के लिए v1 वाले `error` string की जगह `phase` (`compile`, `fixture` या `runtime`) और `diagnostic` object मिलता है। उसमें error code (यदि उपलब्ध हो), message, source location, संबंधित locations और help रहती है। File paths project-root से relative हैं; स्थानों में half-open UTF-8 byte spans तथा उपलब्ध होने पर एक से शुरू होने वाली Unicode-scalar line/column positions हैं।

Program का stdout या source excerpts report में नहीं रखे जाते। **यह secret-scrubbing format नहीं है:** programmer द्वारा दिया गया assertion message संवेदनशील text रख सकता है। Project setup की त्रुटियाँ और गलत flags stderr पर जाते हैं; उनकी test report नहीं बनती। Test failure का exit code 1 और invalid CLI usage का exit code 2 रहता है।

## मूल compiler contract

[Project testing का मूल दस्तावेज़](https://github.com/scarp-lang/scarp/blob/0814997dc43982eb707a9a1aee72aab3a7ac8b41/docs/project-testing.md), [alpha.9 release](/hi/releases/v0.0.6-alpha.9), और [alpha.8 calculator tutorial](/hi/tutorials/calculator-alpha8) देखें। पुराने compiler binaries में `--json=v2` उपलब्ध नहीं है।
