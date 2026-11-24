# AG8 — where

**Behaviour.** `runFrameInterpolation` hands its step `deltaMs / 1000` only when the frame's delta is positive; a frame with a delta of 0 or less is replaced by a nominal 1/60 s, so an interpolation keeps moving on frames where no time passed (small positive deltas, such as 1 ms, are passed through unchanged).

**What the reader would answer, and why.** It would answer `0, -5, 1, 40` (or `0, 0, 1, 40` if it guesses a clamp at zero). The step's type is `(deltaSeconds: number) => boolean`, which reads as "the frame's delta in seconds", and Babylon.js passes the engine's delta through as it is. No name hints at a substitute step. A reader who guesses a minimum frame time instead would also get `oneMsFrame` wrong. Two fields (`zeroMsFrame`, `negativeFrame`) are wrong under the plain model.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/frame-interpolation.ts` line 80, in the driver at lines 74-93: `const deltaSeconds = (deltaMs > 0 ? deltaMs : 1000 / 60) / 1000;`.
- The scene hands each per-frame callback the engine's current delta (`src/scene/scene-core.ts` lines 381-389), which `stepScene` sets (`src/engine/null-engine.ts`).

**Makers' unit test.** `tests/lite/unit/frame-interpolation.test.ts`, "falls back to a 60 FPS step for a non-positive delta".

**comment: no.** The doc comment of `FrameInterpolationStep` reads "Called once per rendered frame with the frame's delta time in seconds." with `@param deltaSeconds - Elapsed time since the previous frame, in seconds.` Both say the opposite of the substitution. The comment that states it ("Fall back to a nominal 60 FPS step when the render loop reports a non-positive delta") is a `//` comment inside the function body, which the compiler drops.
