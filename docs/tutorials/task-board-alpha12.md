# A complete typed task-board project — alpha.12

<!-- scarp-current-release: v0.0.6-alpha.12 -->
<!-- scarp-cli-release: v0.0.6-alpha.12 -->
<!-- scarp-current-source: a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d -->

This is a **runnable, published multi-file project** from the exact alpha.12 compiler tag. It combines records, variants, Option, Result, immutable lists, maps, checked actions and pure state transitions. It is not a graphical UI, network service or database.

## Project layout

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

The exact files live in the [published tagged compiler project](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/scarp.project). Reproduce the same directory structure. `scarp.project` is Scarp's own manifest format, not TOML.

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

`Board` holds a typed task list and a title-to-index map. The pure `apply` function returns a new Board snapshot or a checked `Err`, without mutating the original. This project caps the board at **128 tasks** and rejects duplicate titles.

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

## Exact expected application stdout

~~~text
Created Review PR
Review PR true
Rejected task not found
Original size 0
~~~

## Published project tests

This project supplies three independently executable Scarp test files:

- [`tests/capacity.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/capacity.srp) — 128-task capacity and overflow
- [`tests/lifecycle.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/lifecycle.srp) — Unicode title, completion and immutable history
- [`tests/validation.srp`](https://github.com/scarp-lang/scarp/blob/a1f9c2fc1c6bc8f3e04878d30d658bb38fab441d/examples/projects/task-board/tests/validation.srp) — missing, empty and duplicate titles

~~~sh
scarp verify examples/projects/task-board
scarp launch examples/projects/task-board
scarp test --require-tests examples/projects/task-board
~~~

Run these commands from the tagged compiler checkout root. `verify` checks source statically, `launch` runs the entrypoint through the interpreter, and `test --require-tests` actually executes tests and refuses an empty suite. `stdout.txt` is application output, not the test runner's JSON report.

## What this project does not claim

These typed data structures could support a future UI host, but the alpha.12 release does not ship native windows, widgets, a graphical event loop or a general-purpose UI toolkit. Experimental native backend support remains narrower than interpreter features.

[Release and downloads](/releases/v0.0.6-alpha.12) · [Records and variants](/language/records-variants-alpha12) · [Lists and maps](/language/lists-maps-alpha12).
