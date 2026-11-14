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

## What came, 2026-11-14

All six mappers finished. Each ledger is in `ledgers/`, each mapper's calls of the two tools in `calls/`, and what each reported in `reports.md`. `read.py` made every count below from the call logs and the harness's records, and `read.json` holds what it printed. No source file was changed by any mapper.

**Every row holds.** The six ledgers have 204 rows. `ley check` passes all of them here, and passes all of them again in the library's own repository at the pinned release.

**What it cost.** Far less than the guess of 50,000.

| mapper | rows | messages | output tokens | read and written, first message to last |
|---|---|---|---|---|
| opus-1 | 38 | 26 | 14,855 | 98,583 tokens |
| opus-2 | 39 | 28 | 18,837 | 92,387 |
| opus-3 | 36 | 23 | 14,679 | 78,075 |
| sonnet-1 | 28 | 15 | 8,816 | 40,942 |
| sonnet-2 | 30 | 10 | 6,426 | 33,138 |
| sonnet-3 | 33 | 14 | 9,648 | 42,964 |

By the harness's own notices a Sonnet mapper took about a minute and an Opus mapper four to five.

**Almost no row runs `ast-grep`.** 199 rows of 204 run `rg`. Five run `ast-grep run`, one in each of five ledgers. None runs `ast-grep outline`. In their own looking the mappers used `grep`, `sed`, `head`, `cat` and `rg`. One mapper called `ast-grep`, twice. The task said that a list of what the directory exports is worth no row, and such a list is what `outline` gives. So this does not show that `outline` is of no use to a map. It shows that for what this task asked, a search for text was enough for six mappers of two models.

**What made them stumble, from the records.** No call of either tool ended badly but `ley check`, which said no two to four times to each mapper before it said yes.

| what `ley check` said | what it is | opus-1 | opus-2 | opus-3 | sonnet-1 | sonnet-2 | sonnet-3 |
|---|---|---|---|---|---|---|---|
| differs | the count in the row is not what the command shows | 2 | 1 | 4 | 9 | 37 | 15 |
| restates | `shows` repeats something the command prints, such as the path `src/camera` | 2 | 2 | 0 | 3 | 2 | 0 |
| not checked | a `$` or a `!` inside double quotes, or a glob that takes files in, as `-g *.ts` | 0 | 1 | 0 | 0 | 1 | 8 |

- **A wrong count came back in all six.** Each mapper wrote counts before it ran the commands. One wrote 0 in every row and let `ley check` tell it the numbers.
- **`restates` came back in two of three sessions of each model.** A third Opus mapper names it in its report, and its record does not show it.
- **Quoting and globs came back in two of three Sonnet sessions and one of three Opus.**
- **One stumble is known from a report alone:** a glob written `!camera/**` left nothing out, and only the wrong count gave it away.
- **Every mapper read the same four help texts of `ley`:** `--help`, `rules`, `shapes` and `help check`, 5,968 characters in all. One read `ast-grep run --help` besides, 9,734 characters.

**What the ledgers hold.** Between 28 and 39 rows, and between 6,844 and 10,973 characters. `exports.js` lists the 69 names the directory exports, with the TypeScript compiler's own parser. The commands of one ledger name 6 to 23 of them, and 31 are named by no ledger. What four or more of the six ledgers point at is mostly not exported at all: `_cameraChangeKey`, `_projRev`, `_beforeRender`, `_orthoProjector`, `_installOrthographicProjector`, `_useFloatingOrigin`, `_rightHanded`, `_arcRotateKeyboardFactory`, `_clampToLimits`, `_createFreeCamera`. Six mappers who could not see each other went to the same dozen places, and a list of exports shows none of them.

**A fault in every ledger, and in the task.** Many a `shows` says more than its command shows. One row says a flight's promise "has no reject path and resolves early when interrupted", and its command finds the line where the promise is made. `ley check` holds the row to its count and not to its sentence. So such a row passes, and what it claims is one mapper's reading of the code. This repository has a rule for that, and these rows break it: write a fact no wider than its check. The task asked for each thing "in a row whose command shows it". `ley` has a second kind of row, for what someone said and when, and no mapper wrote one. Whether the claims are true has not been checked: nobody here has read the library's code. That several ledgers make the same claim is a sign and not a proof.

**A week later.** The library's head on 2026-11-13 is 17 commits past the pinned release. There 199 rows of the 204 still hold. The five that do not are one row in each of five ledgers, and they are one fact: how many files outside the directory take in its base file. That count went up by one.

**What the mappers said was hard** agrees with the records where the records can say: the rule against restating, the counts, the glob. They also say, five of six, that what matters most about the directory lies outside it or between its parts.

## What this suggests `ley` needs

This is a reading, by the session that ran the mappers.

- **A way to see what a row's command shows now.** All six learned their counts by failing `ley check`. `LATER.md` parks "a command that runs a row" until copying is seen to cost more than it teaches.
- **Something for a sentence that is wider than its command.** A check of the wording cannot do it. A row that pairs what someone says with the command that shows where may.
- **Globs.** Two mappers wanted a glob that takes files in, which `LATER.md` parks. A glob that leaves nothing out could be told.
- **A ledger for a place that is not ours works as it stands,** when the file sits beside the source and is named with `--ledger`.

## Still to come

- **The maintainer reads the ledgers,** and says whether they hold what a list of exports does not.
- **`ley since` on each ledger,** over the library's history, and the trial of it on one change whose date was known. Both are added below when they are done.
