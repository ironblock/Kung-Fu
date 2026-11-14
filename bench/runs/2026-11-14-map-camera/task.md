# Task

`src` holds the source of Babylon Lite, a rendering library, at its release 1.39.0: about 1,340 TypeScript files. Write a ledger for one directory of it, `src/camera`.

The reader of your ledger has never seen this library. They are about to use what is in `src/camera`, or to change it. They will read your ledger before they open a file.

**A ledger is a file of rows that `ley` can check.** Learn what a row is from `ley --help`, `ley rules`, `ley shapes` and `ley help check`. Learn `ast-grep` from its own `--help`. Both are in `bin`.

**What makes a ledger worth reading.** One command already lists everything the directory exports. A ledger that repeats that list tells the reader nothing. It is worth reading for what the list does not say: where a thing is really defined, which things belong together, what the directory needs from the rest of `src`, what has to happen in what order, what is easy to get wrong. Put each such thing in a row whose command shows it.

**The rules of this job.**

- Write the ledger to `ley.toml`, in the directory that holds `src`.
- `ley check`, run in that directory, must pass every row.
- No more than 40 rows. Fewer is better when nothing is lost.
- The rows are about `src/camera` and what it touches. You may read all of `src`.
- Change nothing under `src`.
