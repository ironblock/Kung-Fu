# Where does a small model stand on the camera tasks?

Written 2026-11-16 by Claude Fable 5.2, before any try of this run.

## Why

Every number in this repository so far is a Claude model's. The project is about a small model that its user hosts: Qwen 3.8 at 27 billion parameters, in about half its context. The maintainer also has a deployment of Qwen 3.8 Flash Next that is more often free. I know nothing of how either does on these tasks, and this run is there to find out before any text is compared with another on them.

Three earlier runs had no room to show a gain, because no arm with nothing in hand was run first. This is that arm for a new subject, with one arm beside it that can pass.

## What is run

One message and one reply a try, through `bench/small.py`, as `bench/SMALL-MODEL.md` says. The 23 camera tasks that the check's surroundings do not spoil (all of `bench/sets/camera` but C1, C2 and G4). Three tries a task.

| Arm | Files in the message | About how large |
|---|---|---|
| `names-27b`, `names-flash` | the bare declarations of the camera code | 4,400 tokens by the estimate |
| `union-27b`, `union-flash` | the bare declarations and the merged notes of six writers | 8,900 tokens |

The arms ending in `27b` are for the 27B model and those ending in `flash` for Flash Next. The texts are the union run's, byte for byte. Give `--label` the model's name, and `--temperature` and `--max-tokens` on the command line. If the server answers the same message the same way every time, three tries are one try: say so, and one try a task is then enough.

For a Haiku model, in this same form, these two arms gave 36 and 63 of 69 (`bench/runs/2026-11-16-one-shot`).

## The order

1. **One try a task of `names`, first.** 23 requests. It shows what a reply looks like from this server, where its reasoning goes, how long a try takes, and whether replies are cut off. Read `box.py tally` before going on.
2. The rest of `names`, then `union`.
3. Grade. A reader reads every answer and sorts every failure.

## The rules, fixed now

1. **The form comes first.** If more than one reply in five is cut off by its length limit, raise `--max-tokens` and launch those again (`--again-cut-off`) before anything is read. If more than one reply in five that was not cut off misses the reply's form (no file block, a path that is refused, a fence left open), the run is measuring the form, and I stop and say so.
2. **A task has room for this model** when `names` passes at most one of its three tries.
3. **The tasks are too easy for it** when `names` passes 55 or more of 69. **It does not use the notes in this form** when `union` passes fewer than six tries more than `names`. In either case no further arm is run on these tasks for that model until the answers have been read.
4. Otherwise the tasks with room, and the gap between the two arms, say how many tries and which arms the next run needs. That run is written down then.
5. Counts are also given by the kind of thing a task turns on, as judges labelled them: a step or a setting that silently does nothing; a number, a formula or a sign; when a thing takes effect; other.

No comparison between the two models is made by a rule. They are two subjects, each read on its own.

## My guesses

I have no ground for these, and say so. They are here so that I can be wrong in writing.

1. `names`: 15 to 35 of 69 for either model.
2. `union`: 35 to 55 of 69. The notes help, and less than they helped the Haiku subject.
3. At least nine replies in ten keep to the reply's form.
4. The first trouble is room: a model that reasons is cut off before its file more than once in the first 23 tries.

## What each outcome would change

- **Room, and `union` well above `names`.** Then the work done so far carries over in kind, and the questions already asked of the Haiku subject can be asked of this one: how short a list, in what order, from how many writers.
- **`names` already high.** Then these tasks are too easy for it as well, and harder ones are needed before anything else.
- **`union` no higher than `names`.** Then this model does not take a fact from a list of notes as the Haiku subject does. That would be the most useful thing to learn early: the form of the text, not its content, would be the first thing to change. Recipes are the next form to try.
- **Most replies miss the form or are cut off.** Then the runner's one-message form is the obstacle, and the model should be run through the maintainer's own harness.

## What these tasks do not cover

The maintainer asked whether the tasks are varied enough to start. They are enough to start and not enough to end on. What is missing:

- **Every task is one function or one question, with the right part of the library handed over.** None makes the subject find the part. A real job does, and the declarations of the whole library are far too large to hand over.
- **None is a long job.** The one record of a small model at work shows it losing its turns in the middle of one.
- **One library, which has a well-known older sibling.**
- **The tasks, the notes and the checks were all written by Claude models.** A small model of another family is the first reader that does not share their habits.
- **Some questions can be passed by a guess**, and three tasks are left out because their checks fail answers that are right in a browser.
- **23 tasks, three tries each.** A difference of a few tries is nothing.

This run does not need more variety, because it compares nothing. What comes after it will.

## What came, 2026-11-17

Written by Claude Fable 5.2. The tries were run on the maintainer's machine by another session; `LAUNCH.md` says how, and holds the maintainer's rulings with their times. I fetched its branch, ran the kit's scan over every file, recounted every number below from the kept grades and records, and had every failure read and sorted.

### The subjects, as they were run

Qwen 3.8 27B at 3.00 bits a weight, and Qwen 3.8 Flash Next at 2.05 bits a weight. Both are builds in the EXL3 format, and these results are theirs. This line first called them "heavily quantised builds". That did not follow from the two numbers, and the correction of 2026-11-17 below says what the numbers do tell. Thinking on, the model card's sampling (temperature 1.0), a context of 131,072 tokens, and a reply allowed 120,000 of them. Each server gave the reasoning in its own field, so every try's reasoning is kept.

### The table

276 tries were kept. Six replies reached the reply's limit. The maintainer ruled, during the run, that a reply that runs in a loop counts as a failure; five of the six are loops by `LAUNCH.md`'s account. `box.py tally` leaves a cut-off try out, so each count is given both ways.

| Arm | Passed, of 69 | Cut off | As `tally` prints it |
|---|---|---|---|
| `names-27b` | 30 | 1 | 30 of 68 |
| `union-27b` | 51 | 1 | 51 of 68 |
| `names-flash` | 43 | 1 | 43 of 68 |
| `union-flash` | 59 | 3 | 59 of 66 |

A Haiku model, in the same form, passed 36 and 63.

The notes arm passed more tries than the bare arm on 14 tasks and fewer on 3 for the 27B (A4, G1, G3), and more on 10 and fewer on 3 for Flash Next (A3, B5, G3). No rule is asked whether that is shown: this run was written to compare nothing.

### The rules

1. **The form held.** 6 replies of 276 were cut off. Of the 270 that were not, 5 gave no file: three ended in a tool call, one put its `FILE:` line inside the fence, one stopped after a short loop.
2. **Tasks with room.** The 27B: twelve (A4, A5, B2, C3, C4, F1, F2, F5, G2, G5, K1, P1). On them it passed 3 of 36 bare and 23 of 36 with the notes. Flash Next: nine (A5, C3, C4, C5, F5, G1, G2, G5, P1); 3 of 27 and 20 of 27.
3. **Not too easy, and both take facts from the notes.** 30 and 43 are under 55. The notes add 21 and 16 tries, where the rule asked for six.
5. **By the kind of thing a task turns on**, passes bare and with the notes:

| Kind | Tasks | 27B | Flash Next |
|---|---|---|---|
| a step or a setting that silently does nothing | 9 | 14 → 21 of 27 | 20 → 25 of 27 |
| a number, a formula, a sign, a default or a key binding | 8 | 4 → 15 of 24 | 10 → 19 of 24 |
| when a thing takes effect | 3 | 5 → 8 of 9 | 4 → 9 of 9 |
| other | 3 | 7 → 7 of 9 | 9 → 6 of 9 |

By what the merged list holds for the task, as judges who knew no result had marked it (`bench/runs/2026-11-15-camera-notes/coverage`):

| The list holds | Tasks | 27B | Flash Next |
|---|---|---|---|
| all of what the task needs | 14 | 19 → 37 of 42 | 32 → 38 of 42 |
| part of it | 6 | 6 → 11 of 18 | 5 → 13 of 18 |
| none of it | 3 | 5 → 3 of 9 | 6 → 8 of 9 |

### Whose the failures were

A reader agent for each task read every answer and looked into the reasoning of each failed try. A script checked that each of the 93 failures has one sort and no passed try has any. I read the ten that were cut off, ended in a tool call, or were sorted as the test's or as not known, and 16 of the other 83, drawn by a seeded command. I re-sorted one (`union-27b/C3/1`, a tool call, to agree with the other two).

| Arm | Failures | The text's | The subject's | The test's | Not known |
|---|---|---|---|---|---|
| `names-27b` | 39 | 36 | 3 | 0 | 0 |
| `union-27b` | 18 | 10 | 4 | 4 | 0 |
| `names-flash` | 26 | 24 | 1 | 0 | 1 |
| `union-flash` | 10 | 5 | 5 | 0 | 0 |

### What the reasoning shows

- **These models take a fact from a note and say so.** A reply's reasoning names the notes it went by ("I wrote the answer based on notes 1 and 22").
- **Where the list holds all a task needs, they pass about nine times in ten**: 37 and 38 of 42. The nine misses are three runaway replies, three on C4, one tool call, one file lost to its layout, and one reply that saw the note and set it aside.
- **Two notes that read as a contradiction.** On C4 one note says a turn goes the shortest way round, and another says the end value is "unwrapped: a goal of 2*PI from alpha 0 ends on the first frame at 2*PI". Both are true. Three replies called them contradictory, or hard, and went by the second. The Haiku subject passed this task three times of three with the same list.
- **A note too wide did harm.** On G1 the 27B passed 2 of 3 bare, by wrapping the camera's fields to be safe. With the notes it passed none: all three replies found note 37 ("a change to `GeospatialCamera.limits` applies at the next ... write"), trusted it, and assigned a new limits object, which the camera ignores. The same kind of note misled the Haiku subject's arm with unchecked notes in an earlier run.
- **A note with no stated scope.** On C3 every reply that used note 9 took "normalised" to cover the Alt keys too. No try of any arm passed C3.
- **Bare, the 27B lacks meanings that the Haiku subject brought with it.** On B2 it doubled `angularSensibility` to turn faster, three times of three; the Haiku subject halved it "as in Babylon.js". That is where much of the 27B's room comes from.
- **Runaway replies sit on a few tasks**: A3 three times, B5 and G1 once each, and a short loop on B6. The reasoning lists one imagined requirement after another ("Could maybe if tests check that code doesn't call ... no.") and does not decide. Flash Next ran away three times with the notes and not once in a loop without them.
- **"Read them first" made the 27B reach for a tool.** Three replies of `union-27b` are only a sentence such as "I'll read the two files you mentioned first". One reasoning says: "they asked me to read them first". The request was written for a subject in a box with file tools.
- **The file lost to its layout was not a right answer.** `union-27b/F2/3` put its `FILE:` line inside the fence, so nothing was written. Read from inside the fence, its file still fails two of the check's five cases.

### What it cost

Replies were long, and shorter with the notes: a mean of 23,232 output tokens bare and 17,214 with the notes for the 27B, and 45,487 and 39,607 for Flash Next. The 27B's 138 tries took 9.5 hours of generation, 4.2 minutes a try. Flash Next's took 50 hours, 21.8 minutes a try. Corrected 2026-11-17: the two times cannot be set side by side. By `LAUNCH.md` the 27B was sent one request at a time, with a draft model, and Flash Next four at a time with none, so a request of Flash Next's shared its server with three others. On the clock the two took about 9.6 and 12.6 hours. In output tokens Flash Next spent 2.1 times what the 27B spent, and tokens do not turn on how many requests ran at once.

No reply of the 27B's over 60,000 tokens passed (three such replies, 0.8 hours). Flash Next's long replies do pass: 9 of the 14 over 80,000 tokens.

### Each guess beside what came

| Guess | What came | Held |
|---|---|---|
| `names`: 15 to 35 of 69 for either model | 30 and 43 | for the 27B |
| `union`: 35 to 55; the notes help, and less than they helped the Haiku subject | 51 and 59; +21 and +16 against +27 | for the 27B; the second half for both |
| At least nine replies in ten keep the form | 265 of 270 not cut off | yes |
| A model that reasons is cut off before its file more than once in the first 23 tries | no: the maintainer gave the reply nearly the whole context | no |

### What I did not read

No reasoning whole: the 276 tries hold some eight million tokens of it. The reader agents read each failed try's last 3,000 characters and searched it for the thing its task turns on. I read 26 of the 93 failures' sorts, checked the three tool-call replies and the layout try against their kept files, and read no pass.

### What this shows, and what it does not

Both small models take facts from a list of notes and pass more with it: 21 and 16 tries of 69 more, and on the tasks with room 23 of 36 where it was 3, and 20 of 27 where it was 3. So the work done with the Haiku subject carries over in kind.

What holds them back, beyond what the list does not cover, is not the same as for the Haiku subject. A note that is too wide is trusted. Two notes that seem to disagree are not reconciled. Some replies never end. And the request's own words can send a reply the wrong way. The first two are faults of the text and can be mended in the text. The last is the form's, and is mended in `bench/small.py` from this date: the line over the files now says that nothing can be opened and the files are given whole.

It does not show any of this by a rule. No original was run, so it does not say how these builds stand to their originals on these tasks. It is one library, 23 tasks written by Claude models, three tries each.

### A correction, 2026-11-17: what the bits a weight tell

Written by Claude Fable 5.2, after the maintainer said that the bits a weight are a misleading measure of how much a model was changed, most of all for Flash Next.

I called both subjects "heavily quantised builds". I took that from the two numbers, 3.00 and 2.05, and from nothing else. It does not follow, and the words are out of the line above. No count in this file changes.

**What I read.** The two cards on Hugging Face, `turboderp/Qwen3.8-27B-exl3` at `3f8a2d64` and `turboderp/Qwen3.8-Flash-Next-exl3` at `00626a26`: their text, their charts of mean KL divergence, and their two histograms. And the files `quantization_config.json` and `config.json` of two builds, `SCP_3.00bpw` at `550c12cf` and `2.05bpw_h4_ng4` at `65c89531`. From those I counted the weights stored at each number of bits.

**The figure is an average. For Flash Next it is nearly the figure of one kind of tensor.** Its config gives each layer 512 experts, and a token uses 10 of them. The 2.05 build stores its weights so:

| What | Weights | Stored at |
|---|---|---|
| The experts a token is routed to | 120.8 billion | 2 bits |
| Each layer's shared expert | 0.24 billion | 4 bits |
| Attention | 2.67 billion | 4 bits |
| One small projection in the attention | 0.02 billion | 2 bits |
| The output head | 0.64 billion | 4 bits |
| The token embeddings | 0.64 billion | 16 bits, not changed |
| The n-gram table | 320 million rows, in its own file of 24.4 GiB | 656 bits a row |

The first four rows average 2.047 bits. The card's chart names its axis "bits per weight (excl. embeddings and output head)". So "2.05" says that the pool of experts is stored at 2 bits. Of the weights that every token passes through, all but 0.02 billion are stored at 4 bits or more.

The 27B's `SCP_3.00bpw` build gives each tensor its own number: 2.0, 2.5, 3.0, 3.5 or 4.0 bits. Its output head is at 4 bits and its token embeddings at 16. Its card says the vision tower is at 6.

**The makers measure the change another way.** Both cards chart the mean KL divergence between the original's next-token probabilities and the build's, over text the model wrote itself. Lower is closer. Each chart marks a noise floor, in the card's words "the divergence of the reference against itself under bf16-rounding-scale perturbation".

| Build | Mean KL divergence | Others on the same chart |
|---|---|---|
| 27B, 3.00, plain | 0.0332 | noise floor 0.00045; FP8 0.0022; NVFP4 0.0092; GGUF UD-Q4_K_XL 0.0051, UD-Q3_K_XL 0.0209, UD-Q2_K_XL 0.0587 |
| 27B, 3.00, self-calibrated, H4 | 0.0257 | the same chart |
| 27B, 3.00, the newer self-calibrated kind, H4 | 0.0291 | a longer trace: noise floor 0.00052; FP8 0.0026; NVFP4 0.0116; the 4.00 build 0.0077 |
| Flash Next, 2.05, H4 NG4 | 0.0681 | noise floor 0.00262; the 6.05 build 0.0031; NVFP4 W4A16 0.0102; GGUF UD3-Q4_K_XL 0.0084, UD3-Q2_K_XL 0.0533 |

The Flash Next card also has a table of benchmarks. It has no row for the 2.05 build. The builds on either side of it are these, and the card says of them "These are from single runs" and "very questionable".

| Build | Mean KL divergence | GPQA-D | ERQA | SWE-bench mini |
|---|---|---|---|---|
| Self-calibrated, 1.66 | 0.1205 | 86.4% | 64.3% | 74% |
| Self-calibrated, 2.18 | 0.0497 | 89.4% | 68.0% | 76% |
| Original, 16.00 | | 91.7% | 68.8% | 76% |

**What follows.**

- The bits a weight give the size of a file. They do not give the size of the change. On the 27B's chart the EXL3 build at 4.00 bits (0.0077) is closer to the original than NVFP4 (0.0116), a four-bit format whose file is about half as large again by the chart.
- Neither subject is its original. The 27B at 3.00 measures 56 to 74 times its chart's noise floor, and Flash Next at 2.05 measures 26 times its own.
- By this measure the Flash Next build is further from its original than the 27B build is from its own, 0.068 against about 0.03. The two charts use different traces and have different noise floors, so this is a loose comparison.
- The benchmarked builds nearest the Flash Next one lose 2.3 and 5.3 points of GPQA-D, and 0 and 2 points of SWE-bench mini, each from one run. Where the 2.05 build falls is not measured.

**What is not known.**

- Which of the 27B's three builds at 3.00 was run. `LAUNCH.md` says "EXL3 at 3.00 bits a weight".
- How either build does against its original on these tasks. No original was run. So "these results are theirs" stands, and nothing here says the originals would do better or the same.

**How the format stores a weight.** Read last, from the package `exllamav3` 1.6.7 as PyPI publishes it: its README, and the lines of its source quoted here. Its README says "EXL3 quantization is a streamlined variant of QTIP from Cornell RelaxML". Its source says a tensor's bitrate is "an integer 1..8, or a half-integer 1.5 / 2.5 / 3.5", and that a tile of 256 weights is stored as "16 * K uint16". So a build at K bits a weight does not round each weight to K bits. It stores one code of 256 times K bits for 256 weights together. The stored tensors of both builds have that shape. The converter's help gives the token embeddings as "16 to store unquantized, default: 16", and its source says of the output head and its like "Aux targets sit outside the main budget". Both agree with the counts above.

**What I did not read.** The QTIP paper, and the longer description of the format in the ExLlamaV3 repository. The perplexity charts. The traces the builds were calibrated and measured on, past the first page of one. The files of the builds other than the two named.

### A second correction, 2026-11-17: what this shows was put too strongly

Written by Claude Fable 5.2. Ten agents recounted this note's numbers from the kept files, and three more were asked to attack its reading. Every count held. Four sentences under "What this shows, and what it does not" say more than the counts carry.

The rule below is the one `box.py compare` uses, with a try cut off counted as a failure and a quarter as the size that matters. This run fixed no rule before its tries, so these answers are after the fact.

- **"Both small models take facts from a list of notes and pass more with it."** For the 27B the rule says "shown: the first passes more": +0.30 (+0.12 to +0.49), more on 14 tasks and less on 3. For Flash Next it says "cannot tell": +0.23 (+0.07 to +0.41), more on 10 tasks and less on 3. A gain is there for Flash Next. One as large as a quarter is not shown.
- **"So the work done with the Haiku subject carries over in kind."** That is shown for the 27B, on one 14 KB part of one library. Claude models wrote the tasks and the notes, from briefs that name the same kinds of hidden behaviour, and every try was handed the right part of the library. No task from another source has been run on a small model.
- **"A note that is too wide is trusted."** That is one task on one model. On G1 the 27B passed 2 of 3 bare and 0 of 3 with the notes, and each of its three replies goes by note 37. With the same list Flash Next passed G1 twice of three, and both passing replies name note 37. Its third reply ran in a loop.
- **"Two notes that seem to disagree are not reconciled."** That is one task, C4, and it rose with the notes on both models: 0 to 1 of 3, and 0 to 2 of 3. Its three failures with the notes are sorted the subject's.

Six tasks passed less often with the notes than without. Five of them fell by one try: on Flash Next, A3 and B5 by a reply cut off at its limit and G3 by a wrong answer; on the 27B, G3 by a reply that was only a call to a tool, and A4 from 1 of 3 to none. Only G1 on the 27B fell by more.

Three more things this run does not show, which the first form of this note did not say:

- **That the notes stand in for a larger model.** With the notes the 27B passed 51 tries and the bare Flash Next 43, and the rule says "cannot tell": +0.12 (-0.04 to +0.29). With the notes on both, Flash Next passed 59 to the 27B's 51.
- **That a shorter or a mended list would do.** Neither was run.
- **What a try costs at another setting.** No request named a reasoning effort. The chat template of the builds takes its highest of three settings when none is sent. `bench/runs/2026-11-17-effort-ladder` is written down to try the others.

### A third correction, 2026-11-18: one pass of the 27B on G1 did not leave a working camera

Written by Claude Fable 5.2. G1's check writes `camera.radius` and `camera.yaw` and reads them back. An answer can put its own accessors on the camera, with its own storage, and then the check reads the right numbers while the camera's own state never changes. `bench/runs/2026-11-17-effort-ladder/g1-probe` holds a probe that keeps the camera's own accessors from before the answer runs and reads the real values through them. I ran it on every G1 answer of this run that wrote a file. Its output is `out.txt` there.

- **`names-27b/G1/1` passed and is hollow.** After `camera.radius = 700` the camera reports 700, and its real radius is still 4000. The same for the heading.
- **The other four passes are real:** `names-27b/G1/2`, `names-flash/G1/1`, `union-flash/G1/1` and `union-flash/G1/2`. Each hands the write on to the camera's own setter, and the real values follow.
- **So the bare 27B passed G1 once of three, not twice,** and 29 of 69 tries, not 30. The kept `grade.json` still says passed: the tries were not graded again. No other count of this note changes.
- **What it touches.** The second correction says that "a too-wide note is trusted" rests on G1 on the 27B alone. That task's check is now known to pass an answer that breaks the camera, so it carries less than that.

The check is the fault, and it is the test's. It is not mended yet. I looked at the four G3 answers that also define a property on the camera: they wrap a private field to learn of a cancelled flight, and hand it on. I did not run them.

### Open

- **`names-flash/G1/2`** reasoned for about 117,000 tokens without repeating itself, began its file, and was cut off. `LAUNCH.md` asks the maintainer how it counts. It is sorted here as not known, and counted above as not passed.
- The hand-over said the 27B passed 4 of 36 bare on its tasks with room. The kept grades give 3.
