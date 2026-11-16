# Does one message and one reply measure the same thing as a box?

Written 2026-11-16 by Claude Fable 5.2, before any try of this run.

## Why

Four runs used a Haiku model in a box, with tools to read and write files. They showed that this subject is too strong to stand in for the small model the project is about. That model is hosted by the maintainer, may have no tool calls, and has a bounded context. `bench/small.py` was built to run it: the subject gets one message, with the request and every file in it, and gives one reply with its files in it. `bench/SMALL-MODEL.md` says how.

That is another form of test. Before a small model's numbers are set beside the numbers in this repository, this run asks what the change of form alone does, with the subject held the same.

## What is run

A Haiku model, effort `medium`, through `small.py launch --via-claude`: the same message a small model would get, sent through the local program with no tools. The 23 camera tasks of the union run. Two arms, three tries a task, 138 tries:

| Arm | Files in the message | The box form's count, from `bench/runs/2026-11-15-camera-union` |
|---|---|---|
| `names` | the bare declarations (14,002 bytes) | 35 of 69 |
| `union` | the bare declarations and the merged notes (15,260 bytes) | 63 of 69 |

The request is the box form's, word for word. It still speaks of a box and of reading files; the files follow in the same message. That mismatch is part of what is being measured.

## The rule, fixed now

The one-shot form "gives the same picture" when both of these hold in each arm:

1. its count is within 6 tries of the box form's count;
2. on at least 19 of the 23 tasks the two forms agree on whether most tries passed (two or three of three).

If it does not, I read the answers of the tasks that differ and write down what differs.

No comparison of `union` against `names` is made by a rule here. The union run made it.

## Sorting failures

A reader agent reads every answer of each task where the two forms differ by two tries or more in an arm, and sorts those failures. The other failures are not sorted. They are failures of the same tasks with the same texts that were sorted on 2026-11-15, and the question here is the form. This is less than the rule for a run asks, and `tally --strict` is not run.

## My guesses

1. `names`: 30 to 38 of 69. `union`: 55 to 64.
2. The same picture, by the rule.
3. Where the forms differ, the one-shot form loses on code tasks, where a subject in a box read its text more than once or looked at what it wrote; and it loses nothing on the questions.

## What each outcome would change

- **The same picture.** Then a small model's one-shot numbers can be read against the box numbers of this subject, with the form taken as no large part of any difference.
- **A different picture.** Then the form is part of every such difference, and a small model must be compared with this subject in the one-shot form only. This run then is that baseline.

## What this cannot show

How a small model takes the one-shot form. A subject with tools taken away is not a subject that never had them. The local program adds a few thousand tokens of its own around the message, which an endpoint would not.

## The cost, guessed from the same kind of try

138 Haiku tries at under a cent each: about $1.

## The order

`names`, then `union`. Grade. Compare the counts and the tasks with the union run's. Readers for the tasks that differ. Then "What came".
