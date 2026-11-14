# Task

`src` holds the source of Babylon Lite, a rendering library, at its release 1.39.0: about 1,340 TypeScript files. Write a ledger for one directory of it, `src/light`.

The reader of your ledger has never seen this library. They are about to use what is in `src/light`, or to change it. They will read your ledger before they open a file.

**A ledger is a file of rows that `ley` can check.** Learn what a row is from `ley --help`, `ley rules`, `ley shapes` and `ley help check`. Learn `ast-grep` from its own `--help`. Both are in `bin`.

**A row is a test.** Think of each row as a unit test of how the code is built. Its sentence makes one claim. Its command is the test: someone who runs the command and reads only what it prints, with no file open, must be able to see that the claim is so. `ley check` then keeps the claim honest as the code changes: the row should fail on the day the claim stops being so, and on no other day.

**What a ledger is worth reading for.** One command already lists everything the directory exports, so a row that repeats that list tells the reader nothing. Write about what the list does not say: which things belong together, what the directory needs from the rest of `src`, what has to happen in what order, what is easy to get wrong.

**What makes a row a good test.**

1. **Prove the whole claim.** A row's name is a label, and what the name and the sentence say together is the claim. If what the command prints shows only a part of it, cut the claim down to that part, or add rows until the parts together show it. Several rows about one thing are welcome: give them names that begin alike. To show that one thing happens before another, for instance, one row can show where the first is put at the head of a queue, a second where the other is put at its tail, and a third that the queue is run from head to tail.
2. **Match the code, not the word.** When a claim is about a call, an assignment, an import, a declaration, or what is inside a function, match that piece of code with `ast-grep run` or `ast-grep scan`. They see code and pass over comments and strings. Search for text with `rg` only when the claim is about text. Leave open what the claim does not turn on: write `$X` for the name of a variable unless that name is the point. Pin what it does turn on: when the claim says where a thing is, such as inside which function, or which one it is, such as which argument or which index, the pattern must hold that part, so that changing it changes the count.
3. **Show that there is no other.** A claim that says only, every, never or all needs a row with a count of 0: a search for what would break the claim, which finds nothing. Before you trust such a row, think of the other ways the same thing can be written: another path to the same file or an alias for it, a field given in an object and not set by an assignment, another variable that holds the same thing. The search must cover them. Run it once made wider by a step, to see that it can find something at all.
4. **A count belongs to the claim.** Give a count when the number is what the claim says: one definition, none outside, these three kinds. A count of how many files happen to use a thing changes whenever anyone adds a file. It tests nothing, so leave such a row out.
5. **No row for what a listing gives.** A row that lists files, or shows only that a thing exists where its name says it is, tests nothing a reader needs. Leave it out, unless where the thing lives is itself the surprise.
6. **Say less.** A claim that is smaller and shown is worth more than one that is larger and not. What you know and cannot show with these tools stays out of the ledger.
7. **Break it yourself.** For each row, find the smallest change to the code that would make its claim false, and make sure the command would then give another count. You may copy a file into a directory of your own beside `src` and change the copy to try it. A row that would still pass is testing something else: mend the pattern, or cut the claim down to what the row does test.

**The rules of this job.**

- Write the ledger to `ley.toml`, in the directory that holds `src`.
- `ley check`, run in that directory, must pass every row.
- No more than 40 rows. Fewer is better when nothing is lost.
- The rows are about `src/light` and what it touches. You may read all of `src`.
- Change nothing under `src`.
