# Alpha.2 collections, scores और learning primitives

**Compiler: v0.0.5-alpha.2, प्रकाशित 2 नवंबर 2026।** नीचे चारों प्रोग्राम tagged source और expected-output फ़ाइलों से पूरे लिए गए हैं। TypeScript check दोनों भाषाओं में उनका सही content जाँचता है। अलग GitHub Actions job प्रकाशित Rust interpreter से वास्तविक execution करती है।

यह ट्यूटोरियल [alpha.2 रिलीज़ गाइड](/hi/releases/v0.0.5-alpha.2) का अगला भाग है। पुराना [alpha.1 संदर्भ](/hi/reference/status) अलग version पर pinned है और नई alpha.2 सुविधाएँ उसमें शामिल होने का दावा नहीं करना चाहिए।

## 1. अपरिवर्तनीय integer collections

पूरा प्रकाशित source:

~~~scarp
bind values: integers = ints_range(1, 5, 1);
bind window = ints_window(values, 1, 3);
bind changed = ints_set(values, 0, 9);
var total: integer = 0;
repeat ints_len(window) as index {
    total += window[index];
}
print(values, changed, window, total);
print(ints_to_vector(window), ints_join([integer: 6], [integer: 7]));
~~~

प्रकाशित fixture का अपेक्षित stdout:

~~~text
[integer: 1, 2, 3, 4, 5] [integer: 9, 2, 3, 4, 5] [integer: 2, 3, 4] 9
[2.0, 3.0, 4.0] [integer: 6, 7]
~~~

यह range पाँच integers बनाती है। Window और indexed replacement नई immutable collections लौटाते हैं; पुरानी collection नहीं बदलती। ints_to_vector से integer values को स्पष्ट रूप से finite float vector में बदला जाता है।

प्रमाण: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/integer_collections.stdout).

## 2. स्थिर score selection

पूरा प्रकाशित source:

~~~scarp
// A stable, first-match score winner.
bind scores = [1.0, 3.0, 3.0];
print(argmax(scores), maxval(scores));
print(argmin(scores), minval(scores));
~~~

प्रकाशित fixture का अपेक्षित stdout:

~~~text
1 3.0
0 1.0
~~~

बराबर अधिकतम स्कोर पर argmax पहला index चुनता है और argmin पहले न्यूनतम स्कोर का index चुनता है। maxval और minval स्थान नहीं, मान लौटाते हैं।

प्रमाण: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/score_selection.stdout).

## 3. स्थिर numerical probabilities

पूरा प्रकाशित source:

~~~scarp
pure funcra normalize_weights(values: vector) -> vector
    needs len(values) > 0;
    needs values == clamp(values, 0.0, 1e308);
    needs sum(values) > 0.0;
    ensures sum(result) > 0.999999999999 and sum(result) < 1.000000000001;
{
    return scale(values, 1.0 / sum(values));
}

print(normalize_weights([2.0, 3.0, 5.0]));
print(softmax([1000.0, 1000.0, 1000.0, 1000.0]));
print(softmax([-1e308, 1e308]));
bind probabilities = softmax([1.0, 2.0, 3.0]);
print(sum(probabilities) > 0.999999999999 and sum(probabilities) < 1.000000000001);
print(probabilities[0] < probabilities[1] and probabilities[1] < probabilities[2]);
~~~

प्रकाशित fixture का अपेक्षित stdout:

~~~text
[0.2, 0.30000000000000004, 0.5]
[0.25, 0.25, 0.25, 0.25]
[0.0, 1.0]
true
true
~~~

फ़ंक्शन में needs preconditions और ensures postcondition हैं। 0.30000000000000004 सामान्य binary64 rounding है। softmax बहुत बड़े और बराबर scores का हिसाब करता है; इससे अनंत precision का दावा नहीं होता।

प्रमाण: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/vector_probabilities.stdout).

## 4. स्पष्ट loss gradients, automatic training नहीं

पूरा प्रकाशित source:

~~~scarp
// One-hot target construction and explicit categorical-loss gradient.
// No automatic differentiation or training loop is implied.
bind logits = [0.0, 0.0];
bind class_id = 1;
print(onehot(3, class_id));
print(lossgrad(logits, class_id));
print(crossentropy([3.0], 0));
~~~

प्रकाशित fixture का अपेक्षित stdout:

~~~text
[0.0, 1.0, 0.0]
[0.5, -0.5]
0.0
~~~

onehot, lossgrad और crossentropy numerical operations हैं। Gradient value मिलने का अर्थ automatic differentiation, backpropagation, weight updates या built-in training loop उपलब्ध होना नहीं है।

प्रमाण: [source](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.srp), [stdout](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.2/examples/classification_training.stdout).


## प्रकाशित compiler से चलाएँ

Alpha.2 executable पर इन्हीं filenames का इस्तेमाल करें:

~~~sh
scarp check integer_collections.srp
scarp run integer_collections.srp
~~~

सही check का output खाली रहता है। CI program stdout की आख़िरी newline सहित byte-for-byte तुलना भी करती है।

## महत्वपूर्ण सीमाएँ

Immutable integer collections सामान्य Python list API नहीं हैं। Vector output finite होना चाहिए और resource budgets लागू होते हैं। Classification helper के होने से पूरा AI training framework उपलब्ध नहीं हो जाता। यह experimental prerelease है।

आगे [alpha.2 CLI inspection](/hi/tooling/alpha2-inspection), [built-ins](/hi/reference/library), [budgets](/hi/reference/budgets), और [सत्यापन](/hi/reference/evidence) पढ़ें।
