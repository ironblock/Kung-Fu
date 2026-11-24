# AP1 where

**Behaviour.** A group made by `createPropertyAnimationGroup` loops unless `loop: false` is passed.

**What the reader would write, and why.** It would make the clip and the group and pass no `loop` option, or only a duration. In Babylon.js every way of playing an animation defaults to not looping: `scene.beginAnimation`, `scene.beginDirectAnimation` and `AnimationGroup.start` and `play` all take `loop` as an optional flag that is off unless set. `CreatePropertyAnimationGroupOptions` shows `loop?: boolean` with nothing to say otherwise, and a fade "plays once", so the reader has no reason to turn looping off. Here the fade then wraps: once `durationMs` has passed, alpha jumps back near 0 and rises again, and `isPlaying` never turns false.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`, line 147 (`group.loopAnimation = options?.loop ?? true;`) and line 176 (`loop: options?.loop ?? true,` in the controller), with line 212 for the group record. The controller's `tick` (lines 186-199) wraps the time when `loop` is on and only ends the group when it is off.

**Makers' unit test.** None. Every case in `tests/lite/unit/property-animation.test.ts` that needs a one-shot passes `loop: false`; none checks the default.

**comment: yes.** On `AnimationGroup.loopAnimation` in `animation-group.ts`: "Whether animation loops (default true)." It is on the group's field, not on the options of `createPropertyAnimationGroup`, and the d.ts the reader holds carries no comments.
