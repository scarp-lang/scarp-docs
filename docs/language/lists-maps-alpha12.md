# Immutable lists and deterministic maps — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

Published alpha.12 adds immutable `list<T>` and `map<K,V>` collection types. List length is not part of its type. `list_push`, `list_set`, and `list_remove` return new snapshots without changing previous values. Map keys are output in **canonical order** independent of literal insertion order.

## Typed immutable list values

[typed_dynamic_lists.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_dynamic_lists.srp) · [tagged stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_dynamic_lists.stdout)

~~~scarp
// Source-level typed dynamic lists: immutable values with a length-independent type.
// Every binding retains a snapshot and list indexing is checked at runtime.
record Task {
    title: string,
    done: boolean,
}

pure funcra first_title(tasks: list<record Task>) -> string {
    return tasks[0]->title;
}

bind one: list<record Task> = [list:
    new Task { title: "Draft", done: false },
    new Task { title: "Review", done: true },
];
bind unchanged = one;

var tasks: list<record Task> = one;
print("First", first_title(tasks));
tasks = [list:
    new Task { title: "Ready", done: true },
    new Task { title: "Review", done: true },
    new Task { title: "Publish", done: false },
];
assert(unchanged[0]->title == "Draft");
print("Updated", first_title(tasks), tasks[2]->title);
bind empty: list<integer> = [list: <integer>];
print("Empty", empty);
bind nested: list<list<integer>> = [list: [list: 1, 2], [list: 3]];
print("Nested", nested[0][1], nested[1][0]);
~~~

~~~text
First Draft
Updated Ready Publish
Empty [list: <integer>]
Nested 2 3
~~~

~~~sh
scarp verify examples/typed_dynamic_lists.srp
scarp exec examples/typed_dynamic_lists.srp
~~~

## Push, replace and remove without mutating snapshots

[persistent_list_updates.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/persistent_list_updates.srp) · [tagged stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/persistent_list_updates.stdout)

~~~scarp
// Pure persistent collection operations: no mutation of published snapshots.
record Task { title: string, done: boolean }

pure funcra add_task(tasks: list<record Task>, title: string) -> list<record Task> {
    return list_push(tasks, new Task { title: title, done: false });
}

bind empty: list<record Task> = [list: <record Task>];
bind first = add_task(empty, "Draft");
bind second = add_task(first, "Review");
print("Counts", list_len(empty), list_len(first), list_len(second));
print("First", second[0]->title, second[1]->title);

// Replacing and removing return new lists without affecting their input.
bind reviewed = list_set(second, 1, new Task { title: "Approved", done: true });
bind only_one = list_remove(reviewed, 0);
print("Snapshots", second[1]->title, reviewed[1]->title);
print("Remaining", list_len(only_one), only_one[0]->title);
assert(list_len(empty) == 0);
assert(list_len(first) == 1);
assert(list_len(second) == 2);
assert(only_one[0]->done);

// Length-independent list<T> permits assigning a new complete snapshot.
var active: list<record Task> = first;
active = only_one;
print("Active", active[0]->title);
~~~

~~~text
Counts 0 1 2
First Draft Review
Snapshots Review Approved
Remaining 1 Approved
Active Approved
~~~

~~~sh
scarp verify examples/persistent_list_updates.srp
scarp exec examples/persistent_list_updates.srp
~~~

## Typed maps and canonical key order

[typed_maps.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_maps.srp) · [tagged stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/typed_maps.stdout)

~~~scarp
// Typed, immutable maps have canonical ordering irrespective of source order.
pure funcra labels() -> map<string, integer> {
    return [map: "z": 9, "a": 1];
}

bind original = labels();
bind reversed = [map: "a": 1, "z": 9];
print(original);
print(original == reversed);
bind empty: map<integer, string> = [map: <integer, string>];
print(empty);
bind features: map<boolean, string> = [map: true: "enabled", false: "disabled"];
print(features);
bind nested: map<integer, list<integer>> = [map:
    2: [list: 1, 2],
    1: [list: 3],
];
print(nested);
~~~

~~~text
[map: "a": 1, "z": 9]
true
[map: <integer, string>]
[map: false: "disabled", true: "enabled"]
[map: 1: [list: 3], 2: [list: 1, 2]]
~~~

~~~sh
scarp verify examples/typed_maps.srp
scarp exec examples/typed_maps.srp
~~~

## Map updates, removal and lookup

[persistent_maps.srp](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/persistent_maps.srp) · [tagged stdout](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/persistent_maps.stdout)

~~~scarp
// Persistent sorted maps: all updates return new immutable snapshots.
pure funcra replace_alpha(values: map<string, integer>) -> map<string, integer> {
    return map_set(values, "alpha", 12);
}

bind base = [map: "beta": 2, "alpha": 1];
bind changed = map_set(base, "alpha", 10);
bind added = map_set(changed, "gamma", 3);
bind removed = map_remove(added, "beta");
print("Base", base);
print("Updated", added);
print("Removed", removed);
print("Lookup", map_get_or(removed, "alpha", 0), map_get_or(removed, "absent", -1));
print("Contains", map_contains(removed, "alpha"), map_contains(removed, "beta"));
print("Lengths", map_len(base), map_len(removed));
bind same = map_remove(removed, "unknown");
print(same == removed);
print("Pure", replace_alpha(base));
~~~

~~~text
Base [map: "alpha": 1, "beta": 2]
Updated [map: "alpha": 10, "beta": 2, "gamma": 3]
Removed [map: "alpha": 10, "gamma": 3]
Lookup 10 -1
Contains true false
Lengths 2 2
true
Pure [map: "alpha": 12, "beta": 2]
~~~

~~~sh
scarp verify examples/persistent_maps.srp
scarp exec examples/persistent_maps.srp
~~~

## Types and limits

`list<record Task>` holds an immutable variable-length list of typed records; `map<string, integer>` can map titles to indices. `map_get_or` requires an explicit fallback for a missing key; `map_contains`, `map_len`, `list_len` and `list_set` are checked collection operations. Removal copies only retained entries into a new snapshot. These are bounded interpreter values, not a storage engine or mutable database.

All code and stdout are copied from the immutable published tag. Do not backport these exact list/map capabilities to the older alpha.11 release.

[Official release](/releases/v0.0.6-alpha.12) · [Complete task-board project](/tutorials/task-board-alpha12).
