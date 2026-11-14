# Task

`src` holds the source of Babylon Lite, a rendering library, at its release 1.39.0. `ley.toml` is a ledger someone wrote about one directory of it. Each row is meant as a test of the code's structure. The sentence under `shows` is a claim. The command under `run` is the test: it passes while the command gives the number of results the row says, which is one when the row gives no `count`. `ley check` runs every row.

You find out how good these tests are, in two parts.

**Part one: faults, for every row.** Give each row every fault below that it has, or `none`.

- `number`: its count is a tally that would change for reasons that have nothing to do with what the sentence claims, such as how many files happen to use a thing.
- `tautology`: its command searches for the very words of the code that the sentence describes, so it shows that the text is there and not that the claim is so.
- `list`: it lists things and claims nothing about them that could be wrong.
- `exists`: it shows only that a thing exists where its name says it is.

**Part two: break the claim, for every third row,** beginning with the first: rows 1, 4, 7 and so on. For each of them:

1. Find the smallest change to the code under `src` that makes the row's sentence false. It must be a change a programmer could really make, by mistake or on purpose, and the code must still be able to run after it. If the sentence is false already, write `already false` and go to the next. If you can find no such change, write `no change found`.
2. Make the change, and run `ley check`.
3. Write down whether this row failed, which is `caught`, or still passed, which is `missed`. Write down how many other rows failed.
4. Put the code back. `src.orig` is an untouched copy: copy back each file you changed. `diff -rq src src.orig` must print nothing before you go to the next row.

Write `breaks.tsv`, in the directory that holds `src`: one line for each row, in the ledger's order, with five fields set apart by tabs.

1. The row's `name`.
2. Its faults, with commas between them, or `none`.
3. For a row of part two, the change you made, in one line. For any other row, `-`.
4. For a row of part two, `caught`, `missed`, `already false` or `no change found`. For any other row, `-`.
5. For a row of part two that you broke, the number of other rows that failed. For any other row, `-`.

Do not change `ley.toml` or anything under `src.orig`. When you are done, `src` must be the same as `src.orig`.
