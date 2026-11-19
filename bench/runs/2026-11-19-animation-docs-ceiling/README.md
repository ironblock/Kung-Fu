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

## What came, 2026-11-19

All 48 kept, none cut off. **13 of 24 with the document, 20 of 24 with the merged notes.**

| Arm | Failed | Sorted |
| --- | --- | --- |
| `ceiling-docs` | AG1, AG4, AG6, AG8, AM1, AM4, AM6, AM7, AP2, AP7, AP8 | the text's 11 |
| `ceiling-merged` | AG5, AM1, AM6, AM7 | the text's 3, the subject's 1 (AM1) |

**With the document:**

- **Four died on a name the package does not export** (AG1, AG4, AM1, AP2). Each answer imports `getAnimationGroupOwner` from the package root and fails with "getAnimationGroupOwner is not a function". The bare declarations list it as exported; the library's index does not export it. So the fault is in the declarations text, which every arm of every animation run has had. The merged notes say so in their note 5, and no try with notes used the name. These four answers were never tested on what their tasks turn on.
- **Four follow a sentence of the document that the code contradicts** (AG6, AM6, AM7, AP8). Each sentence is one the markers had quoted as misleading.
- **Three fail where the document is silent or has two readings** (AG8, AM4, AP7). On AG8 the reply would not guess and wrote nulls.

**With the notes:**

- AG5, AM6 and AM7 fail on things no note states: that a mask is ignored until `createAnimationGroupMask` has run, and how clips mix on a skeleton. On AM6 the reply wrote no file and said the notes do not cover it.
- AM1 is the reply's own design, a start delayed by a task of its own. It is the task this reader also failed with the source in hand.

**The document against the code.** An Opus agent took each sentence the markers had quoted as misleading, 17 quotes of 11 distinct sentences on 9 tasks, and checked it against the source, with a probe for 16 of them. It found the code contradicts 13 of the 17 quotes, and the other 4 are true of the code and easy to misapply. In most of those places the document is right for one path and wrong for another: its line on paused groups fits glTF clips and not property groups at weight 1; its line on stopping fits clips that start at 0; its loop formula lacks the step that backward play needs. Its verdicts are its own; I checked none of them.

**Who read what.** Two Sonnet agents sorted the 15 failures. A third sorted all 15 blind and agreed on 11. The four it differed on are the missing-export tries: the first sorter wrote "the test's" and the blind one "the text's". I took the blind one's side, for the reason in each line, and corrected three other lines it showed to misquote or misdescribe their try. I read the sorters' reports, the six lines I changed, the library's index for the name, and note 5. I read no reply.

**Added later on 2026-11-19.** "The code contradicts 13 of the 17 quotes" is that agent's count under its own question: does the code contradict the sentence anywhere. `bench/runs/2026-11-19-doc-lint` then probed every checkable claim of the document under the reading most favourable to it. 263 of 280 hold, and the seven of these sentences it covers all hold there. Both counts stand; that note says how they fit.

