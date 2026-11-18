# AP5 where

**Behaviour.** Once a property group is blended (blending on, weight not 1), its play range is cut back to the clip's keys: a `toTime` past the last key is ignored, so a loop that held the last value until `toTime` now wraps at the last key.

**What the reader would write, and why.** It would key only the flash (0, 1, 0 over 0.2 s), make the group with `loop: true` and `toTime: periodSeconds` so the lamp holds 0 for the rest of the period, call `enablePropertyAnimationBlending(manager)`, and set the strength with `setAnimationWeight(group, strength)`. In Babylon.js a `to` frame past the last key simply holds the last value until `to`, whatever the weight, and weighting a group never changes its timing; with the lamp resting at 0, Babylon.js weight semantics also give exactly "peak at the strength". It works at strength 1. At any strength below 1 the flash repeats every 0.2 s.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/weighted-pointer-mixer.ts`, `advancePropertyGroupTime` (lines 220-252): `clipEnd` is the clip's duration (line 226; `property-animation.ts` line 149 stores `clip.duration` there), and line 228 takes `Math.min(mixer[MIX_TO], clipEnd)` as the end of the range, which line 237 wraps on. The unblended controller in `property-animation.ts` (lines 182-194) uses the full `toTime`. Line 79 and line 116 decide that a group whose weight is not exactly 1 goes through the mixer's timing.

**Makers' unit test.** None.

**comment: no.** No comment on the mixer, on `setAnimationWeight` or on `CreatePropertyAnimationGroupOptions` mentions the range.
