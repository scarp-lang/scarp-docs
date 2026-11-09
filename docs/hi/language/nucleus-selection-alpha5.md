# निश्चित Top-P चयन — प्रकाशित alpha.5

प्रकाशित [Scarp v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5) में `top_p(probabilities, mass)` और `top_p_values(probabilities, mass)` उपलब्ध हैं। ये तय क्रम में candidates चुनते हैं। यह **random sampling या AI model चलाना नहीं** है।

## कैसे काम करता है?

`top_p` मूल zero-based indices लौटाता है और `top_p_values` उन्हीं की values। Probability बड़े से छोटे क्रम में चुनी जाती है; बराबर value होने पर मूल index पहले आता है। Mass **0 से बड़ा तथा 1 तक** finite float होना चाहिए। Exactly `1.0` पर zero-probability सहित **सारे candidates** लौटते हैं।

Input में 1 से 65,536 finite nonnegative probabilities चाहिए और उनका योग `1e-12` tolerance के अंदर 1 होना चाहिए। Unnormalized logits सीधे नहीं चलेंगे; पहले `softmax` या `softmax_temp` लगाएँ। `window(...)` में indices केवल दिखाई देने वाले भाग के अनुसार लौटते हैं।

## प्रकाशित उदाहरण

[असली Scarp source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.srp) और [exact stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/nucleus_selection.stdout) देखें। `[0.5, 0.25, 0.25]` तथा mass `0.75` पर `[integer: 0, 1]` मिलता है। Mass `1.0` पर `[integer: 0, 1, 2]` मिलता है।

## Error और budget

अमान्य probabilities/mass पर E0034, गलत arguments की संख्या पर E0024 और गलत types पर E0015 मिलता है। Sorting `O(N log N)` है; काम का budget `N × (floor(log2(N)) + 5)` steps और index buffer `8N` bytes है। `K` selected values पर `8K` bytes अतिरिक्त लगते हैं। Budget खत्म होने पर E0017/E0036 हो सकता है। यह सुविधा RNG, GPU या native compiler नहीं जोड़ती।

[English explanation](/language/nucleus-selection-alpha5) · [प्रकाशित release](/hi/releases/v0.0.6-alpha.5)।
