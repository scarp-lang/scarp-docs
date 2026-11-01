# Memory and value lifetimes

Scarp's current memory model is managed by its **Rust-hosted interpreter**. It is not a general manual-memory-management language, and this prerelease does not expose raw pointers, addressable references, user-controlled allocation, or explicit `free`/`delete` operations.

## Bindings and snapshots

~~~scarp
var count = 1;
bind old = count;
count = 2;
print(old);   // 1
print(count); // 2
~~~

Bindings hold values, and copying a value does not give the new name permission to mutate another binding. Strings and numerical buffers can share immutable storage under the hood. Pending output retains its own snapshots even after a variable changes.

## Scope retirement

The resolver tracks slots and emits internal *retirement* operations when lexical scopes end, after appropriate loop exits, and when function invocations finish. These internal operations drop no-longer-needed values without changing a returned value or preserved snapshot. Safe Rust storage structures, including shared immutable backing, implement these internals.

Retirement is **not garbage collection for arbitrary user object graphs**. Scarp does not currently implement addressable references, cyclic objects, closures, or asynchronous escapes. A small numerical window may retain a larger original allocation while it remains live.

## Budgets are not memory limits

`--max-live-slots`, `--max-capture-bytes`, and `--max-vector-bytes` constrain different logical quantities. In particular, `--max-vector-bytes` is a *cumulative* new-buffer payload cap; dropping old values does not refund it. None of these measures complete process RAM/RSS or provides a security sandbox.

**Verified against:** [automatic value retirement](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/memory-lifetimes.md), [resource limits](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/budgets.md), [compiler architecture](https://github.com/scarp-lang/scarp/blob/v0.0.5-alpha.1/docs/architecture.md).
