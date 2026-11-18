# AM5: where it turns

**Behaviour.** A manager's `onUpdate` callback is called only by the manager's own requestAnimationFrame loop (`startAnimationManager`); `updateAnimationManager` never calls it.

**What the reader would write, and why.** `createAnimationManager({ onUpdate: onStep })`. The options carry `onUpdate?: (deltaMs: number) => void`, which reads as "called on each update with the step", exactly what the ask wants. Nothing in the declarations ties it to the autonomous loop: `updateAnimationManager` and `startAnimationManager` look like two ways to drive one and the same update. In Babylon.js, observers such as `onBeforeAnimationsObservable` fire however the frame is driven. So the reader has no cause to add a task of its own, and the frame log stays empty.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/animation-manager.ts`, lines 132-150: `updateAnimationManager` runs the fade hook, the blend handler and the tasks, and never reads `onUpdate`. Line 171, inside the loop of `startAnimationManager` (lines 154-175), is the only call of `manager.onUpdate`.

**Makers' unit test.** None pins the manual case. `tests/lite/unit/animation-manager.test.ts`, "uses fixed deltas for manual and autonomous updates", checks that the autonomous loop calls `onUpdate` with the step; it does not check that a manual update leaves it out.

**comment: yes.** On `AnimationManagerOptions.onUpdate` and `AnimationManager.onUpdate`: "Called after each autonomous tick with the step (in ms) that was applied."
