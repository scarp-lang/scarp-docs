# प्रयोगात्मक native-object CLI

<!-- scarp-cli-release: v0.0.7-alpha.2 -->
<!-- scarp-current-source: 638dc4c227f34f1c660be66834bcc0cbdb22dec8 -->

यह पाठ प्रकाशित alpha.2 के object-only backend पर आधारित है। यह operating system, bootable kernel या executable बनाने का पूरा compiler नहीं है।

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

JSON सफल object publication के बाद stdout में आता है। `calls.o` ELF64 relocatable object है; इसे सीधे execute न करें।

## Modes और limits

| Mode | उपयोग |
| --- | --- |
| `checked` | एक pure integer function, forward scalar flow |
| `bounded` | Standalone function, loops और work allowance |
| `bounded-entry` | Named entry, same-file nonrecursive calls, work और stack allowance |

Target `x86_64-none` explicit है। दोनों allowances unsigned 32-bit decimal हैं। Stack budget aligned caller stack pointer के नीचे मापा जाता है; external argument slots और caller padding अलग हैं।

## Diagnostics और output

Success exit 0, invalid arguments या target exit 2, source/compile/output errors exit 1 हैं। Existing file या symlink नहीं बदले जाते। Parent directory मौजूद हो और filesystem hard links support करे।

JSON में schema_version, target, mode, symbol, max_work, peak_stack_bytes, max_active_frames और failure_spans मिलते हैं। Failure spans UTF-8 byte offsets हैं, character positions नहीं।

## क्या समर्थित नहीं

Native recursion, external calls, heap-backed values, aggregate execution, project inputs और executable linking भविष्य का काम है। Rust aggregate layout metadata execution support नहीं है। Interpreter के लिए `scarp exec` इस्तेमाल करें।

[वर्तमान reference](/hi/reference/current) · [मूल native-object contract](https://github.com/scarp-lang/scarp/blob/638dc4c227f34f1c660be66834bcc0cbdb22dec8/docs/native-object-output.md) · [Release](/hi/releases/v0.0.7-alpha.2).
