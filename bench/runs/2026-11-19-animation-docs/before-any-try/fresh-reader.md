# A fresh reader on one `docs-low` message

A Sonnet agent was given the message for AM3, try 1, and nothing else, on 2026-11-19 before any try. Its report, whole:

1. The reader must write `src/skip-ahead.ts` exporting `skipAhead(manager, ms)`, which advances everything on an AnimationManager (clips, tasks, weight fades) by exactly `ms` in one call, for any positive ms (not just multiples of the fixed step), and leaves the manager behaving as before afterward, fixed step included. It must reply with every file it writes as a line `FILE: app/<path>` followed by the whole content in one fenced block, then one or two sentences on what it did and any uncertainty.

2. Nothing it is told to use is missing. Both files are pasted whole, and the "@babylonjs/lite" import is explained. Small mismatches that could cost a reader time:
- The path is given as `/home/dev/9e1a5c/app/...` but the pasted headers say `app/animation-api.d.ts`. That is fine, but it is the only place the path forms differ.
- The .d.ts files use relative imports (`./animation-manager.js`), while the task says to import from `@babylonjs/lite`. The message does not say which of these names are actually exported from the package root. The reader has to assume `AnimationManager`, `updateAnimationManager` and the others are exported there.
- It says to put the file at `src/skip-ahead.ts`, but gives no existing src layout, tsconfig or import style. That is minor.

3. No real contradiction. Things that could make a careful reader pause about the request:
- "Our game loop steps each animation manager itself" together with "fixed step... others were not" never says what `updateAnimationManager` does with `fixedDeltaMs` (split, accumulate, or ignore the delta). The reader has to infer this from the docs, which are thin on it. That is a library question more than a request question.
- "Exactly `ms`" combined with "behave on later frames exactly as before, fixed step included" is the intended tension. It is clear enough, but the reader may wonder whether temporarily changing `fixedDeltaMs` and restoring it is allowed. It reads as allowed.
- "Please keep every change inside /home/dev/9e1a5c/app" while the reply format is only `FILE: app/<path>` is consistent.
- "Tell me in a sentence or two" is fine, though the reply must also contain the file blocks. The final instruction on line 1191 covers this.

4. Partly. Line 3 says the second file is "the makers' own document about that code", so a reader knows it is the library authors' doc. It does not say it is authoritative over the reader's memory of other libraries. It does not say that the .d.ts is the newer or more accurate source where the two disagree, and they do disagree in places. For example, the doc's `AnimationTask`, `AnimationManager` and `TargetPath` lack fields the .d.ts has (`_update`, `_preUpdate`, `_taskCategoryHandler`, PATH_POINTER). A careful reader would trust the files over memory of Babylon.js, since the message says "Read them first" and "the library is not on this machine". But the message never states which of the two wins in a conflict. It also does not say that the "Babylon Lite" API differs from Babylon.js, so the Babylon.js equivalence table in the doc could pull a reader toward Babylon.js behaviour.

5. Other faults of the message:
- The document is long, and the task relevant parts (manager tick, fixedDeltaMs, fade jobs, category handlers) are few. The message does not point to them, so a reader can miss that `_preUpdate`, `_taskCategoryHandler` and the weighted mixers exist only in the .d.ts.
- "Tasks" and "clips" and "weight fades" are named as the three things to advance, but the message does not say whether fades are plain tasks or are held in separate state. A reader cannot tell from the message alone whether stepping through `updateAnimationManager` covers them.
- The reader is told it "cannot open files or run anything" but is also told to "Read them first". This is harmless, since the files are inlined, but "Read them first" is slightly odd.
- The message says "I call `skipAhead`" and "the game loop steps each manager itself" but does not say whether `manager.running` (autonomous rAF mode) can be true when `skipAhead` is called. The reader may need to handle it, and cannot ask.
- There is no stated TypeScript strictness, target or lint rules.
