# संख्यात्मक tuple की lexicographic तुलना — compiler development preview

> **केवल development source के लिए।** यह पृष्ठ Scarp compiler के `main` पर commit [`fde0e374b445fb573dfd980bde36f83e9d76e729`](https://github.com/scarp-lang/scarp/commit/fde0e374b445fb573dfd980bde36f83e9d76e729) से उपलब्ध feature को बताता है। अलग से प्रकाशित **v0.0.6-alpha.19 में tuple ordering नहीं है**। नीचे का कोड alpha.19 डाउनलोड पर नहीं चलेगा। अगले release की घोषणा या मंज़ूरी इस पृष्ठ से नहीं होती।

## तुलना कैसे होती है?

Development interpreter में `<`, `<=`, `>`, और `>=` tuple के सदस्यों को **बाएँ से दाएँ** compare करते हैं। पहले सदस्य बराबर हों, तो दूसरे को देखते हैं। पहला अंतर परिणाम तय करता है। सभी सदस्य बराबर हों तो `<=` और `>=` true देते हैं, जबकि `<` और `>` false देते हैं।

~~~scarp
print((10, 20) < (30, 40));       // true
print((10, 20) < (10, 20));       // false
print((10, 20) >= (10, 20));      // true
print((1, (2, 3)) < (1, (2, 4))); // true
~~~

दोनों operands के **structural tuple types बिल्कुल एक जैसे** होने चाहिए। हर अंतिम सदस्य `integer`, `float`, `bigint` या `decimal` जैसा ordered numeric type होना चाहिए। इनसे बने nested tuples भी चलते हैं। कोई implicit numeric conversion नहीं होता।

## कौन-सी तुलना अमान्य है?

~~~scarp
print(("a",) < ("b",));          // invalid: string members are unordered
print((true,) > (false,));      // invalid: boolean members are unordered
print((1,) < (1.0,));           // invalid: different structural types
print((1, 2) >= (1,));          // invalid: different tuple arity
~~~

Compiler इनका **static verification** में ही विरोध करता है। `==` और `!=` की पहले से मौजूद structural equality अलग feature है; इस बदलाव से strings/booleans की equality या tuple arithmetic का नियम नहीं बदलता।

## Nested tuple, signed zero और budget

Nested numeric tuples को भी बाएँ से दाएँ compare किया जाता है। Finite float के `-0.0` और `0.0` बराबर माने जाते हैं। Interpreter का पहले से मौजूद conservative composite-work budget तुलना पर लागू रहता है। सीमित C11 तथा ELF64 scalar backends अभी भी tuple operations स्वीकार नहीं करते।

## वास्तविक source और stdout

Compiler repository में [चलने वाला .srp उदाहरण](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/examples/tuple_ordering.srp), [सटीक stdout](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/examples/tuple_ordering.stdout), और [Rust tests](https://github.com/scarp-lang/scarp/blob/fde0e374b445fb573dfd980bde36f83e9d76e729/tests/tuples.rs) उपलब्ध हैं। [PR #353](https://github.com/scarp-lang/scarp/pull/353) का Linux, Windows, macOS, minimum-Rust और package CI पास हुआ था।

इसे **development compiler source** पर जाँचने के लिए दिए गए commit को checkout करके चलाएँ:

~~~sh
cargo run --locked -- exec examples/tuple_ordering.srp
~~~

सटीक output:

~~~text
true
false
true
true
~~~

**Published release के लिए:** [आधिकारिक डाउनलोड](https://scarp-lang.github.io/downloads/) तथा [वर्तमान प्रकाशित reference](/hi/reference/current) देखें। Development feature को released feature न समझें।

[Read in English](/language/tuple-ordering-development).
