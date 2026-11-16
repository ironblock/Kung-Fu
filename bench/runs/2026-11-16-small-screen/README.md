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
