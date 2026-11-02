# वर्ज़न अनुकूलता

Scarp के शुरुआती prereleases में syntax और API बदले हैं। यहाँ प्रकाशित रिलीज़ के आधार पर सही व्यवहार चुनें।

| संस्करण | प्रमुख प्रकाशित सुविधा |
| --- | --- |
| `v0.0.1` | integer arithmetic, शुरुआती printing |
| `v0.0.2` | bindings, scopes, strings, boolean, branching |
| `v0.0.3-beta.1` | while/repeat, budget सीमाएँ, पुराने output spellings |
| `v0.0.3-beta.3` | typed `funcra` functions और contracts |
| `v0.0.4-alpha.1` | finite scalar floats |
| `v0.0.4-alpha.4` | vectors और tiles के साथ संख्यात्मक milestone |
| **`v0.0.5-alpha.1`** | relative source modules, public symbols; मुख्य docs baseline |
| **`v0.0.5-alpha.2`** | **2 नवंबर 2026 को प्रकाशित नवीनतम prerelease:** typed declarations, bitwise integers, Unicode और [जाँचे गए उदाहरण](/hi/releases/v0.0.5-alpha.2) |

## Alpha.1 से alpha.2 में जाँचा हुआ अपग्रेड

[Compiler-verified अपग्रेड परीक्षण](/hi/reference/upgrade-readiness) में पुराने **11 alpha.1 source programs** को बिना बदले नए प्रकाशित alpha.2 compiler पर चलाया जाता है। CI उनके stdout bytes तथा silent `check` की तुलना करती है। इससे सभी पुराने programs के compatible होने की गारंटी नहीं होती और मुख्य reference का alpha.1 baseline नहीं बदलता।

## पुराना स्रोत migrate करना

नए source में अपरिवर्तनीय declaration `bind name = expr;`, mutable declaration `var name = expr;` है। पुराने `let`/`let mut` syntax को वर्तमान `bind`/`var` से बदलें। `print` और `println` alias हैं, लेकिन बहुत पुराने binaries इन्हें अलग तरह से समझते थे।

## दस्तावेज़ सही रखें

उसी tagged executable के साथ उदाहरण जाँचें जिसके version का दावा कर रहे हैं। `main` पर experimental work को प्रकाशित version समझने की गलती न करें। [फ़ीचर स्थिति](/hi/reference/status) और [परीक्षण प्रमाण](/hi/reference/evidence) देखें।
