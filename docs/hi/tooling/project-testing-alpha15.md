# Scarp alpha.15 में प्रोजेक्ट टेस्ट और आउटपुट फ़िक्स्चर

<!-- scarp-cli-release: v0.0.6-alpha.15 -->
<!-- scarp-current-source: a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281 -->

[प्रकाशित alpha.15 interpreter](/hi/releases/v0.0.6-alpha.15) प्रोजेक्ट टेस्ट को सामान्य Scarp प्रोग्राम की तरह चलाता है। प्रोजेक्ट टेस्ट रनर [alpha.8](/hi/tooling/project-alpha8) में, संरचित त्रुटियाँ [alpha.9](/hi/tooling/test-json-v2-alpha9) में और सटीक stdout तथा stderr फ़िक्स्चर [alpha.10](/hi/tooling/interactive-input-alpha10) में आए।

## टेस्ट खोजें और चलाएँ

प्रोजेक्ट की रूट डायरेक्टरी से ये कमांड चलाएँ:

~~~sh
scarp test --list
scarp test --json=v2 --require-tests
scarp test --json=v2 --require-tests --filter greeting
~~~

रनर पहले manifest और प्रोजेक्ट का entrypoint जाँचता है। फिर वह `tests/` के अंदर सीधे मौजूद अधिकतम 64 `.srp` फ़ाइलें नाम के क्रम में देखता है। नाम और पाथ की जाँच के बाद फ़िल्टर लागू होता है। फ़िल्टर दिए गए टेक्स्ट को उसी केस में ढूँढता है। `--list` टेस्ट को कंपाइल नहीं करता और फ़िक्स्चर नहीं खोलता। कोई टेस्ट न मिलने पर डिफ़ॉल्ट रूप से कमांड सफल होता है। CI में ऐसी स्थिति को विफल करने के लिए `--require-tests` लगाएँ।

## सटीक आउटपुट की तुलना करें

`scarp init greetings` से प्रोजेक्ट बनाएँ। उसके अंदर `tests/greeting.srp` में लिखें:

~~~scarp
bind name = read_line();
assert(name == "नमस्ते", "unexpected input");
print(name);
eprint("done");
~~~

| फ़ाइल | सटीक UTF-8 सामग्री |
| --- | --- |
| `tests/greeting.stdin` | `नमस्ते`, फिर LF |
| `tests/greeting.stdout` | `नमस्ते`, फिर LF |
| `tests/greeting.stderr` | `done`, फिर LF |

साथ वाली हर फ़ाइल वैकल्पिक है। हर फ़ाइल की सीमा **1 MiB** है और वह प्रोजेक्ट के अंदर की एक सामान्य फ़ाइल होनी चाहिए। खाली stdout या stderr फ़िक्स्चर का मतलब है कि संबंधित स्ट्रीम भी खाली होनी चाहिए। रनर स्पेस और लाइन एंडिंग समेत हर बाइट की तुलना करता है। इनपुट फ़िक्स्चर केवल उसी टेस्ट के लिए है। टेस्ट में टर्मिनल का stdin नहीं जाता और इंटरैक्टिव प्रॉम्प्ट उपलब्ध नहीं हैं। केवल भरोसेमंद टेस्ट चलाएँ।

## विफलता रिपोर्ट पढ़ें

किसी टेस्ट के विफल होने पर कमांड **1** लौटाता है और पूरी JSON रिपोर्ट देता है। स्कीमा 2 में `compile`, `fixture` या `runtime` चरण मिलता है। आउटपुट भिन्न होने पर रनटाइम त्रुटि में स्ट्रीम, पहली अलग बाइट का ऑफ़सेट और अपेक्षित तथा वास्तविक लंबाई मिलती है। दोनों JSON स्कीमा कैप्चर किया गया आउटपुट और तुलना की गई बाइटें छोड़ देते हैं। सीधे लिखे गए diagnostic संदेश में प्रोग्रामर का टेक्स्ट अभी भी आ सकता है। गलत आर्ग्युमेंट पर कोड **2** मिलता है। Manifest या टेस्ट खोज में त्रुटि stderr पर आती है और टेस्ट रिपोर्ट नहीं बनती।

[टैग किया गया टेस्टिंग संदर्भ](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/docs/project-testing.md) · [टैग किए गए फ़िक्स्चर टेस्ट](https://github.com/scarp-lang/scarp/blob/a21b7b6d942bd1ca9abbbbb522f92f9c8e21e281/tests/scarp_test_stdin_fixtures.rs#L194) · [कमांड फ़ाइंडर](/hi/tooling/command-finder)
