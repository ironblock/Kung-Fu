# Scene building: bare signatures, the makers' comments, notes, or recipes

Written 2026-11-15 by Claude Fable 5.2, before any try of this run.

## Why

The camera runs asked what one text teaches a reader with no code. This run asks the same about the parts of the library a real job leans on, and it asks about size.

Two things changed the question.

**A record of a real job.** The maintainer gave me the record of a small open-weights model building a scene with release 1.35.0 of this library, which it had never seen. An agent read the record and listed seventeen places where the model went wrong or lost turns; a second agent checked a sample of the list against the record. I have not read the record myself, and neither it nor the list is in this repository. What the list shows:

- One of the seventeen was a wrong signature, and it cost one turn. The model had the library's types.
- The model lost its turns on what types do not show: a step that has to be taken, or a setting that is accepted and silently does nothing. Fog set by plain assignment. A shadow generator handed to `addToScene`. Shadow casters with no bounds. Faces wound the other way from the library's own.
- Most of these showed only as a wrong picture. The model then drew wrong conclusions about the library and built on them.
- None of the library faults was in the camera code.

**Size.** For the camera code alone, the type declarations with the makers' comments are 52 KB. For the four parts this run uses they are 243 KB, and for the whole library 2.3 MB. A small model with a bounded context cannot be handed the text that won the last run. So what can stand in for the comments, in far fewer bytes, is now the question.

## The subject and what it holds

A Haiku model, effort `medium`, launched by `bench/box.py` as the screen run describes (`bench/runs/2026-11-15-screen/README.md`, "What changed in how a try is run"). It holds a box with the small app and the texts of its arm in `app/`. It can read and write files and nothing else. The library is not on its machine.

The request is the screen run's, word for word, with the paragraph for the arm.

## The tasks

The thirteen tasks of `bench/sets/scene`. Its README says where each came from. Six (S1, S2, S3, S4, S6, S7) were written from the list above: each turns on a thing the real model got wrong, checked again on release 1.39.0, with the plain answer being what that model tried, put in general terms. Seven (L2, L4, M1 to M5) were written by two writers who had not seen the list. Every task was checked by a second agent.

Eleven are code tasks and two are questions.

Each ask was read alone, before anything else of its task, by its checker, who wrote down what it asks and what is missing. The request form is the text-only run's, which two fresh readers read then. No further fresh reader is run.

## The texts

All are for Babylon Lite 1.39.0 (commit `2dddc888f6695e433ab29ae5918bee221375d86f`).

| Text | What it is | Bytes |
|---|---|---|
| `names` | the type declarations of `src/mesh`, `src/light`, `src/shadow` and `src/scene`, comments removed, cut by `box.py declarations --dirs mesh light shadow scene --no-comments` | 86,233 |
| `types` | the same with the makers' comments | 242,665 |
| `notes-1`, `notes-2` | single facts about what the library does, most needed first, by two writers | 7,254 and 7,545 |
| `recipes-1`, `recipes-2` | recipes: a goal, the calls in order, and what happens when a step is left out; most needed first, by two other writers | 6,671 and 9,575 |

**How the notes and recipes were made.** Four writers, each alone, each with the library's code and a way to run tests on it, and none with any task. Each was told who the reader is: a developer who knows Babylon.js, holds the bare declarations, and cannot see the code or run anything. Each note and each recipe had to have a test that passed. A second agent then tried to break every one, and marked it as holding, as wider than its test showed, or as false. A third agent rewrote each one marked wider, so that it states its exception, and extended its test. The counts: notes 71 in all, 42 held, 29 were wider and were mended, none false; recipes 27 in all, 18 held, 9 were wider and were mended, none false. The briefs are `WRITER-notes.md` and `WRITER-recipes.md`; each writer's list, the checker's verdicts, the mender's changes and the tests are under `writers/`.

The recipe writers were told one thing the note writers were not: that a real developer in this position lost most time on steps and not on names. They were told no topic. I wrote that sentence after seeing the list above, so the recipe arm is not blind to the kind of fault the six S tasks hold, though its writers never saw a task or the list.

The texts are rendered from the lists by `bench/notes.py`. A text carries no id, no word on who wrote it, and no word on whether it was tested.

## The arms

Three tries a task in each arm. Where an arm has two writers, tries 1 and 3 take the first and try 2 the second.

| Arm | Files in `app/` | About how large |
|---|---|---|
| `names-a`, `names-b` | `scene-api.d.ts` (bare) | 86 KB |
| `types` | `scene-api.d.ts` (with comments) | 243 KB |
| `notes` | `scene-api.d.ts` (bare) and `scene-notes.md` | 94 KB |
| `recipes` | `scene-api.d.ts` (bare) and `scene-recipes.md` | 94 KB |
| `notes-only` | `scene-notes.md` | 7 KB |
| `recipes-only` | `scene-recipes.md` | 8 KB |

`names` is run twice, with nothing changed between the two. `names-a` picks the tasks with room; `names-b` is the baseline every other arm is set against. A task picked because one round failed it will often do better the next time, so the round that picks must not be the round that is compared.

## The ceiling

An Opus model, effort `xhigh`, the same box and texts: one try a task for `names` and `types`, two tries a task for `notes` and `recipes` (one with each writer's text). It runs before the Haiku arms. The arms with no declarations get no ceiling of their own; their failures are sorted by reading and by the ceiling of the arm that has the same notes or recipes.

That a right answer exists is shown by `box.py check-tasks bench/sets/scene`: every reference passes, every plain answer fails at an assertion.

## What is counted, and the rules, fixed now

For each task and arm: how many of three tries passed. The comparison is `box.py compare`: the rule of the text-only run, with tasks drawn again, three answers (a difference was shown; no difference as large as 0.25 of the tries; cannot tell).

1. `names-a` against `names-b` first. If the rule tells them apart, it is too narrow for this run and no other answer of it is used.
2. Then, each against `names-b`: `types`, `notes`, `recipes`, `notes-only`, `recipes-only`.
3. Then `recipes` against `notes`; `notes` against `types`; `recipes` against `types`; `notes-only` against `notes`; `recipes-only` against `recipes`.
4. Each of these is also given on the tasks with room alone (those where `names-a` passed at most one try of three), and on the six S tasks alone. Those are smaller sets, and the rule will more often say it cannot tell.
5. Bytes stand beside every pass count. No rule is fixed for "passes per byte": the table is given, and a text that passes as much with a tenth of the bytes is called smaller, not better.

## How a failure is sorted

The rule of the screen run. In addition, for the arms with notes or recipes: a failure is **the text's** when no note or recipe in the try's text states what the task turns on, or when one states it wrongly; it is **the subject's** when one states it rightly and the answer still goes against it. A reader agent quotes the note or recipe, or says there is none. I read every failure sorted as the test's or as not known, every failure where a note or recipe is said to be wrong, and one in five of the rest.

## What the test takes for granted

As in the screen run. Further: every name in a text can be imported from `@babylonjs/lite`. Some checks read fields of the library whose names begin with an underscore (S1 reads `_sceneUboContributors`), because the library gives no public way to see what they hold. A subject is never asked to use such a field.

## My guesses, written before any try

I have guessed this subject too weak three times and I do not know the scene code as I know the camera code, so these are wide.

1. `names-a` and `names-b`: each passes 25% to 50% of tries; the rule does not tell them apart.
2. Tasks with room: 7 to 10 of 13.
3. `types`: 45% to 70%. More than `names`, shown by the rule or not.
4. `notes`: 50% to 75%. `recipes`: 55% to 80%. I expect recipes a little ahead of notes and expect the rule cannot tell them apart.
5. `notes-only` and `recipes-only`: 15 points or more below the same text with declarations, because a task often needs a name the short text does not hold.
6. On the six S tasks, `names-b` passes fewer than a third of tries.
7. The Opus ceiling with `names`: 40% to 65%.

## What each outcome would change

- **`names` passes most tasks.** Then this subject does not go wrong where the real small model did, and these tasks cannot stand in for that model. The texts would have to be tried on the small model itself, which only the maintainer can run.
- **Notes or recipes reach `types` or pass it, at a tenth of the bytes.** Then a short tested text can stand in for the makers' comments, and the next step is to cut it further and to see whether the order the writers gave is the order that matters.
- **Neither reaches `types`.** Then what the comments carry is not what a writer picks when asked for the most needed things, and the next step is to look at which tasks were missed and why.
- **The short text alone does as well as with the declarations.** Then for these tasks the declarations are not needed, and the smallest text is a few kilobytes.
- **Recipes clearly ahead of notes, or behind.** Then the shape of a fact matters, and the next run fixes one shape and varies the size.

## What this cannot show

One subject, one library, thirteen tasks, six of them made from one model's record. The tasks were written by models of the same family as the ceiling and as the writers of the texts; a writer of tasks and a writer of notes may think of the same things. The checks see what the library holds and computes, never a picture. Nothing here was run on a small model.

## The cost, guessed from the same kind of try

From the screen run: a Haiku try cost about half a cent and a ceiling try about 54 cents. This run has 273 Haiku tries and 78 ceiling tries, so about $1.50 and about $42. The ceiling try here reads a larger text, so it may cost more. After the ceiling's first group I write down what it cost and correct the guess.

## The order

1. `box.py check-tasks` on the set.
2. The ceiling.
3. `names-a`, then the cost so far, then the other arms.
4. Grade. A reader agent for each task reads every answer and sorts each failure.
5. `compare`, once. Then "What came" is written below.
