# कंट्रोल फ्लो

## शाखाएँ: `if`/`elif`/`else`

~~~scarp
bind score = 42;
if score >= 50 {
    print("उत्तीर्ण");
} elif score >= 40 {
    print("पुनः प्रयास");
} else {
    print("अधिक अभ्यास");
}
~~~

शर्त हमेशा `boolean` होनी चाहिए; अंक 0/1 को स्वतः boolean नहीं माना जाता। हर शाखा का static validation होता है, लेकिन runtime पर केवल चुनी हुई शाखा चलती है।

## `while` लूप

`while condition { ... }` हर iteration पर condition जाँचता है। `break;` निकटतम loop से बाहर और `continue;` अगले iteration पर जाता है।

## `repeat` गिनती वाला लूप

`repeat 5 as index { ... }` में count पहले एक बार जाँचा जाता है। इंडेक्स 0 से 4 तक है। नकारात्मक count पर E0019 आता है।

## सीमित execution

अनंत execution रोकने के लिए `--max-steps` तथा print limits हैं। सीमा बढ़ाने से पहले loop की प्रगति जाँचें। [लूप ट्यूटोरियल](/hi/tutorials/repeat-and-loops) और [बजट](/hi/reference/budgets) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind score = 82;
if score >= 90 {
    print("excellent");
} elif score >= 60 {
    print("passed");
} else {
    print("retry");
}
~~~

~~~scarp
var index = 0;
var total = 0;
while index < 10 {
    index += 1;
    if index == 3 { continue; }
    if index > 5 { break; }
    total += index;
}
print(total);
~~~
