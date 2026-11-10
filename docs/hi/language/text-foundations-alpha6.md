# साफ़ scalar और text conversion — v0.0.6-alpha.6

<!-- scarp-current-release: v0.0.6-alpha.6 -->
<!-- scarp-cli-release: v0.0.6-alpha.6 -->
<!-- scarp-current-source: cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e -->

यह पाठ **[प्रकाशित v0.0.6-alpha.6](https://github.com/scarp-lang/scarp/releases/tag/v0.0.6-alpha.6)** के लिए है। पहले के alpha.5 compiler में ये functions नहीं हैं। असली [compiler contract](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/docs/text-foundations.md) और [tagged example](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.srp) देखें।

## छह नए built-ins

| Intrinsic | इनपुट → परिणाम | व्यवहार |
| --- | --- | --- |
| `integer_to_text` | integer → string | सामान्य decimal text |
| `float_to_text` | float → string | Finite float, negative zero सुरक्षित |
| `text_to_integer` | string → integer | Signed 64-bit decimal की जाँची हुई parsing |
| `text_to_float` | string → float | Explicit finite binary64 conversion |
| `text_trim` | string → string | दोनों सिरों की Unicode whitespace हटाए |
| `text_replace` | string, pattern, replacement → string | Literal, बाएँ से दाएँ, बिना overlap replacement |

इनमें **implicit conversion नहीं** होता। Integer text में optional `+` या `-` और ASCII digits होते हैं, spaces नहीं। Float में decimal exponent समर्थित है, मगर NaN, infinity, hexadecimal या गलत text नहीं। Spaces हटाने के लिए पहले `text_trim` लिखें। `text_replace` exact, case-sensitive UTF-8 text पर काम करता है, regex पर नहीं; empty search pattern से error होगा।

## प्रकाशित example

नीचे का code [प्रकाशित compiler example](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.srp) से है। मूल source का पहला historical comment पुराने alpha.5 candidate चरण को बताता है, लेकिन **alpha.6 tag प्रकाशित** है।

~~~scarp
pure funcra amount(text: string) -> integer {
    return text_to_integer(text_trim(text));
}

print(integer_to_text(amount("  -42 ")));
bind number = text_to_float("1.25e2");
print(float_to_text(number), to_integer(number));
print(text_replace(text_trim("  café café  "), "é", "🌍"));
print(float_to_text(-0.0));
~~~

[Tag का exact stdout](https://github.com/scarp-lang/scarp/blob/cdf6a3924ec2a36c7beca5a9aec4f01a0bce515e/examples/text_foundations.stdout):

~~~text
-42
125.0 125
caf🌍 caf🌍
-0.0
~~~

यह arbitrary-precision decimal calculation नहीं है। Float parsing finite binary64 में round करती है; `float_to_text(-0.0)` में minus और decimal marker रहते हैं। `integer` अभी signed i64 है; BigInt नहीं आया है।

## त्रुटियाँ, Unicode और limits

गलत या range से बाहर number text पर `E0044`; खाली replacement pattern पर `E0034` आता है। नई string पर पुराने 1,048,576-byte per-value limit और cumulative work/text quotas लागू हैं। Trim Unicode whitespace देखता है, text normalization नहीं करता। Replace पुराने string को mutate नहीं करता और locale आधारित search भी नहीं है।

[Program input](/hi/language/program-input-alpha6) से पढ़ी हुई line को स्पष्ट रूप से parse करें। अलग-अलग type का एक record रखने के लिए [tuples](/hi/language/tuples-alpha6) पढ़ें। [रिलीज़](/hi/releases/v0.0.6-alpha.6) · [English guide](/language/text-foundations-alpha6)।
