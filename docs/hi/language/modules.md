# Scarp source modules

**v0.0.5-alpha.1** से `.srp` फ़ाइलें अन्य फ़ाइलों के public symbols उपयोग कर सकती हैं।

## मॉड्यूल आयात

~~~scarp
import "libraries/math.srp" as math;
print(math.twice(math.factor));
~~~

`import` को फ़ाइल-स्तर पर लिखें और `as` से alias दें। उपयोग `alias.member` के रूप में होता है; wildcard import या implicit global lookup नहीं है।

## लाइब्रेरी क्या export कर सकती है?

`pub pure funcra` फ़ंक्शन और `pub bind` immutable scalar literal constants export होते हैं। अन्य declarations private हैं। Library की top level पर print, loops, mutable bindings, vector/tile constants, computed initializers या कोई runtime initialization नहीं। ऐसी गणना फ़ंक्शन में रखें।

## पथ और सुरक्षा नियम

Import path importing फ़ाइल के relative होता है। `/` separators और `.srp` suffix प्रयोग करें। Absolute path, root से बाहर जाने वाला `..`, network URL या चक्रीय import निषिद्ध हैं। Import graph size की अलग सीमाएँ हैं। [पूरा मॉड्यूल ट्यूटोरियल](/hi/tutorials/modules-walkthrough) और [source-loading सुरक्षा](/hi/reference/source-loading) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
import "modules/settings.srp" as settings;
print(settings.title);
~~~

~~~scarp
pub bind title = "Modular inference";
pub bind gain = 1.0;
~~~
