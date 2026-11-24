# The ceiling for the patch run

Written by Claude Opus 5.5 on 2026-11-22, before any try. `bench/runs/2026-11-20-patch` says what this is for, under "Before any try".

Four arms, each the 48 patch tasks once, in message form 2, sent to a Sonnet model through the local `claude` program with no tools (`small.py launch --via-claude`). The message is built as the 27B's is, from the same `request.md` and the same held texts. 192 tries.

| Arm | The reader holds |
| --- | --- |
| `name` | the file's path |
| `outline` | the path, and the file's outline |
| `region` | the path, the outline, and the lines of each declaration the ask names |
| `whole` | the whole file |

Here every arm has every task, so the ceiling also says what the 27B's arms were not sent: `region` on the `beside` tasks, and `outline` on the others three times over.

What each is read for:

- **`whole`:** whether each task can be passed as it is worded, with the whole file. A task this arm fails is read first. If the fault is the task's, the task is mended and the ceiling is sent it again, and the mend is written down here with its date.
- **`region` and `outline`:** which of the 27B's failures are the arm's. A task a stronger reader fails with exactly what the arm holds is one the arm may not hold enough for.
- **`name`:** what a stronger reader does when it holds nothing of the file.

`patch.py report`, `rule` and `shapes` read this folder as they read the run's. One try a task says little about any one task. It is read task by task, and no rule is asked of it.

My guesses are in the run's note, under "The ceiling".

## Sent, 2026-11-22

Set up with `python3 bench/box.py setup bench/runs/2026-11-20-patch-ceiling`, which set up 192 tries. First one group, to count the cost:

    python3 bench/small.py launch bench/runs/2026-11-20-patch-ceiling --via-claude sonnet --arm whole --task PA1 --task PA2 --task PP1 --task PP3 --parallel 4

The four were kept and none was cut off. Each took 4,004 to 14,406 tokens in (its first request) and 356 to 496 out. From that I guessed the whole ceiling at about 700,000 tokens in and 90,000 out. Then the rest, the same command with no `--arm` or `--task`.

The set was sent while `box.py check-tasks` was still running on it, after the sixteen menders had each run it on their own file and seen it end `all as they must be`. If the whole set's check finds a fault in a task, that task is mended and its ceiling tries are sent again, and that is written here.

## What came, 2026-11-22

All 192 kept, none cut off, and none refused an edit. Graded by `python3 bench/box.py grade bench/runs/2026-11-20-patch-ceiling`. Then eight reader agents of an Opus model read every try, two files each, and sorted every failure by the rule in the run's README. I checked three of their sorts against the files, the less plain ones, and took them all. Each failure's line is in its `whose.txt`. How each pass was made, in the readers' words, and what they found in the tasks, are in `passes.md`.

| Arm | `beside` | `inside` | `leans` | All | My guess |
| --- | ---: | ---: | ---: | ---: | --- |
| `whole` | 16 of 16 | 16 of 16 | 16 of 16 | 48 of 48 | 44 to 48 |
| `region` | 16 of 16 | 16 of 16 | 4 of 16 | 36 of 48 | 15 or 16 `inside`; 4 to 10 `leans` |
| `outline` | 16 of 16 | 9 of 16 | 2 of 16 | 27 of 48 | 14 to 16 `beside`; no more than 2 of the other 32 |
| `name` | 5 of 16 | 0 of 16 | 0 of 16 | 5 of 48 | 0 to 2 |

**Every one of the 76 failures is the arm's.** None is the subject's, the test's or not known.

- **`whole` passed every task.** So every task can be done as it is worded. No task was mended, and nothing was sent again.
- **`region` failed 12 of the 16 `leans` tasks, each on the fact it leans on,** and each reply said it had assumed what the other body does, or that it could not see it. Of its 4 passes, PB3 hedged against two readings of the other body, PL3 asked `inForce` at run time which day is the last, and PE3 and PK3 guessed the fact and guessed right. On PE3 and PK3 every arm that lacked the fact guessed right, so for this model those two tasks do not tell holding the fact from guessing it.
- **`outline` passed 9 `inside` and 2 `leans` tasks, all eleven by the way round.** `patch.py shapes` finds a new declaration in all eleven, and the old body kept whole under another name in ten. The eleventh, PE2, patched the class's prototype to call the old method. Where it could not see a way round, it said so and gave no patch: 11 of the 32 `inside` and `leans` tries. It made up no text to replace.
- **`name` passed 5 `beside` tasks from the ask alone:** PA1, PB1, PI1, PL1 and PN1. Each of those asks gives the signature and the rule, and the reply guessed the field names and added at the end of the file. On the 32 other tasks it gave no patch, and said it could not see the file.
- **No pass failed `tsc --strict`.** Five `name` files fail it, none of them a pass.
- **Cost:** 138,575 output tokens, and $5.01 as the stream reports it. My guess of about 90,000 out, from the first four, was a third low. No try kept its reasoning: the local `claude` program gives none back, though each counted thinking tokens. So nothing is explained from the reasoning here.

**What the readers found in the tasks, and what I did.**

- **Eight `where.md` files said wrong things,** and each now has a dated correction under it: five said an edit copied from the outline is refused for its indent or a missing `;` (PD1, PG1, PH1, PM1, PN1), which the bench's text match does not do; PN1 said an empty SEARCH that adds a method at the end cannot load, and a prototype assignment can; PO2 said its wrapper needs nothing from the old body, and it needs one fact; PJ2 said the body is needed, which is true only to change it in place; PC3 sorted a `region` failure against the run's rule.
- **The run's note said the same wrong thing about the indent,** and now has a dated correction.
- **The way round is now known in thirteen files,** keys among them.
- **Several `beside` tasks hold a region that is their outline,** and three hold a whole class. The 27B is not sent `region` on `beside` tasks, so this changes no question.

**What it changes for the 27B's run.** Nothing in its design: `whole` passed every task. My guesses for the 27B stand as written. The ceiling suggests the outline may pass more `inside` tasks than I guessed, by the way round, if the 27B finds it. The ceiling is a stronger reader, and one try a task, so it says only what is possible.
