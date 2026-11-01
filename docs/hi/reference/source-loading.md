# Module loading और सुरक्षा सीमाएँ

Source modules v0.0.5-alpha.1 में आते हैं। CLI entry फ़ाइल के parent folder को trusted root मानता है। Import path **importing file** के relative होता है।

## Relative path नियम

`import "sub/other.srp" as other;` जैसी syntax उपयोग करें। Path के भीतर `/` और `.srp` suffix चाहिए। Absolute paths, drive/URI prefixes, `\`, empty components, root से बाहर जाने वाले `..` और NUL/control characters अमान्य हैं। Canonicalization root के बाहर resolve होने वाली symlink को अस्वीकार करती है।

## Default module graph सीमाएँ

| क्षेत्र | डिफ़ॉल्ट सीमा |
| --- | ---: |
| Files | 128 |
| Import depth | 32 |
| प्रति फ़ाइल source | 1 MiB |
| कुल source | 8 MiB |
| Import declarations | 1,024 |
| Expansion text | 8 MiB |

ये file/source graph सीमाएँ हैं और runtime `--max-*` विकल्पों से स्वतंत्र रहती हैं।

## Untrusted स्रोत embed करना

Filesystem loader concurrent symlink replacement के विरुद्ध पूर्ण सुरक्षा sandbox नहीं है। अविश्वसनीय source tree चलाने के लिए पृथक trusted directory या नियंत्रित in-memory `SourceLoader` बेहतर है। Interpreter budgets भी parser memory या पूरी host RAM की सीमा नहीं देते।

## त्रुटि पहचानें

Import load/UTF-8 E0038, cycle E0039, size E0040, inaccessible symbol E0041, bad alias E0042 और path policy E0043। [मॉड्यूल](/hi/language/modules) तथा [डायग्नॉस्टिक्स](/hi/reference/diagnostics) देखें।
