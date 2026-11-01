# Runtime budgets

The interpreter enforces deterministic **logical** work and storage budgets for both `run` and `check`. They are not wall-time limits or complete limits on OS process memory.

| CLI option | Default | What it limits |
| --- | ---: | --- |
| `--max-steps` | 1,000,000 | Selected instructions and expression work |
| `--max-prints` | 100,000 | Selected output statements on both streams |
| `--max-call-depth` | 256 | Active user function frames |
| `--max-calls` | 100,000 | Cumulative selected user calls |
| `--max-live-slots` | 1,000,000 | Allocated slots across live frames and saved loop state |
| `--max-capture-bytes` | 16,777,216 | Logical output snapshot storage |
| `--max-vector-bytes` | 8,388,608 | Cumulative newly allocated vector/tile element payload |

## Using limits

~~~sh
scarp run --max-steps 2000000 --max-prints 10 examples/repeat.srp
scarp check --max-calls 200000 --max-call-depth 512 examples/functions.srp
~~~

Options must appear **before** the filename. Each may occur once, in any order; values are unsigned decimal counts, including zero. `tokens` rejects execution-budget flags. An option missing its value or appearing after the source file produces CLI usage error **2**.

An exhausted work budget produces error `E0017`; output count `E0018`, call/slot exhaustion `E0027`, capture-byte exhaustion `E0029`, and cumulative new numerical payload exhaustion `E0036`. Program output is not replayed after a resource error.

## Source-module limits

The CLI also applies separate defaults for imported source graphs: **128 unique source files**, **32 import edges deep**, **1 MiB per source file**, **8 MiB combined source text**, **1,024 import statements**, and **8 MiB expansion text**. These are not controlled by the seven execution flags. Rust embedders can configure the `ModuleLimits` API.

## Important interpretation

These are *accounting budgets*, not a sandbox. Retiring a vector does not refund `--max-vector-bytes`; the cumulative cap only measures new element buffers. `--max-live-slots` counts allocated frame slots, not the number of currently occupied bindings. Source parsing and host allocations fall outside these limits.

**Verified against:** [budget contract](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/budgets.md), [module limits](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/modules.md).
