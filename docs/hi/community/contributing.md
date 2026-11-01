# Scarp परियोजना में योगदान

Scarp का compiler और documentation अलग repositories में हैं:

- [scarp-lang/scarp](https://github.com/scarp-lang/scarp) — Rust interpreter, tests, releases और language features।
- [scarp-lang/scarp-docs](https://github.com/scarp-lang/scarp-docs) — यह MIT-licensed VitePress दस्तावेज़ वेबसाइट।

## दस्तावेज़ में बदलाव

पढ़ने में कठिन वाक्य, broken link, Hindi अनुवाद की गलती या पुरानी जानकारी मिलने पर [docs issue](https://github.com/scarp-lang/scarp-docs/issues) बनाएँ। योगदान से पहले repository की [CONTRIBUTING.md](https://github.com/scarp-lang/scarp-docs/blob/main/CONTRIBUTING.md) पढ़ें।

~~~sh
git clone https://github.com/scarp-lang/scarp-docs.git
cd scarp-docs
npm install
npm run docs:dev
npm run check:docs
npm run docs:build
~~~

## Compiler में योगदान

Compiler के bug और language implementation के PR [compiler repo](https://github.com/scarp-lang/scarp) में दें। Document लिख देने से नया syntax अपने-आप implement नहीं हो जाता। नया feature तभी “प्रकाशित” कहलाएगा जब official tag/tests में मौजूद हो।

## अनुवाद के नियम

अंग्रेज़ी source file का संबंधित Hindi page `docs/hi/` में उसी relative path पर रखें। Keywords (`bind`, `var`, `funcra`), CLI options, filename, और runnable examples को अनुवाद में न बदलें। तकनीकी अर्थ और सही version status बनाए रखें। [आधिकारिक चैनल](/hi/community/social) देखें।

## लाइसेंस

Scarp docs **MIT**, जबकि compiler source **Apache-2.0** लाइसेंस के अंतर्गत है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~sh
git clone https://github.com/scarp-lang/scarp-docs.git
cd scarp-docs
npm install
npm run docs:dev
npm run check:docs
npm run docs:build
~~~
