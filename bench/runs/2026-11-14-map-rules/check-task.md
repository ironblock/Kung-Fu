# Task

`src` holds the source of Babylon Lite, a rendering library, at its release 1.39.0. `ley.toml` is a ledger someone wrote about one directory of it, `src/camera`. Each row has a command, under `run`, and a sentence that says what the command shows, under `shows`. A program has already checked that each command gives the number of results its row says. Nobody has checked the sentences.

Check every sentence against the code. For each row, run its command, read what it prints, and read as much of the code around it as the sentence needs. Then give the row one of four marks:

- `shown`: everything the sentence says can be seen in what the command prints, with nothing more read.
- `true`: the sentence says more than the command prints, and the code shows that what it says is so.
- `false`: the code shows that something the sentence says is not so.
- `unclear`: you could not settle it.

Be hard on the sentences. A sentence that is nearly right is `false`, and you say which part is wrong. Do not give `true` because a sentence sounds likely: give it when you have read the lines that make it so.

Write your marks to `marks.tsv`, in the directory that holds `src`: one line for each row, in the ledger's order, with three fields set apart by tabs: the row's `name`, the mark, and one line that says where in the code you saw it, or what is wrong.

Change nothing under `src`, and do not change `ley.toml`.
