# मेमोरी और मानों का जीवनकाल

Scarp v0.0.5-alpha.1 में immutable मानों को साझा करने और scope समाप्त होने पर उपलब्ध references छोड़ने की व्यवस्था है। यह **पूर्ण memory-safety मॉडल की सार्वजनिक गारंटी** नहीं है और न ही भाषा में raw pointers उपलब्ध हैं।

## Binding और snapshot

~~~scarp
var count = 2;
bind old = count;
count += 1;
print(old, count); // 2 3
~~~

`bind old = count` पुराने मान का snapshot रखता है। स्ट्रिंग, वेक्टर और टाइल के कुछ backing buffers संदर्भों में साझा हो सकते हैं; बदलते `var` के कारण पहले सुरक्षित snapshot नहीं बदलते।

## स्कोप से बाहर होने पर retirement

Resolver scope छोड़ते समय frame slots के लिए internal retirement निर्देश तैयार करता है। `break`, `continue` और `return` के समय भी सुरक्षित lifecycle लागू होता है। उपयोगकर्ता को `free` या `delete` लिखने की जरूरत नहीं; returned values और लंबित output snapshots बचे रहते हैं।

## Budgets और RAM अलग हैं

`--max-live-slots` frame slots गिनता है, वास्तविक प्रयुक्त bytes नहीं। `--max-vector-bytes` नया बनाया गया कुल numeric payload गिनता है और पुराना memory छोड़ने पर quota वापस नहीं देता। ये सीमाएँ पूरी प्रक्रिया की RAM, parser allocations या वास्तविक peak usage नहीं मापतीं। [बजट संदर्भ](/hi/reference/budgets) पढ़ें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
var count = 1;
bind old = count;
count = 2;
print(old);   // 1
print(count); // 2
~~~
