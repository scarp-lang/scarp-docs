# वेक्टर और टाइल

Scarp में विशेषज्ञ संख्यात्मक operations प्रयोगात्मक रूप से उपलब्ध हैं; ये सामान्य mutable arrays या पूर्ण tensor framework नहीं हैं। तत्व सीमित `float` होते हैं।

## वेक्टर

~~~scarp
bind values = [1.0, 2.0, 3.0];
print(len(values), values[0], sum(values));
~~~

वेक्टर immutable हैं। `len`, `sum`, `mean`, `dot`, `mse`, `fill`, `scale`, `clamp`, `softmax` और कई अन्य documented kernels हैं। इनका type/shape और domain जाँचा जाता है। Element indexing शून्य से शुरू होती है और सीमा से बाहर E0033 देती है।

## टाइल और matrix operations

~~~scarp
bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
print(matvec(weights, [2.0, 1.0])); // [4.0, 1.0]
~~~

`tile` row-major, immutable, दो-अक्ष वाला numeric value है। `height`, `width`, `cell`, `lane`, `unroll`, `turn`, `matvec`, `matmul`, `tileadd`, `tilescale` जैसे operations लागू होते हैं। Arbitrary broadcasting और mutable indexing उपलब्ध नहीं हैं।

## आकार और संसाधन सीमा

अधिकतम vector length 65,536 तत्व है। लंबाई/shape mismatch E0032, गलत numeric domain E0034, allocation E0035 और cumulative numeric payload quota E0036 दे सकते हैं। [numeric budget](/hi/reference/budgets) तथा [builtin reference](/hi/reference/library) देखें।

## अंग्रेज़ी संदर्भ के अपरिवर्तित कोड उदाहरण

नीचे दिए गए code snippets मूल अंग्रेज़ी संदर्भ से लिए गए हैं। Keywords, source strings और output expectations जानबूझकर अनुवादित नहीं किए गए हैं।

~~~scarp
bind values = [1.0, 2.0, 3.0, 4.0];
print(values, len(values), values[0]);
var weights = [0.2, 0.3, 0.5];
bind snapshot = weights;
weights = scale(weights, 2.0);
print(snapshot);
print(weights);
print(sum(values), mean(values));
~~~

~~~scarp
bind weights = tile([1.0, 2.0, -1.0, 3.0], 2, 2);
print(matvec(weights, [2.0, 1.0])); // [4.0, 1.0]
~~~
