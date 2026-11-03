# वेरिएबल और स्कोप

**संस्करण नोट:** यह पुराना मुख्य reference **v0.0.5-alpha.1** पर आधारित है। प्रकाशित **alpha.2** से `bind count: integer = 42;` जैसे optional type annotations समर्थित हैं। इनकी पूरी [English/Hindi compiler-verified typed-binding guide](/hi/language/typed-bindings-alpha2) अलग release-specific पाठ में है। नीचे पुराने alpha.1 नियम और उदाहरण उसी संस्करण के लिए हैं।

## अपरिवर्तनीय `bind`

~~~scarp
bind width = 6;
bind height = 7;
print(width * height); // 42
~~~

`bind` में मान देने के बाद उसी binding को फिर assign नहीं कर सकते। नाम initializer के बाद उपलब्ध होता है; आगे या स्वयं के संदर्भ अमान्य हैं। एक ही scope में दो बार वही नाम घोषित नहीं कर सकते।

## बदलने योग्य `var`

~~~scarp
var count = 2;
bind saved = count;
count += 5;
print(count, saved); // 7 2
~~~

`var` पर `=`, `+=`, `-=`, `*=`, `/=` लागू हो सकते हैं। नया मान पुराने मान का प्रकार बनाए रखता है; implicit conversions उपलब्ध नहीं हैं। `saved` पिछले मान का snapshot है।

## Lexical scope और shadowing

`{ ... }` नया scope बनाता है। अंदर वाला binding बाहर वाले नाम को छिपा सकता है। असाइनमेंट सबसे नज़दीकी उपलब्ध binding में जाता है; यदि वह `bind` है, तो बाहर का `var` भी नहीं बदलेगा। स्कोप समाप्त होने के बाद स्थानीय नाम दिखाई नहीं देता।

## प्रतिबंध और त्रुटियाँ

अघोषित नाम E0010, duplicate नाम E0011, reserved नाम E0012, immutable पर assignment E0013 तथा type mismatch E0015 देता है। **Alpha.1** में local bindings का अलग type annotation समर्थित नहीं था। **Alpha.2 और उसके बाद के रिलीज़ में optional checked annotation उपलब्ध है**, लेकिन uninitialized घोषणा इस पाठ में समर्थित नहीं है।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind width = 6;
bind height = 7;
bind area = width * height;
print(area); // 42
~~~

~~~scarp
var count = 2;
bind snapshot = count;
count += 5;
print(count);    // 7
print(snapshot); // 2
~~~

~~~scarp
var total = 1;
{
    bind total = total + 10;
    print(total); // 11
}
total += 2;
print(total); // 3
~~~
