# AM3: where it turns

**Behaviour.** When a manager has `fixedDeltaMs` above 0, `updateAnimationManager(manager, deltaMs)` ignores `deltaMs` and advances everything, clips and weight fades, by the fixed step.

**What the reader would write, and why.** `updateAnimationManager(manager, ms)`. The function takes an explicit delta, so the reader expects that delta to be applied, and takes `fixedDeltaMs` to be what the manager's own loop uses when nobody passes a delta. That is how Babylon.js works: `scene.animate()` with a custom delta uses it even when `useConstantAnimationDeltaTime` is on; the constant 16 ms only replaces a measured delta. A reader who does doubt it would step in whole fixed steps, which misses any time that is not a whole number of steps.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/animation-manager.ts`, line 133: `const step = manager.fixedDeltaMs > 0 ? manager.fixedDeltaMs : deltaMs;`. Lines 137-149 then pass `step`, not `deltaMs`, to the fade hook, the blend handler and every task.

**Makers' unit test.** `tests/lite/unit/animation-manager.test.ts`, "uses fixed deltas for manual and autonomous updates": `updateAnimationManager(manager, 1)` on a manager with `fixedDeltaMs: 25` gives the task a step of 25.

**comment: yes.** On `updateAnimationManager`: "Advances every active task by `deltaMs` (or by `fixedDeltaMs` when set), running the category handler first. Ignores non-finite or negative steps."
