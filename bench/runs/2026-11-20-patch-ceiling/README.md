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
