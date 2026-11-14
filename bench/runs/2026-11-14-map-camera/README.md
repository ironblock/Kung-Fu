# 2026-11-14-map-camera: six sessions each write a ledger for one directory of a real library

This was written before the run. It is a first look and not a study: it has no arms, no rule that compares, and nothing it must reach.

## Why

Four studies asked whether a subject can write one command that lists what a task names. The makers' own tests showed on 2026-11-14 that `outline` has about five behaviours that such a task can turn on. A real job meets whatever it meets. So the maintainer and the planning session proposed to make a real job the instrument: map a library into a ledger that `ley` can check, with `ast-grep` in hand, and read from the record what had to be learned on the way. The job gives three things at once: a ledger, a list of what the tools made hard, and material for a later test with a smaller model. The maintainer said go on 2026-11-14.

No ledger for a place other than Ley Lines' own repository exists. Four things parked in that repository's `LATER.md` wait for one.

## The library, and the part of it

- **Babylon Lite,** a rendering library, public, under the Apache licence 2.0. Its first release on npm was on 2026-06-04, and it has had 53 since, seven to eleven a month. The maintainer uses it, and named it as the target. It is recent enough that a model may not know it, and it is built otherwise than the older library it comes from: its core lists 2,688 exported functions and 6 classes.
- **The release:** the tag `npm-lite-v1.39.0`, commit `2dddc888f6695e433ab29ae5918bee221375d86f`, of 2026-11-07.
- **What a mapper is handed:** `packages/babylon-lite/src` of that commit and nothing else of the repository: 1,346 files, 1,340 of them TypeScript, 12 MB. The library's own documents, its instructions for agents, its tests and its demos are not there. They are left out by not being copied, and no request speaks of them.
- **The directory to map:** `src/camera`, 17 files and 3,731 lines. `ast-grep outline --items exports` lists 70 items in it. The maintainer chose it.

## The mappers

Six fresh subagents of the kind `bench-subject`, which has a shell and its files and no network tool: three on an Opus model and three on a Sonnet model. The maintainer has room for both this week. Three of one model show which stumbles come back. A second model shows which belong to the job and which to the mapper. Each is sent `request.txt` with its own directory put in, and reads `task.md` there. None is given a guide to either tool: each has the tools' own help.

`setup.sh` makes a mapper's directory. `bin/ast-grep` and `bin/ley` are `wrapper.py`: each call is written down outside the directory, with who started it, how it ended and how much it printed.

## What is read from the records, said now

- **Each call of a tool that ended badly,** by what the tool complained of. For `ast-grep run`, an end with 1 means nothing matched, and is counted apart.
- **Each `ley check` that did not pass every row,** with what `ley` said of the rows.
- **Each call for help,** and how much came back.
- **What a mapper read:** how many files of `src`, and how many characters.
- **A stumble comes back** when it shows in two of the three sessions of a model.
- **Each ledger:** how many rows, of which kinds, and whether `ley check` passes it when run here.
- **The ledgers side by side:** which names two or more of them hold.
- **How much of the directory a ledger speaks of:** the exported names of `src/camera`, listed by a program that is not `ast-grep`, and how many of them a ledger's rows name. This is told and is not a mark. A ledger that names all 70 and says nothing else has failed at what the task asks.
- **What each mapper says was hard,** set beside what its record shows.

## Who judges the ledgers

The maintainer, by reading them: does a ledger hold anything that listing the directory does not already say? The planning session asked for that, and it is right. No program here can tell a true row from a useful one.

## What it is for

A list of what `ley` and `ast-grep` made hard, counted from records, for the next change to `ley` and for the first facts of a guide. And a first ledger for a place that is not ours, to try `ley since` on.

## What it should cost

Not known. A guess with nothing behind it: 50,000 output tokens a mapper.
