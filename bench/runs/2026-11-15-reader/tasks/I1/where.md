# I1: where its fact is written

Right answer: (a) resolves, (b) rejects, (c) the first call rejects. `proof.test.ts` shows all three on the library.

- **The code that decides it:** `src/camera/arc-rotate-interpolate.ts`. The first step sets the camera's five inertial offsets to zero before it records a pose (lines 111 to 119). Each later step throws when the pose is not the one it last wrote (lines 133 to 143), and the driver turns the throw into a rejection.
- **A comment in `src`:** the comment above `interpolateArcRotateCamera` says both things. "On the first frame it discards any leftover inertia", and the transition cancels if "a user drag/zoom/pan, decaying inertia, a direct pose write, or a superseding interpolation" changes the pose between frames.
- **The makers' tests that pin it:** `tests/lite/unit/arc-rotate-interpolate.test.ts`, the cases "discards leftover inertia on the first frame", "rejects when the camera is moved by something else between frames" and "lets a superseding interpolation cancel the previous one".
- **The makers' camera doc does not speak of this function.** A fresh reader found that, and `grep -c interpolateArcRotateCamera docs/lite/architecture/02-camera.md` gives 0.
- **The ledgers:** the three Opus ledgers of round five each hold a note that lists leftover inertia among the things that make the promise reject. Each checker marked that note false. The arm `ledger-cut` has those notes taken out.

This task was chosen by the person who ran the mapping rounds, because a ledger says the wrong thing about it.
