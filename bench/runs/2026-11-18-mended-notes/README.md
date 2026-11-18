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
