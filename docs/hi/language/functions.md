# `funcra` से फ़ंक्शन

## घोषणा और उपयोग

~~~scarp
funcra square(value: integer) -> integer {
    return value * value;
}
print(square(6)); // 36
~~~

फ़ंक्शन में parameters और result के प्रकार अनिवार्य हैं। `unit` परिणाम वाले फ़ंक्शन में `return;` लिख सकते हैं। Forward calls, recursion और mutual recursion उपलब्ध हैं; सामान्य local values में type inference चलता है।

## डिफ़ॉल्ट और named arguments

~~~scarp
funcra endpoint(start: integer, length: integer = 5) -> integer {
    return start + length;
}
print(endpoint(7), endpoint(length: 2, start: 10)); // 12 12
~~~

Positionals हमेशा named arguments से पहले होते हैं। Default parameters आख़िर में होने चाहिए; default केवल पहले के parameters को पढ़ सकता है।

## `pure`, `needs` और `ensures`

`pure funcra` में आउटपुट या impure user-function call नहीं हो सकता, हालांकि अपने local `var` का बदलाव अनुमत है। `needs` precondition और `ensures` postcondition हैं; इन्हें runtime पर जाँचा जाता है, mathematical proof नहीं माना जाता। असफल अनुबंध E0026 देता है।

## संसाधन और सीमाएँ

फ़ंक्शन interpreter के heap frames उपयोग करते हैं। `--max-call-depth`, `--max-calls`, `--max-live-slots` recursion और work पर सीमाएँ लगाते हैं। Generic, closures, overloads और variable-length parameters अभी नहीं हैं। [CLI](/hi/tooling/cli) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
funcra square(value: integer) -> integer {
    return value * value;
}
bind answer = square(6);
print(answer); // 36
~~~

~~~scarp
funcra endpoint(start: integer, length: integer = 5) -> integer {
    return start + length;
}
print(endpoint(7), endpoint(length: 2, start: 10));
~~~

~~~scarp
pure funcra clipped(x: integer, lo: integer = 0, hi: integer = 10) -> integer
    needs lo <= hi;
    ensures result >= lo and result <= hi;
{
    if x < lo { return lo; }
    if x > hi { return hi; }
    return x;
}
print(clipped(x: 15)); // 10
~~~
