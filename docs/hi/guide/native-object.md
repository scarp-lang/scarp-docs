# प्रयोगात्मक native-object CLI

<!-- scarp-cli-release: v0.0.7-alpha.3 -->
<!-- scarp-current-source: 44a3bb0a91e67570e46ce058a3f6211f8e5db0f5 -->

यह पाठ प्रकाशित alpha.3 के object-only backend पर आधारित है। यह operating system, bootable kernel या executable बनाने का पूरा compiler नहीं है।

## एक छोटा call graph

खाली directory में नीचे का source `calls.srp` के नाम से रखें। पहले से मौजूद output को compiler overwrite नहीं करता।

~~~scarp
pure funcra add_one(value: integer) -> integer {
    return value + 1;
}

pure funcra evaluate(value: integer) -> integer {
    return add_one(value);
}
~~~

~~~sh
scarp native-object --json x86_64-none bounded-entry evaluate 1000 512 calls.srp -o calls.o
~~~

Source में `evaluate` entry चुनता है; object का exported symbol **`scarp_bounded_integer_entry`** है, `evaluate` नहीं। JSON सफल object publication के बाद stdout में आता है। `calls.o` ELF64 relocatable object है; इसे सीधे execute न करें।

## Modes और limits

| Mode | उपयोग | Exported symbol |
| --- | --- | --- |
| `checked` | एक pure integer function, forward scalar flow | `scarp_checked_integer_function` |
| `bounded` | Standalone function, loops और work allowance | `scarp_bounded_integer_function` |
| `bounded-entry` | Named entry, same-file nonrecursive calls, work और stack allowance | `scarp_bounded_integer_entry` |

Target `x86_64-none` explicit है। दोनों allowances unsigned 32-bit decimal हैं। Stack budget aligned caller stack pointer के नीचे मापा जाता है; external argument slots और caller padding अलग हैं।

## Diagnostics और output

Success exit 0, invalid arguments या target exit 2, source/compile/output errors exit 1 हैं। Existing file या symlink नहीं बदले जाते। Parent directory मौजूद हो और filesystem hard links support करे।

JSON में schema_version, target, mode, symbol, max_work, peak_stack_bytes, max_active_frames और failure_spans मिलते हैं। Failure spans UTF-8 byte offsets हैं, character positions नहीं।

## समस्या का निदान

Reported peak_stack_bytes इस exact source और selected entry के लिए न्यूनतम accepted stack allowance है। उतना ही budget देकर object bytes समान रहते हैं; एक byte कम पर rejection होना चाहिए। External caller arguments और interrupt frames इसमें शामिल नहीं हैं।

`x86_64` target अमान्य है; explicit `x86_64-none` उपयोग करें। Missing source, unsupported construct अथवा पहले से मौजूद destination पर नया replacement object नहीं बनता। JSON failure_spans में comments तथा original line endings के byte offsets भी गिने जाते हैं; इसलिए exact source file और JSON report साथ रखें।

## क्या समर्थित नहीं

Native recursion, external calls, heap-backed values, general aggregate parameters/results, project inputs और executable linking उपलब्ध नहीं हैं। Alpha.3 में private flat integer/Boolean aggregate stack locals तथा concrete integer generic specialization उपलब्ध हैं। Interpreter के लिए `scarp exec` इस्तेमाल करें।

[वर्तमान reference](/hi/reference/current) · [मूल native-object contract](https://github.com/scarp-lang/scarp/blob/44a3bb0a91e67570e46ce058a3f6211f8e5db0f5/docs/native-object-output.md) · [Release](/hi/releases/v0.0.7-alpha.3).

[Native ABI और host testing](/hi/guide/native-abi) · [Native value layout](/hi/guide/native-layout).

Alpha.3 की नई सुविधाओं और उनकी सीमाओं के लिए [Generic functions](/hi/guide/v007-alpha3-generics-strings) तथा [Native aggregate locals](/hi/guide/native-aggregate-locals) पढ़ें।
