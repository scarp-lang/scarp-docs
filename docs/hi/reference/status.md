# फीचर की वर्तमान स्थिति

**आधार:** प्रकाशित **Scarp v0.0.5-alpha.1** (1 नवंबर 2026)। कोई भी language capability स्थिर compatibility guarantee नहीं है।

- **प्रकाशित — प्रयोगात्मक:** tagged release और tests/examples में उपलब्ध सुविधा।
- **विकास शाखा:** केवल unshipped source में दिखने वाली सुविधा; उसे प्रकाशित नहीं माना जाता।
- **नियोजित/अनुपलब्ध:** proposal या भविष्य की योजना, वर्तमान रिलीज़ में नहीं।

## प्रकाशित प्रयोगात्मक सुविधाएँ

| क्षेत्र | स्थिति |
| --- | --- |
| `bind`, `var`, scope/shadowing | प्रकाशित — प्रयोगात्मक |
| checked `integer`, finite `float`, `string`, `boolean` | प्रकाशित — प्रयोगात्मक |
| `if`/`elif`/`else`, `while`, `repeat` | प्रकाशित — प्रयोगात्मक |
| `funcra`, recursion, named/default args, `needs`/`ensures`, `pure` | प्रकाशित — प्रयोगात्मक |
| `print`, `println`, `write`, `eprint`, `ewrite` | प्रकाशित — प्रयोगात्मक |
| immutable numerical vectors, tiles, numeric kernels | प्रकाशित — प्रयोगात्मक |
| relative imports, public functions/scalar constants | प्रकाशित — प्रयोगात्मक |
| `run`, `check`, `tokens`, version/help | प्रकाशित — प्रयोगात्मक |
| runtime budgets, automatic value retirement | प्रकाशित — प्रयोगात्मक |

## अभी उपलब्ध नहीं

Native-code generation, `scarp build`/`compile` CLI, सामान्य standard library, package manager/registry, user-defined classes/structs/traits, closures, generics, mutable vector/tile indexing, arbitrary tensors, network imports, runtime module globals और self-hosted compiler अभी उपलब्ध नहीं हैं।

## स्थिति कैसे अपडेट होती है?

हर नए प्रकाशित release के लिए source commit, compiler tests और release notes मिलाएँ। केवल proposal लिखे होने से feature shipped नहीं कहलाता। [साक्ष्य सत्यापन](/hi/reference/evidence), [compatibility](/hi/reference/compatibility) तथा [आधिकारिक compiler release](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.1) देखें।
