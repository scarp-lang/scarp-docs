# Pearson correlation — प्रकाशित alpha.5

प्रकाशित [Scarp v0.0.6-alpha.5](/hi/releases/v0.0.6-alpha.5) में `pearson_correlation(left, right) -> float` आता है। यह दो paired vectors का **mean-centered linear संबंध** -1 से 1 के बीच निकालता है। `cosine_similarity` के विपरीत दोनों vectors का अपना mean अलग हटता है।

## Input और errors

दोनों vectors की लंबाई बराबर और कम से कम **दो observations** होनी चाहिए। कोई भी vector constant (zero variance) नहीं हो सकता। सभी values finite चाहिए। दूसरे vector की गलत लंबाई पर E0032, constant/कम elements पर E0034, गलत types/arguments पर E0015/E0024 मिलता है। Input data नहीं बदलता; `window(...)` का visible भाग ही लिया जाता है।

[प्रकाशित source](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.srp) और [सटीक stdout](https://github.com/scarp-lang/scarp/blob/205e92f166f186c3905e5880d41c31717b697b8e/examples/pearson_correlation.stdout) में सीधा संबंध `1.0`, उलटा संबंध `-1.0` और centered zero संबंध `0.0` दिखता है।

## गणना और budget

अलग-अलग centered/scaled axes और compensated reductions से बहुत बड़ी finite values को सावधानी से संभाला जाता है। Floating-point में अत्यंत कठिन data पर exact mathematical answer की गारंटी नहीं। अधिकतम 65,536 elements पर `12 × N` abstract work steps पहले गिने जाते हैं। नया numerical vector payload allocate नहीं होता। यह GPU, tensors या automatic differentiation नहीं जोड़ता।

[English explanation](/language/pearson-correlation-alpha5) · [प्रकाशित release](/hi/releases/v0.0.6-alpha.5)।
