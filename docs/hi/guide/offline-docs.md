# Scarp Docs को ऑफलाइन डाउनलोड करके पढ़ें

Scarp के आधिकारिक **English/Hindi दस्तावेज़** एक offline snapshot archive में भी उपलब्ध हो सकते हैं। इसमें VitePress से बने सभी पृष्ठ, CSS, JavaScript तथा स्थानीय search की files होती हैं। यह **सिर्फ documentation** है, Scarp compiler का executable नहीं।

## जाँचा हुआ archive डाउनलोड करें

1. [Scarp Docs का GitHub Pages workflow](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml) खोलें।
2. `main` branch का कोई **successful** run चुनें, बेहतर है कि नवीनतम चुनें। उसके **Artifacts** में `scarp-docs-offline-…` पर क्लिक करें। GitHub पर sign-in की आवश्यकता पड़ सकती है।
3. डाउनलोड हुए GitHub artifact ZIP को extract करें। इसमें `scarp-docs-offline.tar.gz` तथा `scarp-docs-offline.tar.gz.sha256` मिलेंगे।
4. पहले SHA-256 मिलाएँ, फिर tar archive extract करें। Checksum में बदलाव पता चल सकता है; यह अकेला दुर्भावनापूर्ण download source से सुरक्षा का प्रमाण नहीं है।
5. नए folder में extract करने पर `README-OFFLINE.txt`, `MANIFEST.json`, `serve.mjs` और `scarp-docs/` directory मिलती है।

GitHub Actions artifacts हमेशा के लिए उपलब्ध **नहीं** रहते। पुराना download expire हो तो नया successful workflow run चुनें। यह stable compiler या नया docs release प्रकाशित नहीं करता।

## Archive का SHA-256 मिलाएँ

Linux पर archive और `.sha256` file एक folder में रखकर:

~~~sh
sha256sum -c scarp-docs-offline.tar.gz.sha256
mkdir -p scarp-docs-extracted
tar -xzf scarp-docs-offline.tar.gz -C scarp-docs-extracted
~~~

macOS में `sha256sum` उपलब्ध न हो तो नीचे निकला SHA-256, `.sha256` file के मान से मिलाएँ:

~~~sh
shasum -a 256 scarp-docs-offline.tar.gz
mkdir -p scarp-docs-extracted
tar -xzf scarp-docs-offline.tar.gz -C scarp-docs-extracted
~~~

Windows PowerShell में:

~~~powershell
Get-FileHash .\scarp-docs-offline.tar.gz -Algorithm SHA256
Get-Content .\scarp-docs-offline.tar.gz.sha256
New-Item -ItemType Directory -Path .\scarp-docs-extracted
tar -xzf .\scarp-docs-offline.tar.gz -C .\scarp-docs-extracted
~~~

## अपने कंप्यूटर पर साइट खोलें

**Node.js 20.19 या नया version** पहले से इंस्टॉल होना चाहिए। Archive में server तैयार है; इसके लिए `npm install` या इंटरनेट की आवश्यकता नहीं है।

Extracted `scarp-docs-extracted` folder में terminal खोलें और चलाएँ:

~~~sh
node serve.mjs
~~~

Browser में ये local पते खोलें:

- English: `http://127.0.0.1:8080/scarp-docs/`
- हिन्दी: `http://127.0.0.1:8080/scarp-docs/hi/`

Server केवल **127.0.0.1** अर्थात आपके अपने कंप्यूटर पर सुनता है। इसे बंद करने के लिए **Ctrl+C** दबाएँ। `file://` के माध्यम से सीधे `index.html` न खोलें; VitePress की `/scarp-docs/` paths को स्थानीय HTTP server चाहिए।

## Offline में क्या उपलब्ध है?

**असल browser परीक्षण:** Documentation CI extracted local server को headless Chromium में चलाकर English/Hindi Command Finder, clipboard success या permission failure, keyboard से local search तथा zero-results, भाषा बदलना, skip-to-content, dark/light mode की preference, mobile navigation, reduced-motion और बाहरी network requests न होने की पुष्टि करती है। यह जाँच packaged offline archive पर होती है, hosted GitHub Pages पर नहीं। इसे सम्पूर्ण WCAG accessibility audit **नहीं** मानें।

इस package में सभी English/Hindi HTML पृष्ठ, उनके स्थानीय CSS/JavaScript, VitePress search assets और [Command Finder](/hi/tooling/command-finder) शामिल हैं। पृष्ठों के अंदर के links स्थानीय server पर खुलते हैं। **बाहरी GitHub, social profiles तथा download links** के लिए फिर भी इंटरनेट चाहिए। असली browser में keyboard, search और accessibility परीक्षण का अलग काम [Issue #65](https://github.com/scarp-lang/scarp-docs/issues/65) पर रखा गया है; static assets की पुष्टि को पूरी browser accessibility जाँच न समझें।

Archive का `MANIFEST.json` docs version, source commit, प्रकाशित compiler version तथा हर packaged file का SHA-256 बताता है। मुख्य language reference अभी alpha.1 पर है; नवीनतम अलग सत्यापित प्रकाशित compiler [v0.0.6-alpha.1](/hi/releases/v0.0.6-alpha.1) है। सिर्फ docs डाउनलोड करने से Scarp interpreter upgrade नहीं होता।

Maintainers `npm run docs:build` के बाद `npm run package:offline` और `npm run test:offline` चलाकर archive जाँच सकते हैं। हर सफल `main` Pages workflow पर नया artifact upload होगा। [English offline guide](/guide/offline-docs) में भी निर्देश हैं।
