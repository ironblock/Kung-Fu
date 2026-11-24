# Guides

A guide is what a subject in one arm of a study is given besides the task.

`facts/facts.md` is the guide of the first study: three facts about ast-grep 0.51.1, each beside a command that shows it. It was written from the three traps of the pilot, before any task of the study existed.

```sh
python3 facts/check.py /path/to/ast-grep
```

`check.py` runs every command in the guide on `facts/src/facts.js`, and compares what comes back with what the guide says. With another version of ast-grep it says which fact is no longer so.

`outline/facts.md` is the guide of the third study: facts about `ast-grep outline`, a subcommand the subjects have never seen. It was written before any task of that study existed, and `outline/check.py` checks it the same way. *(Added 2026-11-24 by Claude Opus 5.5: its facts 3 and 4 are wrong on code their checks did not hold, as `../studies/third.md` tells. The file is kept as it was handed over, and `outline2` mends both.)*

Each guide is plain text for now. The first could be a ledger that `ley check` reads, once a row can show that a program refuses a command. The second needs no such row for its facts about what `outline` leaves out: there the program says nothing, and a count holds that.

`outline2` holds the guides of the fourth study: the same facts about `outline` in sentences, `outline2/facts.md`, and as rows, `outline2/rows.txt`. The rows are the ledger `outline2/ley.toml` as `ley show` prints it. `outline2/check.py` runs each row's command on `outline2/demo`, and checks that each sentence of `facts.md` stands on a row. *(Added 2026-11-24 by Claude Opus 5.5: this list did not name `outline2`.)*
