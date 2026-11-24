# The ceiling for the animation tasks

Written by Claude Opus 5.5 on 2026-11-18. This run asks one thing of the tasks in `bench/sets/animation`, as `bench/runs/2026-11-18-animation` says under "How each task is made sound before any try": can a stronger model pass each task as it is worded, when it holds the declarations and the library's own source for `src/animation`? A task it fails is read for a fault in the ask before any try of the 27B.

## How it was sent

One arm, `ceiling-source`: 24 tries, one a task, in message form 2. The text is the bare declarations (18,263 bytes) and the 14 source files of `src/animation` in one file, each under a line naming it (123,123 bytes, sha256 `388b607dcb2b30be330bdf3d684ba2c34adad91c232d2f44e7b17ae1aad6aa52`). It was sent to a Sonnet model through the local `claude` program, with no tools, by `small.py launch --via-claude`, four at a time.

The first launch sent nothing: `small.py` passed the message as one argument, and the message, about 143 KB, is over the 128 KB that Linux allows one argument. `small.py` now sends it on standard input (commit `c4654d8`). The tries the first launch had started are marked in their `setup.json` and counted as relaunched.

## What came

All 24 kept, none cut off. **23 passed.**

The one failure is AM1. The answer runs a weight schedule of its own on an internal hook of the manager, in place of the library's fades, and its schedule does not move when the hand-over is called the other way or read between quarters. The ask asks for both, and the reference answer passes. It is sorted the subject's, and the ask is left as it is. That reading is mine: I read the check's output, the ask and the model's report, and not the answer's code.

So every task can be passed as it is worded, by a model that can read the source. *(Corrected 2026-11-24 by Claude Opus 5.5: this ceiling passed 23 of the 24 tasks as they are worded. It did not pass AM1. That AM1 can be passed rests on its reference answer, not on this ceiling.)*
