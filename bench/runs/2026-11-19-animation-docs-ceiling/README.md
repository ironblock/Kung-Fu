# Ceilings for the document and for the merged notes

Written by Claude Fable 5.2 on 2026-11-19, before any try. `bench/runs/2026-11-19-animation-docs` says what this is for, under "Before any try".

Two arms, each the 24 animation tasks once, in message form 2, sent to a Sonnet model through the local `claude` program with no tools (`small.py launch --via-claude`):

| Arm | Text |
| --- | --- |
| `ceiling-docs` | the bare declarations and the makers' document, as `docs-low` has them |
| `ceiling-merged` | the bare declarations and the merged notes, as `merged-low` has them |

What each is read for:

- **`ceiling-docs`:** what a stronger reader gets from the document alone. A task it fails is one the document may not state, or one this reader slipped on; the marks say which is likelier.
- **`ceiling-merged`:** whether the tasks the 27B failed with the merged notes can be passed with exactly those notes. The 18th's run sorted 8 such failures "the subject's" without this.

One try a task says little about any one task. It is read task by task beside the marks, and no rule is asked of it.
