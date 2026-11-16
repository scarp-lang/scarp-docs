# पूरा Scarp task-board project — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

यह प्रकाशित alpha.12 के compiler repository से लिया गया **चलने योग्य multi-file project** है। इसमें records, variants, `option`, `result`, immutable lists, maps, checked actions और pure state transitions का उपयोग किया गया है। यह desktop UI नहीं बनाता और कोई network/database storage नहीं करता।

## Project files

~~~text
task-board/
  scarp.project
  src/
    board.srp
    main.srp
  tests/
    capacity.srp
    lifecycle.srp
    validation.srp
  stdout.txt
~~~

ये सभी files [प्रकाशित tagged compiler project](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/scarp.project) में उपलब्ध हैं। नीचे दिए गए full source को उसी structure में रखें। `scarp.project` Scarp का अपना manifest format है, TOML नहीं।

## `scarp.project`

~~~text
project "task-board" {
    version: "0.1.0"
    entry: "src/main.srp"
    type: "application"
    dependencies {}
}
~~~

## `src/board.srp`

~~~scarp
// A bounded task store with an exact-title index and pure transitions.
pub record Task {
    title: string,
    done: boolean,
}

pub record Board {
    tasks: list<record Task>,
    positions: map<string, integer>,
}

pub variant Action {
    Add(option<string>),
    Complete(string),
}

pub pure funcra empty() -> record Board {
    return new Board {
        tasks: [list: <record Task>],
        positions: [map: <string, integer>],
    };
}

pub pure funcra find(board: record Board, title: string) -> option<record Task> {
    if not map_contains(board->positions, title) {
        return new option<record Task>::None();
    }
    bind index = map_get_or(board->positions, title, 0);
    return new option<record Task>::Some(board->tasks[index]);
}

pure funcra accept_title(input: option<string>) -> result<string, string> {
    match on input {
        case None { return new result<string, string>::Err("title missing"); }
        case Some(title) {
            if title == "" {
                return new result<string, string>::Err("title empty");
            }
            return new result<string, string>::Ok(title);
        }
    }
}

pub pure funcra apply(board: record Board, action: variant Action) -> result<record Board, string> {
    match on action {
        case Add(input) {
            bind title = accept_title(input)?;
            if map_contains(board->positions, title) {
                return new result<record Board, string>::Err("task already exists");
            }
            bind index = list_len(board->tasks);
            if index >= 128 {
                return new result<record Board, string>::Err("board is full");
            }
            return new result<record Board, string>::Ok(new Board {
                tasks: list_push(board->tasks, new Task { title: title, done: false }),
                positions: map_set(board->positions, title, index),
            });
        }
        case Complete(title) {
            match on find(board, title) {
                case None {
                    return new result<record Board, string>::Err("task not found");
                }
                case Some(task) {
                    if task->done {
                        return new result<record Board, string>::Ok(board);
                    }
                    bind index = map_get_or(board->positions, title, 0);
                    return new result<record Board, string>::Ok(new Board {
                        tasks: list_set(board->tasks, index, new Task { title: title, done: true }),
                        positions: board->positions,
                    });
                }
            }
        }
    }
}
~~~

`Board` में typed task list और title-to-index map है। `apply` नया board snapshot या स्पष्ट `Err` देता है, मूल board को नहीं बदलता। यहाँ अधिकतम **128 tasks** की सीमा है और duplicate title स्वीकार नहीं होता।

## `src/main.srp`

~~~scarp
import "board.srp" as tasks;

bind initial = tasks.empty();
var board = initial;
match on tasks.apply(board, new tasks.Action::Add(new option<string>::Some("Review PR"))) {
    case Ok(next) { board = next; print("Created Review PR"); }
    case Err(message) { print(message); }
}
match on tasks.apply(board, new tasks.Action::Complete("Review PR")) {
    case Ok(next) { board = next; }
    case Err(message) { print(message); }
}
match on tasks.find(board, "Review PR") {
    case Some(task) { print(task->title, task->done); }
    case None { print("Task missing"); }
}
match on tasks.apply(board, new tasks.Action::Complete("Missing")) {
    case Ok(_) { print("Unexpected success"); }
    case Err(message) { print("Rejected", message); }
}
print("Original size", list_len(initial->tasks));
~~~

## आधिकारिक expected stdout

~~~text
Created Review PR
Review PR true
Rejected task not found
Original size 0
~~~

## प्रकाशित परीक्षण

इस project के तीन अलग executable test files हैं:

- [`tests/capacity.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/capacity.srp) — 128 tasks की सीमा
- [`tests/lifecycle.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/lifecycle.srp) — Unicode title और snapshots
- [`tests/validation.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/validation.srp) — invalid और duplicate titles

~~~sh
scarp verify examples/projects/task-board
scarp launch examples/projects/task-board
scarp test --require-tests examples/projects/task-board
~~~

ऊपर के commands को tagged compiler checkout के root से चलाएँ। `verify` source की static जाँच करता है, `launch` entrypoint को interpreter में चलाता है, और `test --require-tests` suite चलाते हुए test न मिलने पर विफल होता है। `stdout.txt` सिर्फ application output है, test runner का JSON report नहीं।

## महत्वपूर्ण सीमाएँ

Scarp की source-level data structures का उपयोग आगे native UI host बनाने में किया जा सकता है, लेकिन यह release अपने आप windows, visual widgets, event loop या general-purpose UI toolkit नहीं देता। Experimental native backend का feature subset अलग है।

[रिलीज़ और डाउनलोड](/hi/releases/v0.0.6-alpha.12) · [Records और variants](/hi/language/records-variants-alpha12) · [Lists और maps](/hi/language/lists-maps-alpha12).
