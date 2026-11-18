# Mending the notes on the tasks we have, and what that cannot show

Written by Claude Fable 5.2 on 2026-11-18, before any note was mended and before any try. The maintainer said to write this run down. No try is sent until the maintainer says go.

## What it is for

`bench/runs/2026-11-17-effort-ladder` left a work queue. With the 78 notes, at the reasoning setting `low`, the 27B failed 41 tries in two rounds. 27 of those were sorted as the text's: four notes say too much or mislead (9, 13, 36, 37), and three things are said by no note (on the tasks A4, G5 and F5).

This project builds a way to mend a text until a small model passes. So the next step is to mend those seven things and send the tasks again. That is part A, and it is all this run sends.

Part A is a regression test. It can show that a mend landed. It cannot show that the mended notes are better notes, because each mend was made from a failure on the very tasks that then score it. A note that states the one fact a task turns on will mend that task nearly every time. Part B says what could show more, and what I found when I tried to design it. Part B is not fixed here and nothing of it is sent.

**The two sets, from now on.** The 23 camera tasks are the development set. Notes may be mended on them freely. A held-out set is one whose failures have mended nothing. There is none yet.

## Part A: one round of mending, on the development set

### How a note is mended

Fixed before any mend. Four agents wrote on this, and these rules are theirs and mine.

1. **Two roles.** A sorter sees everything: the ask, the check, the answer, `whose.txt`. For each thing the failures point to, it writes a ticket. A mender sees the tickets, the notes, the declarations and the library's code. It never sees an ask, a check, a reference answer, a subject's answer or a `whose.txt`.
2. **A ticket speaks of the library.** It names the note at fault, or says that no note covers the thing, and names the function and what it does. It holds no task's name, no value from an ask and no expected answer. A second agent checks each ticket for these before the mender has it.
3. **A mended note says what the library does.** It covers every branch of the function it speaks of, or names the case it holds for. It never says what a task's answer is.
4. **A probe shows it.** Each mended or new note has a test that passes on the library, and the note's words reach no case its test does not run. `AGENTS.md`: a fact no wider than its check.
5. **The list may not grow much.** It stays at 85 notes or fewer, and at 16,786 bytes or fewer as the subject is handed it. That is a tenth over the 15,260 bytes of `union.md`. Past that, the mender shortens before it adds.
6. **A blind reader looks for an answer key.** It has the 23 asks and the mended notes, and not the tickets. It flags a note that gives a task's values, or that settles a task for a reader who does not know the behaviour. A flagged note is written again or dropped. The flags are counted here.
7. **One round.** The queue is the seven things. Nothing else in the list is touched, and no checker goes looking for more faults. Three rounds of that, in `bench/runs/2026-11-15-camera-union/edit`, found as many faults each time and made the list 36% longer with no subject run.
8. **What is kept of each mend:** its ticket, the note before and after, the bytes it adds, the file and line of the code, the probe, and the blind reader's word.

Five of the seven mends state the very thing a task turns on: that a new limits object is ignored (G1), which keys are not normalised (C3), which writes apply the limits again (G5), where the eye is (A4), and what a drag reads (F5). No rule can take that out, and it is not a fault: it is what a note is for. It is why part A's result is not evidence about other tasks.

### What is sent

One arm, `mended-low`: the 23 tasks, 3 tries each, 69 tries. The subject gets the bare declarations and the mended notes. Everything else is as `union-low` had it in `bench/runs/2026-11-17-effort-ladder`: the same build, server and template (that run's rule 1, checked again in `LAUNCH.md`), message form 1, the same request, and this command with the arm's name changed:

```sh
python3 bench/small.py launch bench/runs/2026-11-18-mended-notes \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm mended-low \
  --message-form 1 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
```

It is set beside the 138 kept tries of `union-low` and `union-low-b`, which had the 78 notes as they stand. Those are not sent again. At about 8,200 tokens in and 3,600 out a try, the arm is about 570,000 tokens in and 250,000 out. That guess is from those two arms.

### How it is read

**Task by task, first.** A developer asks which tests went green and which went red. For each task, the kept arms give 6 tries and this arm 3.
- **Mended:** the kept arms passed 2 of 6 or fewer, and this arm passes 3 of 3.
- **Broken:** the kept arms passed 4 of 6 or more, and this arm passes 0 of 3.
- **No change shown:** anything else.

Tried on made-up subjects whose pass rate is the same before and after: the chance that a task is called mended is at most 0.043, and broken at most 0.043, both at a rate near one half. Most tasks here sit at none or all of their tries, where the chance is nothing. A task that truly goes from failing to passing every time is called mended every time. One that goes to passing two times in three is called mended 3 times in 10.

Five tasks can be called mended: A4, A5, C3, G1 and G5 passed 0, 1, 2, 0 and 1 of their 6 kept tries. F5 passed 4 of 6, so its mend cannot be shown by this rule. C4 passed none, and no mend aims at it.

**Then the rule, as a description.** `box.passes_rule` on `mended-low` against `union-low`, a quarter as the size that matters. If all five tasks were mended the gain would be about 0.2, which the rule does not call shown. So its answer decides nothing here.

**Then every failure is sorted,** as that run sorted them, by agents whose brief says that the reasoning they read is the test subject's.

### What each outcome changes

| What comes | What it means | What is done |
|---|---|---|
| Three or more tasks mended, none broken | The loop closes on these tasks: a sorted failure became a ticket, a mend, and a pass. | The mended list is the working text for the development set. Its hash is fixed for part B. |
| A task broken | A mend cost something elsewhere, or the list's new length did. | The broken task's failures are read. The mend that did it is undone, or the reason is written. |
| Fewer than three mended | The failures were not the text's after all, or the subject cannot use the note as written. | The tries are read. The sorting rule is looked at before any second round. |

### My guesses

- The list comes in under both bounds, at 80 notes or fewer.
- Four of the five tasks are called mended: A5, C3, G1 and G5. A4 needs arithmetic with the formula, and I give it one chance in two.
- No task is broken.
- `mended-low` passes 58 to 64 of 69.
- What would surprise me: a broken task among those that passed 6 of 6.

## Part B: a held-out set, not fixed here

The weak point of every result so far is that Claude models wrote both the tasks and the notes, from briefs that name the same kinds of hidden behaviour. I told the maintainer that the library makers' own unit tests would give tasks from an independent source. Four agents then looked, and it is less simple than that.

- **The makers' tests are not independent of the notes.** All six writers of the notes had them, and three read parts of them. Of 133 test cases that could become a task, a note already states 67 in full.
- **They are not independent of the 23 tasks either.** For eleven of the 23, the task's own note names a makers' test that pins its behaviour: B1 to B6, C3, C4, I1, K1 and P1. On those eleven the bare arm passed 12 of 33 tries at `low` and the notes arms 28 and 25. On the other twelve the bare arm passed 9 of 36 and the notes arms 23 and 21. So the notes gain about as much on both kinds, and a held-out set drawn from the same tests would most likely show the same again.
- **Many of the cases are easy.** By the agent's judgment about 47 of the 133 would pass on the declarations alone, and 52 come from one test file.
- **The rule cannot see a mend on a held-out set.** Tried on made-up subjects like these, a true gain of 0.35 between two arms is called shown about 9 times in 10 at 20 tasks. A true gain of 0.2 is called shown about 1 time in 4, at 20, 30 or 40 tasks alike, and more tries a task change nothing. The seven mends touch few behaviours, so the mended notes against the notes as they stand would read "no difference as large as a quarter" nearly whatever is true. That arm could show that mending did no harm, and no more.

What a held-out run could still show is whether the gain of the notes as they stand, about 0.4 here, holds on tasks that no writer chose for being a trap. The form I would give it:

- **Cases drawn by lot** from the makers' cases that none of the 23 tasks uses, with a cap for each test file, so that no writer picks the tricky ones.
- **A writer who never sees** the notes, their brief or the 23 tasks, and who turns each drawn case into a task. For each ask, a fresh reader says what it gives away.
- **Each task marked beforehand** by another agent: a note states its behaviour, or none does. The rule is asked on each group. The second group is a control, where the notes should gain nothing.
- **Each check tried against a hollow answer** that fakes what the check reads, as G1's was not.
- **All tasks scored,** with none dropped for being passed bare, so that no arm's luck picks the tasks.
- **Two arms** at `low`, bare and the 78 notes, on 40 tasks: 240 tries. The mended list as a third arm only to see that it does no harm.
- **Half of the unused cases sealed** for a later run, because a held-out set whose failures have been read is a development set.

It would be most of a day of agent work to build, and its likeliest result is "the notes help where a note states the thing, and not where none does". That is worth knowing and it is not surprising. The maintainer says whether it is built.

## What this run does not cover

- **Another model, another setting, another library.** One build of one model at `low`, on the camera code.
- **Whether the mended notes are better notes.** Only a held-out set can say.
- **How little text is enough.** The mended list is a little longer than the one before.
- **A subject that does not reason.** The request as worded makes one reach for a tool.

## What I did not check

I did not read the makers' tests or count their cases. The counts in part B are the agents', from one reading each. The passes by kind of task are counted from the kept grades by a script of mine. The chances under "How it is read" are worked out below and are to be checked by a fresh agent before any try.

## The mended list, 2026-11-18, before any try

Written by Claude Fable 5.2. The list is `texts/mended.md`: 82 notes, 16,711 bytes, sha256 `813395801e6145f67f115b8a1cb2eddd092f805bb76f71455e6f84d0d41561c4`. It is 1,451 bytes more than `union.md`, 9.5%, and inside both bounds of rule 5. `mend/` holds the record: the tickets, the list after each pass, the probes, the testers' own tests, and each agent's report.

**The seven mends are eight notes.** Counted in the mended list: 5 is new (where an arc-rotate camera's eye is). 10 and 11 were note 9 (held keys). 15 was note 13 (which function clamps a viewport's edges). 38 was note 36 (the aspect ratio). 39 was note 37 (the limits object). 40 is new (which writes apply the limits again). 44 is new (what a drag of the free camera reads). The other 74 notes are word for word as they were, in their order.

**How it went.**
1. **Tickets.** A Sonnet agent wrote seven tickets from the sorted failures. An Opus agent checked them. It took a task's wording out of five, and it corrected what six said of the library. One correction matters: the first reading had the drawn rectangle clamped, and the render passes do not clamp it.
2. **First pass.** An Opus mender, with the tickets and the code and no task, wrote the mends and a probe for each: 81 notes, 16,523 bytes.
3. **Two readers.** A blind reader flagged two notes for a worked case that an ask also has. One was new in the mend, and it was taken out. The other, `cam.center = cam.center works`, was in the list before the mend, and the third pass put it back with the other words no ticket faulted. A tester found five cases that a note's words reached and its probe did not, and eight words whose reach was not said.
4. **Second pass.** The mender put those cases into the notes: 81 notes, 16,578 bytes. Two notes were now shorthand that no reader could act on, and one had lost its first sentence, which no ticket had faulted.
5. **Third pass.** The mender was told to put back every word no ticket faulted, to write whole sentences, and to split a note sooner than squeeze it: 82 notes, 16,770 bytes. A fresh agent found no clause lost and no other note changed.
6. **One sentence taken out by me.** Note 5 ended by saying that alpha and beta stay as written until `setCameraLimits` runs. Note 9 says the controls' frame step clamps beta on some frames. The two could be read as disagreeing, and an earlier run lost a task to such a pair. I deleted the sentence and added nothing.

The seven probes pass on the library, 40 cases. I ran them after my deletion.

**Where the rules above were not kept.**
- **Rule 7, one round.** The seven notes were written three times. The second pass is what happens when a tester's findings are put into a note with a limit on its bytes: the note turns to shorthand. The third pass undid that. A fixer should be told from the start to split and not to squeeze, and to keep unfaulted words.
- **Rule 3, every branch.** These branches are in a ticket and in no note: what the Alt key adds to alpha; that an arrow pressed while Meta is held stays dead after Meta is let go; that a blur clears the held keys; how `resolveCameraViewport` rounds; that the geospatial controls read a newly assigned limits object; that a write of the stored value does nothing on the arc-rotate camera; pointer capture. The list has 75 bytes left under its bound.
- **Rule 1, two roles.** The deletion in step 6 was made by a reader who has seen the tasks.
- **Rule 6, as the blind reader was briefed.** It was told not to flag a note for stating the fact a task turns on, and to count those apart. It counted nine, over seven tasks: A4, A5, C3, F5, G1, G5 and K1.

**One guess already wrong.** I said 80 notes or fewer. There are 82.

**What is sent, with the list now known.** A message is about 1,450 bytes longer than with the 78 notes, so a try is about 8,600 tokens in. In a copy of this directory, `box.py setup` set up 69 tries, and `small.py prompt --arm mended-low --task K1 --n 1 --message-form 1` gave a message of 32,178 bytes that holds the mended notes and the line "Here are the files in the app that matter:". The copy was thrown away. No try is set up here: the session that launches sets them up on its own machine.

**Before the launch,** that session writes `LAUNCH.md` as the last run's did: the go, and that the build, the template and the server are the ones `union-low` had. If they are not, nothing is sent, since the 138 kept tries would no longer be the other side.

## The go, and part B held off, 2026-11-18

- **The go.** Asked "Go for the 69 tries?", the maintainer said "Yes". The session that launches writes `LAUNCH.md` before any try.
- **Part B is held off.** The maintainer's words: "I expect that we'll naturally discover held-out tasks in the course of adding new libraries and capabilities". No held-out set is built for the camera code.
- **What that needs, to work.** This is mine, and not yet a rule of the project. The first time a text meets a set of tasks, nothing has been mended from those tasks. That first score is the held-out one, and it is there once. So for each new library or capability: the notes are written without the tasks in view, the tasks are run, and that score is kept before any ticket is written from a failure. After the first mend the set is a development set.
- **The tool that reads the result,** written before any try: `mended.py tasks` gives each task's call by the rule under "How it is read", `mended.py rule` the description, and `mended.py sorted` says whether every failure is sorted. It was tried by reading the kept `union-low-b` as if it were the new arm: it gave that arm's 46 passes of 69 and its sorts as the last run has them, and no task mended or broken.

## When the tries are in

For whichever session reads them. Each step is the last run's, `bench/runs/2026-11-17-effort-ladder`.

1. `box.py check-tasks bench/sets/camera` ends with "all as they must be", and every kept try is graded with G1's check as it now stands.
2. `mended.py tasks` and `mended.py rule`. Nothing is explained from them yet.
3. Every failure is read and sorted into `whose.txt`, by the rule under "How a failure is sorted" in the last run's note, with the paragraph of `bench/SMALL-MODEL.md` under "When agents read the tries" in each reader's brief. One reader takes one task, so that the same failure gets the same sort. A second reader sorts a sample blind. A try cut off is sorted too long, by `AGENTS.md` rule 6 (added 2026-11-18 by Claude Opus 5.5).
4. `mended.py sorted` and `box.py tally --strict` pass. Only then is "What came" written: the tasks' calls first, then the passes, the sorts beside them, each guess beside what came, and what it does not show.
5. A fresh agent sets each number of "What came" beside the tools, and another reads it for sentences that say more than the counts carry. The last two notes were each wrong in places that only such a reader found.

Added 2026-11-18 by Claude Opus 5.5, before any try was read: a reply cut off by its length limit is sorted "too long", by the maintainer's ruling (`AGENTS.md`, rule 6). `mended.py sorted` and `box.py tally --strict` stop if such a try is sorted another way. Its tries are still not passed in every count here.

Added 2026-11-18 by Claude Opus 5.5: the suggestion under "What that needs, to work" is now a rule of the project, in `AGENTS.md`, as "Keep the held-out scores before the first mend". The maintainer said yes to it, and a checker's reading made it say that a score is held out only while the text was written without those tasks in view.

## What came

Written by Claude Opus 5.5 on 2026-11-18. The session on the maintainer's machine sent and graded the tries, as `LAUNCH.md` says, at commit `de46716`. Its two differences from `union-low` are there: the server was a new process, after the machine was started again, and the kernel a later build. The model's files, the template, the server's programs and its settings were the same.

### The tries

69 sent, 69 kept and graded, none cut off, none not run. The server stopped no loop. `mended-low` passed **64 of 69**. The two kept rounds of the same arm with the 78 notes passed 51 and 46.

### Task by task, by the rule fixed before any try

`mended.py tasks`:

| Call | Tasks | Kept, of 6 | `mended-low`, of 3 |
|---|---|---|---|
| Mended | A4 | 0 | 3 |
| | A5 | 1 | 3 |
| | C3 | 2 | 3 |
| | G1 | 0 | 3 |
| Broken | none | | |
| No change shown | G5 | 1 | 1 |
| | C4 | 0 | 0 |
| | F1, F5, F2, K1 | 3, 4, 5, 3 | 3 each |
| | the other 13 | 6 each | 3 each |

The mends aimed at six tasks: A4, A5, C3, F5, G1 and G5. Five of them could be called mended; F5 passed 4 of its 6 kept tries, so this rule cannot show its mend. Four are: A4, A5, C3 and G1. G5 is not: it passed one try of three, against 1 of 6 kept, and its failure moved, as "The failures" says. No task is broken.

### The rule, as a description

It decides nothing here, as "How it is read" says. `mended.py rule`: against `union-low`, +0.19 (+0.04 to +0.35), "cannot tell"; against `union-low-b`, +0.26 (+0.12 to +0.42), "shown: the first passes more".

### The failures

Five, every one sorted. `mended.py sorted` and `box.py tally --strict` pass.

| Arm | Failures | The text's | The subject's | The test's |
|---|---|---|---|---|
| `union-low`, the 78 notes | 18 | 13 | 5 | 0 |
| `union-low-b`, the 78 notes | 23 | 14 | 6 | 3 |
| `mended-low` | 5 | 2 | 1 | 2 |

- **C4/1, the subject's.** Note 60 says that alpha takes the shortest arc. The reasoning sets it aside for note 62 and makes one call with the whole turn, so the camera steps backwards or jumps. The camera tasks' readers sorted the same thing so on `union-low`.
- **C4/2 and C4/3, the test's.** Each reads note 60 rightly and then drives its own frame loop, one by `requestAnimationFrame` and one by the real clock inside a frame hook. The check has no `requestAnimationFrame`, and it calls the frame hooks with a fixed 16 ms, one frame right after another, so a hook timed by the real clock hardly moves. The same failure was sorted so before.
- **G5/1 and G5/2, the text's.** Each answers 2000 for the radius written back to itself, where the check wants 4000. Both quote note 40: the setters "do nothing when the value written equals the stored, wrapped and clamped value". Both take "clamped" as clamped by the new limit of 2000: G5/1 clamps the value written, G5/2 the stored one. Those words came in with the mend.

**On G5 the mend moved the failure.** With the 78 notes, all five failures on G5 got the empty call to `setGeospatialOrientation` wrong, and all six tries got this radius case right. With the mended notes all three tries get the empty call right, and two get the radius case wrong. The rule by task cannot see that: the count stayed at about one try in three.

Two failures are the text's, and the mend's own words made both. With the 78 notes, 13 and 14 were.

**Who sorted them.** A Sonnet agent sorted four. A second Sonnet agent sorted the same five blind, and agreed on each of the four. My brief named G5/3 as a failure, which it is not; the failure is G5/2. The second agent found that, and sorted G5/2 the subject's, as G5/1. I read G5/2's answer and its reasoning on the radius case, and wrote its line. A fresh Opus agent then checked this section against the tries. It found that both G5 lines misread the reasoning: the first sorted G5/1 the subject's for reading note 40 "backwards", and I had sorted G5/2 the subject's for going by the clause about `setGeospatialOrientation`. Neither reasoning does what its line said. Both were sorted again, the text's, each line saying what it had been.

### The passes, probed

An Opus agent ran the probes of `bench/sets/camera/audit` on all 42 passes of the code tasks. These read the library's real state, not what an answer reports. **By its report, none is hollow.** Its outputs are in `probed/`. The audit calls its probes a reading, and not a grade. G1's three passes copy the mode's values into the camera's own limits object, and they hold for a mode wider than the camera's defaults. B6's three fail the probe only where the app moves the camera, which the audit does not count against an answer. On the same probes `union-low` has no hollow pass, and `union-low-b` one: B5/3, which the audit had found.

### Each guess beside what came

| The guess | What came |
|---|---|
| The list stays under both bounds, at 80 notes or fewer | Under both bounds, at 82 notes |
| Four of the five tasks are called mended: A5, C3, G1 and G5; A4 an even chance | Four: A4, A5, C3 and G1. G5 is not. |
| No task is broken | None is |
| `mended-low` passes 58 to 64 of 69 | 64 |
| What would surprise me: a broken task among those that passed 6 of 6 | None |

### What this shows, and what it does not

- **The loop closed on four tasks, and opened a new fault on a fifth.** Seven things were sorted as the text's fault. Seven tickets were written in the library's terms, and an agent who saw no task made the mends; I took out one sentence after, having seen the tasks. Four of the five tasks that could show it went from failing to passing three of three, and no task broke. On G5 the mend put right the case the old notes got wrong, and its new words led two tries wrong on a case the old notes got right.
- **It is one round,** of one arm. The kept arms' rounds differ by five passes, and this arm's 64 is one draw.
- **It does not show that the mended notes are better notes.** They were mended on these tasks. Five of the mends state the very thing a task turns on, and the blind reader counted nine places where a note settles a task. Only tasks no one mended from can show more. `bench/runs/2026-11-18-animation` is built for that.
- **What is left on these tasks:** on G5, the words "the stored, wrapped and clamped value" in note 40, which the next mend should make plain; on C4, one try that set note 60 aside for note 62; and answers that run their own frame loop, which the check cannot drive.
- **The rule by task can miss a moved failure.** A task whose count stays the same may have traded one fault for another. The failures' sorts and the answers' fields show it, and the count alone does not.

### What I did not read

I read the five failures' lines, G5's three answers, and G5/2's reasoning on the radius case. I did not read the other answers or reasonings. The sentences above about C4 are the sorting agents', checked by the blind second reader and by the fresh agent. What is said of G5/1's reasoning is the fresh agent's.
