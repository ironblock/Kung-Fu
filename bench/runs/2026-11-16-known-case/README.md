# The known case: do the tasks made from a model's record hold that model's failure?

Written 2026-11-16 by Claude Fable 5.2, before any try of this run. The question is a second session's, from its reading of the scene run.

## Why

Six tasks of `bench/sets/scene` (S1, S2, S3, S4, S6, S7) were made from a record of a small open-weights model building a scene with this library. Each turns on a thing that model got wrong. In the scene run a Haiku model passed half of them with bare declarations, and a stronger model did no better. I read that as "this subject is too strong". The rows do not show it. Two readings are open:

- **the subject**: the model in the record would fail these tasks;
- **the form of the task**: each task gives one ask and the declarations of the right four parts of the library. The record was a long job in the whole library. The model had to find the part itself, and saw its faults only as a wrong picture.

No small model has run these tasks. This run puts the model that made the record on them. If it passes them, the tasks do not hold its failure, and no text can be tested on them for that model.

## What is run

The six S tasks. One message and one reply a try, through `bench/small.py`. Three tries a task.

| Arm | Run where | Files in the message | About how large |
|---|---|---|---|
| `names-haiku` | here, a Haiku model through the local program with no tools | the bare declarations of `src/mesh`, `src/light`, `src/shadow` and `src/scene` | 86 KB, about 25,000 tokens by the estimate |
| `names-small` | on the maintainer's machine, the model that made the record | the same | the same |
| `recipes-small` | the same machine and model, if the rule below says so | the declarations and the scene run's recipes | about 27,000 tokens |
| `notes-small` | the same | the declarations and the scene run's notes | about 27,000 tokens |

The texts are the scene run's, byte for byte. `bench/SMALL-MODEL.md` says how to run an arm on another machine. The declarations are cut by `box.py declarations --dirs mesh light shadow scene --name scene --no-comments`, and must come to 86,233 bytes with the sha256 in `run.json`.

Give `--temperature` and `--max-tokens` on the command line, so that the record holds them. A model that reasons needs room: the message is about 25,000 tokens, and the reply's limit comes on top.

## What differs from the record

The model in the record had tools, could run its code and look at a picture, had the whole package on disk, worked on release 1.35.0, and met each of these things in the middle of a long job. Here it gets one ask, four parts' declarations in the message, release 1.39.0's behaviour in the check, and one reply. So a pass here does not say the record's failure was not real. It says this form of task does not bring it out.

## The rules, fixed now

1. **The tasks hold the failure** when `names-small` passes at most 6 tries of 18. **They do not** when it passes at least 12. Between the two: partly.
2. If they hold it, or partly: run `recipes-small` and `notes-small`. Six tasks are too few for the comparison rule, so the result is given as counts by task, and nothing is called shown.
3. If they do not hold it: stop. The texts cannot be tested on these tasks for this model.
4. **The same form, the same picture.** In the box form the Haiku subject passed 8 and 9 of these 18. `names-haiku` gives the same picture when it passes 5 to 12.
5. A try cut off by its length limit is not in the pass counts. It is counted beside them, and may be launched again with more room.

Every failure of `names-small` is read against the record: each task's `where.md` says what the record's model did, and a reader says of each failure whether it is that fault or another. A task that the model fails in some other way does not hold the record's failure either.

## My guesses

1. `names-haiku`: 7 to 11 of 18.
2. `names-small`: at most 7 of 18. I hold this loosely. The other reading predicts 9 or more, and my guesses about how weak a subject is have run low all through this project.
3. If they are run: `recipes-small` at least three tries above `names-small`, most of it on S1 and S2, where a recipe's code carries the call and its values.

## What each outcome would change

- **The tasks hold the failure.** Then this form is a fair stand-in for where that model goes wrong, and texts can be tested on it: these arms first, then the camera runs.
- **They do not.** Then the failure lives in the long job: in finding the part, and in seeing only a picture. A text cannot be tested on these tasks. The next instrument would have to be a longer job with a check at its end, or a task that does not hand over the right part.
- **Either way** these are the first numbers for a small model, and the first for a subject that is not of the family that wrote the tasks and the texts.

## What this cannot show

One model, six tasks, three tries each. A difference of one or two tries is nothing. The tasks' checks see what the library holds and computes, never a picture.

## The order

`names-haiku` here. Then, on the maintainer's machine: `names-small`; the rule; the two other arms if it says so. Grade, read every answer, sort every failure, and then "What came".
