# What a reader must hold of a file to patch it right

Written by Claude Fable 5.2 on 2026-11-20, before any file, task or try of this run existed. The maintainer approved the question on 2026-11-20. No try is sent to the 27B until the maintainer hands `HANDOFF.md` over. Every later change to this note has its date.

## What it is for

A model works on a file, then loses its context, then must change the file again. In a long job with tools this happens each time the context is cleared. The question is what has to be put back in front of the model for its change to land: the file's name, an outline of it, the outline and the part to be changed, or the whole file. Each step costs more of the reader's context than the one before.

I have said I doubt that an outline is enough to edit from. This run tests that doubt on one model, in one message, with no tools. It also says what a cheap row about a file being written would have to hold, which is a question the maintainer has asked of Ley Lines.

**It is one message and one reply.** The reply is a patch against the file as it is on disk. The subject cannot open the file. So a patch written from a wrong idea of the file is refused, or it lands and breaks the file, as it would in real use.

## Three new words

- **Holds.** What the reader is given of the file. There are four: `name`, `outline`, `region` and `whole`.
- **Edit.** One piece of a patch: a text that is in the file now, and the text to put in its place. It is the search-and-replace form that edit tools use.
- **Kind.** What a right patch needs. There are three, below.

## The code

New code, written for this run on 2026-11-20 by agents, so that no model has seen it in training. It is plain TypeScript with no library: sixteen modules of one made-up app, each in one file with no import from another. Their sizes are spread from about 150 to about 1,000 lines. They are in `bench/sets/patch/files`. `writers/` in this folder holds the briefs the agents worked to.

The subject did not write these files. In the case this run stands for, it would have. A model may guess its own code better than another's. This run cannot see that.

## The tasks

48 tasks: three on each file, one of each kind, so sixteen of each kind.

| Kind | The change | What a right patch needs |
| --- | --- | --- |
| `beside` | adds a function or a method beside what is there | the names and types of what exists: what an outline shows |
| `inside` | changes what one declaration does; the ask names it | the text of that declaration |
| `leans` | changes one declaration the ask names, and to be right it must agree with what another declaration's body does, which that declaration's first line does not say | the text of the named declaration, and the other body |

A fourth kind is left out: a change that must also alter text the ask does not name. With an outline and the named part only, that text cannot be quoted, so the arm fails for a reason no try can change.

Each task has an ask, a reference answer, a check, and wrong answers the check must fail (`hollow-*.ts`). The check tests the new behaviour. It also tests that the rest of the file still does what it did, so a file written anew from a guess fails it. Each reference answer is also kept as edits, and `bench/holds.py` requires that they apply to the file and give the reference answer byte for byte.

## The arms

All on the 27B as the animation runs had it: reasoning effort `low`, the same server settings. The arms differ in nothing but what the reader holds of the file.

| Arm | The reader holds | Tasks | Tries |
| --- | --- | --- | --- |
| `name` | the file's path | all 48 | 48: one a task |
| `outline` | the path, and the file's outline | the 16 `beside` | 48 |
| `outline-1` | the same | the 32 `inside` and `leans` | 32: one a task |
| `region` | the path, the outline, and the lines of each declaration the ask names | the 32 `inside` and `leans` | 96 |
| `whole` | the whole file | all 48 | 144 |
| `whole-b` | `whole` again, byte for byte | 24: the tasks of eight files | 72 |

440 tries.

- **The outline has no author.** It is what `ast-grep outline --view expanded --items all` prints for the file, ast-grep 0.51.2, as it is. Each line is a line number and the first line of a declaration or of a member. A declaration whose first line does not hold all its parameters is shown cut. The files are formatted to 120 columns, and `holds.py` counts the lines that are cut.
- **The region has no author.** For each name the ask puts in a code span, if the file declares it at the top level, the region is that declaration's lines with the comment above it. `Name.member` gives that member's lines. The names come from the ask by a rule in `bench/holds.py`, and nobody picks them.
- **`name` has one try a task.** I expect it to pass nothing. Its tries are read for what the subject does when it holds nothing: says it cannot, makes up the text to replace, or writes the whole file anew. No rule is asked of it.
- **`outline-1` has one try a task,** on the tasks where an outline cannot be enough: the text to change is not in it. It is read the same way. Question 5 sets `region` against it.
- **`region` is not sent the `beside` tasks.** There its text is the outline with the bodies of whatever the ask names, which lies between two arms that are sent.
- **`whole-b`** is there so that the rule is tried on two rounds of one arm, as `AGENTS.md` asks. It has the tasks of every second file, by the files' order of size.

`bench/holds.py make` writes what each arm's reader holds for each task into `bench/sets/patch/tasks/<task>/holds/`, and `holds.py check` says whether those files are still what the command gives. The machine that sends the tries needs no ast-grep.

## The reply

The message ends by asking for edits:

    EDIT: app/<path>
    ```
    <<<<<<< SEARCH
    text that is in the file now, copied exactly
    =======
    the text to put in its place
    >>>>>>> REPLACE
    ```

- The SEARCH text must be in the file exactly once, or that edit is refused. Nothing is forgiven: not a space, not a line's indent.
- Edits are applied in the order given. A refused edit leaves the file as it was, and the edits after it are still tried.
- An edit with an empty SEARCH adds its text at the end of the file.
- A whole file may be written instead, as `FILE: app/<path>` and a fenced block.

The form is the one a widely used open-source coding tool asks of its models, so a model is likely to have met it. `small.py selfcheck` reads made-up replies in this form.

## What is measured

For each try, by a command:

1. **What the reply holds:** edits, a whole file, both, or nothing.
2. **Whether the patch applies:** the reply holds an edit or a file, and every edit was applied. For each refused edit: no such text, or the text is there more than once. Beside it, whether it would have applied had spaces at line ends and indents not counted. That last one is for reading only. It changes no count.
3. **Whether the check passes.**
4. **Output tokens,** as the endpoint counts them, reasoning included. The message's size stands beside them.

Then every answer is read and every failure sorted, as `AGENTS.md` says. A failure where the arm did not hold what a right patch needs is **the arm's**: it is the thing measured, and it is not counted against the subject or the test. The ceiling says which failures those are.

## The rule, and what it is asked

`box.py`'s rule, with the task as the unit and a quarter as the size that matters. A try cut off is a failure.

1. `whole-b` against `whole`, on the 24 tasks both have. If the rule tells them apart, nothing below counts.
2. `outline` against `whole`, on the 16 `beside` tasks. Is an outline enough to add code?
3. `region` against `whole`, on the 16 `inside` tasks. Is the named part enough to change it?
4. `region` against `whole`, on the 16 `leans` tasks. Is the named part enough when the change leans on another body?
5. `region` against `outline-1`, on the 16 `inside` tasks. I expect this one to be shown. It is the step of the ladder that can fail.

The same five are asked of "the patch applies". Output tokens are given as each arm's median and range by kind, with no rule: I have no size that matters for them yet.

### The rule on made-up subjects, and why there are sixteen files

Added 2026-11-20, before any file was written. The first plan had eight files and 24 tasks, eight of a kind. I asked the rule for its answer on made-up subjects whose chance of passing each task I chose, 400 made-up runs a row, three tries a task:

| The two arms | 8 tasks | 16 tasks | 24 tasks |
| --- | --- | --- | --- |
| both pass 9 times in 10 | no difference 55%, cannot tell 44%, shown 1% | no difference 94%, cannot tell 6% | no difference 99%, cannot tell 1% |
| both pass 8 times in 10 | no difference 24%, cannot tell 72%, shown 3% | no difference 69%, cannot tell 30%, shown 1% | no difference 90%, cannot tell 10% |
| both pass 7 times in 10 | no difference 15%, cannot tell 79%, shown 6% | no difference 50%, cannot tell 49%, shown 2% | no difference 81%, cannot tell 19% |
| 0.9 against 0.8 | no difference 24%, cannot tell 68%, shown 8% | no difference 54%, cannot tell 44%, shown 2% | no difference 66%, cannot tell 32%, shown 2% |
| 0.9 against 0.6 | shown 67%, cannot tell 31% | shown 74%, cannot tell 25% | shown 80%, cannot tell 20% |
| 0.9 against 0.4 | shown 98% | shown 100% | shown 100% |
| 0.9 against: 0.9 on half the tasks, never on the rest | shown 83%, cannot tell 17% | shown 100% | shown 100% |
| 0.9 against: 0.9 on three quarters, never on the rest | shown 22%, cannot tell 78% | shown 44%, cannot tell 56% | shown 35%, cannot tell 64% |

`python3 patch.py simulate` prints all three columns.

- **At eight tasks the rule can show a large difference and cannot say there is none.** Two equal arms that pass 9 times in 10 get "no difference" in 55 runs of 100. Questions 2 and 3 ask whether a part is enough, and "enough" is a "no difference" answer. So eight tasks could not answer them.
- **At sixteen it can, when both arms pass often:** 94 in 100 at 0.9, 69 at 0.8. At 0.7 it is a coin toss. So if the 27B with the whole file passes under about 8 in 10, questions 2 and 3 will likely end "cannot tell" even at this size, and I will say so and not read the direction.
- **A difference of a third of the passes is not reliably shown at any of these sizes** (0.9 against 0.6: two runs in three, to four in five). The rule is fit for the large differences I expect in questions 4 and 5.
- **A part that fails on a quarter of the tasks and matches on the rest is mostly "cannot tell".** That pattern is likely in question 2, if some `beside` tasks need what the outline cuts. The by-task table is read for it.

So the set was doubled to sixteen files, and tries were taken from where one round settles the matter to pay for it.

## What each outcome changes

| Question | If no difference as large as a quarter | If `whole` is shown to pass more |
| --- | --- | --- |
| 2. `outline` on `beside` | A row that holds an outline is enough to add code from. | First lines are not enough. The failures say what was missing: a cut line, a member, a meaning. |
| 3. `region` on `inside` | To change a declaration, a reader needs its lines and an outline, not the file. A row should carry the parts changed lately. | Even the named part is not enough. I would not have guessed this, and would read the failures before anything else. |
| 4. `region` on `leans` | First lines carry more than I think. | A reader needs something about what the other bodies do. Rows would have to carry it, or point at the lines to read. |

If `whole` applies less often on the longer files than on the shorter, that is a reason to hand over parts and not files. I will give the share that applies by file length, and claim nothing from sixteen files.

## My guesses

Made before any file or task was written. I have read no code of this run, because there is none.

As first written, for eight tasks of a kind: passes of 24 tries a cell (of 8 for `name`).

| Arm | `beside` | `inside` | `leans` |
| --- | --- | --- | --- |
| `name` | 0 or 1 | 0 | 0 |
| `outline` | 14 to 20 | 0 to 2 | 0 or 1 |
| `region` | 15 to 21 | 17 to 22 | 3 to 9 |
| `whole` | 18 to 23 | 18 to 23 | 12 to 19 |

The same guesses at the size the run now has, changed only in scale, on 2026-11-20 before any file was written: passes of 48 tries a cell, and of 16 for `name` and for `outline` on `inside` and `leans`. `region` is not sent `beside`, so that guess is not scored.

| Arm | `beside` | `inside` | `leans` |
| --- | --- | --- | --- |
| `name` | 0 to 2 | 0 | 0 |
| `outline`, `outline-1` | 28 to 40 | 0 or 1 | 0 or 1 |
| `region` | not sent | 34 to 44 | 6 to 18 |
| `whole` | 36 to 46 | 36 to 46 | 24 to 38 |

- **The patch applies:** in `region`, 83 to 93 of 96; in `whole`, 124 to 140 of 144. In `outline`, 36 to 46 of 48 on `beside`, mostly by adding at the end of the file; in `outline-1`, under 4 of 16 on `inside`.
- **What `name` does:** it gives a patch in 32 to 44 of its 48 tries, with made-up text to replace or a whole made-up file, and says it cannot in the rest.
- **What `outline` does on `inside`:** in more than half of the tries it makes up the body's text and the edit is refused. In under a quarter it says it cannot.
- **Output tokens:** `region` and `whole` have medians within a fifth of each other. `name` has a median at least half as large again as `region`.
- **Question 1:** the rule does not tell `whole-b` from `whole`.
- **Questions 2 and 3:** no difference as large as a quarter, or cannot tell. **Question 4:** shown, `whole` passes more. **Question 5:** shown.
- **The ceiling** (a Sonnet model, one try a task, at the size the run now has): `whole` 44 to 48 of 48. `region` 15 or 16 of the 16 `inside`, and 4 to 10 of the 16 `leans`. `outline` 14 to 16 of the 16 `beside`, and no more than 2 of the other 32. `name` 0 to 2.

## Before any try

1. **`box.py check-tasks bench/sets/patch --window none`** ends `all as they must be`, and `holds.py check` finds every kept file current.
2. **The checks are attacked.** A fresh agent tries to pass each check with a wrong answer. Each one that passes becomes a hollow answer and the check is mended.
3. **A ceiling.** A Sonnet model is sent each task once in each of the four kinds of arm, through `small.py --via-claude`, in `bench/runs/2026-11-20-patch-ceiling`. There every arm has every task, so that the ceiling also says what the 27B's arms were not sent. For `whole` it must pass every task, or the task is mended and sent again. For the other arms it says which failures are the arm's.
4. **A fresh reader** is given one `outline` message and one `region` message and nothing else. It says what it is asked, in what form, and what is missing.
5. **The rule is tried on made-up subjects,** which is done above, and the rule that sorts is tried on a made-up failure of each kind.

## Added 2026-11-22, before any try

By Claude Opus 5.5, after the files were written, attacked and mended, and before the ceiling.

**Who made the set.** Agents of a Fable model wrote the sixteen files and their tasks, and attacked the checks of twelve. Then that model's usage limit stopped four attacks partway, and fifteen of the sixteen menders before they had finished, some before they began. Only the mender of tides finished. Agents of an Opus model did the four attacks again and did the fifteen menders' work, or finished it. Each was told that an agent before it had stopped, and to work out from the files what was done. `bench/sets/patch/changes/<file>.md` says what each mender changed, and where one took over from another. `writers/reports/<file>/` keeps each agent's report.

**An outline can be enough for an `inside` task, by a way round.** The menders of ten files found it in their file's `inside` task: fuel, manifest, moorings, parts, pumpout, rota, stoppages, survey, tides and worklog. In moorings it also needs three right guesses. Two files, handover and notices, were still being mended when this was written. The way: keep the named declaration's old body under a new name, then write a new declaration of the old name that calls it and changes what goes in or what comes out. That needs only the first line, and the outline shows it. The check cannot fail such a patch, because it does what the ask says.

- **I left the route open.** To close it, each `inside` task would have to turn on a step in the middle of a body that a caller cannot undo. The menders found no small change that does that. Changing all sixteen tasks now would change what the run measures.
- **So question 5 does not ask what I wrote.** I wrote that `outline-1` holds the tasks "where an outline cannot be enough". For most of them that is not so. The question now asks: does a reader who holds the named part pass more often than one who holds only the outline? A pass by the way round counts as a pass.
- **`patch.py shapes` points at those passes.** It counts each pass whose file declares a name that neither the file nor the reference declares, and each that keeps the named declaration's old body whole somewhere else. Every such pass is read, and the count is reported beside the score. It changes no score.
- **A patch made this way leaves the old body in the file under a second name.** Real use pays for that later. This run does not measure it.
- **My guesses stand as written.** I did not foresee this route when I made them.

**The check does not check types.** It runs the code, and the test runner strips the types first. So a patch that breaks the file's types and behaves right passes. Five menders said so. `patch.py shapes` also runs `tsc --strict` on each patched file and counts those that fail. That count is for reading only.

**`whole-b` has the tasks of moorings, pumpout, fuel, survey, worklog, invoices, bookings and handover:** every second file by size, from the smallest. The mends changed some sizes by a few lines and did not change the order.

## How each failure is sorted

Written 2026-11-22, before any try. Mended the same day, after a fresh reader sorted made-up failures by the first words and read one of them the other way from me. `sorting-trial.md` says what changed and why.

Each failed try gets one line in `whose.txt`, as `AGENTS.md` says. The line names one of five sorts, then says why in a sentence that points at the reply.

The question for each failure is **what the failing part of the patch rested on.** Find the first edit that was refused. If none was refused, find the first case that fails, in the order the check prints them. Find the text or the fact that part needed. Then ask whether the message held it.

**What the message holds** is everything that was sent: the request, the ask, and the arm's text of the file. A fact is held when the message states it, or when a careful reader can read it off the held text without a guess. For example, a held body that compares a time with 1320 shows that the time is in minutes. A fact that only a body the arm did not hold shows is not held.

1. **Cut off.** The reply was cut by its length limit. Say whether it was in a loop, and what it had written.
2. **The test's.** The check fails a right answer, that is, one that does what the ask says. This covers an ask with two readings, when the reply took a reading the check does not allow. It also covers a reply the bench read wrongly. This sort comes before the next two: a failure that is the test's is the test's, whatever the arm held. The reference and the ceiling are evidence. If the ceiling's `whole` try fails the same case, look at the check first.
3. **The arm's.** The failing part needed a text or a fact that the message did not hold. Examples: an edit quotes a body that the outline does not show, and is refused; an answer guesses what a body it was not given does, and the guess is wrong; the outline prints a line otherwise than the file has it, such as a member without `readonly`, and a SEARCH copies the outline's form.
4. **The subject's.** The failing part needed only what the message held, and the reply got it wrong. Examples: a SEARCH that miscopies held text, spaces included; a change that contradicts the ask; a body rewritten from a guess where the arm held the body.
5. **Not known.** None of these can be shown from the reply and the files.

Things the rule settles beforehand:

- **The line number is not part of the line.** The outline prints a number before each line, and the message says so. A SEARCH that keeps the number is the subject's.
- **What the server sent is the reply.** A fault in the reply's text is the subject's, even when the server might have made it. Nothing in the record can tell the two apart.
- **A way round does not move a failure.** The way round is to keep a declaration's old body under a new name and call it from a new declaration of the old name. That such a patch could have passed from what the arm held does not make a failure the subject's. A reply that takes the way round is sorted like any other, by what its failing part rested on. If that was what the old body does, and the arm did not hold the old body, the failure is the arm's.
- **Holding nothing.** In `name`, every failure is the arm's, unless it was cut off or is the test's.
- **More than one fault.** Sort by the first, as above. Write the others in the same line.

## What the test takes for granted

Filled in when the messages exist. Each line will point at words in a kept message.

## What it does not cover

- **One model, one message, no tools.** A reader with tools can open the file. Whether it does so before it patches is a question for a run with tools.
- **The subject did not write the files,** and holds no memory of them. A model that wrote a file and kept notes on it holds more than `name` gives.
- **One outline tool, in one view.** Another outline could carry more or less.
- **One language, sixteen files, one app,** all written the same day by agents of one model family.
- **A change that must alter text the ask does not name** is left out, as said above.
- **No patch by line number.** A reader with a shell can replace lines by their numbers. This form cannot.
