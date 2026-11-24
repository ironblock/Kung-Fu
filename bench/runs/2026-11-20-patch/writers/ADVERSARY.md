# Brief for the adversary of one file's three tasks

Written by Claude Fable 5.2 on 2026-11-20. Read `bench/runs/2026-11-20-patch/README.md` and `bench/runs/2026-11-20-patch/writers/WRITER.md` first: the second says what the writer was asked for.

You are given a work directory `W` that holds one module and its three tasks, written by another agent. You did not write them. Your job is to find what is wrong with them before a model is measured on them. Mend nothing in the writer's files. Add files only where this brief says.

## 1. Pass each check with a wrong answer

For each task, write whole files that do not do what the ask asks, or that change something else in the module, and see whether the check passes them. Try at least these:

- the ask done in a wrong but likely way: a clause left out, an edge handled the other way, a unit confused;
- the ask done right, with one other function or method changed a little: an end of a range moved, an order turned round, a rounding changed, a default altered. Do this for at least four different functions of the module, so that the regression helper is tested across the file;
- for the `leans` task, the natural wrong guess about the other declaration, in more than one form.

Put each as `W/tasks/<id>/hollow-adv-<n>.ts` and run:

```sh
cd /home/user/Kung-Fu && python3 bench/box.py check-tasks W --window none
```

A line `WRONG <id> hollow-adv-<n> passed` means your wrong answer got through: a breach. Keep every breaching file. Delete those the check failed, except one or two that came close.

## 2. Is the check fair?

Write, for each task, one right answer of your own from the ask and the module, without looking at `reference.ts`, in a different style from the writer's where the ask allows. Put it as `W/tasks/<id>/other.ts`. `check-tasks` requires it to pass. If it fails, read why. Either you misread the ask, or the check tests something the ask does not say, or the ask has two readings. Say which, and quote the words.

## 3. Is each task of its kind?

Read `W/tasks/<id>/holds/outline.md` and `region.md` as their reader would: these are all that reader has of the file.

- `beside`: is everything a right answer needs in the ask and in `outline.md`? Name anything that is only in a body or a comment.
- `inside`: is everything in the ask and `region.md`? Could the change be written from the outline alone, without the body? If so it is not an `inside` task.
- `leans`: does the ask give the fact away? Does `region.md` show it? Does the other declaration's first line show it? Is the natural guess really wrong, and is the fact plain to a reader of the whole file? Would a careful reader of `region.md` see that the other declaration matters?

## 4. The module

- Is anything in it broken, or changing from run to run?
- Does it read as real code?
- Does `python3 bench/holds.py check W` end `all as they must be`?

## What you hand back

For each task: the breaches, each with the file and one line on what it gets wrong; whether `other.ts` passed, and if not, why; and what you found about its kind. Then what you found about the module. Be exact: quote the ask's words and the check's lines.
