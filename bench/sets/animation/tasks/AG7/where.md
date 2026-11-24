# AG7 — where

**Behaviour.** The scene's per-frame tick skips any clip that is attached to an `AnimationManager`: once attached, only updating that manager advances it (so updating the manager each frame advances it once, not twice), and after `removeAnimationGroup` the scene drives it again. Clips of the same model that are not attached go on as before.

**What the reader would answer, and why.** It would answer `true, 0.5, true, true`. In Babylon.js every playing group is advanced by the scene, and there is no second driver to hand a group over to. Nothing in `addAnimationGroup(manager, group)` says the scene lets go of the group, so a reader expects the scene to keep advancing it, and a manager update on top of that to advance it a second time. Two fields (`sceneAdvancesAttached`, `timeWithManagerUpdated`) are wrong under that model.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 155-160: `tickAnimationImpl`, the scene's tick for a group, returns at once when `group._animationManager` is set.
- same file, lines 162-166: that function is what the scene's tick forwarder (`src/animation/animation-tick.ts` lines 23-25) calls for each group of an added asset (`src/scene/scene-core.ts` lines 515-526).
- The flag is set and cleared by `addAnimationGroup` / the group task's dispose in `src/animation/animation-group-task.ts` (line 83, and lines 69-71 of the task's dispose).

**Makers' unit test.** `tests/lite/unit/scene-animation-tick.test.ts`, "defers to an AnimationManager: does not advance a manager-owned group".

**comment: no.** The field `_animationManager` is documented "The AnimationManager that currently owns/drives this group, if any. Set by addAnimationGroup." It says the manager drives the group but not that the scene stops doing so. The explanation of the skip is on `tickAnimationImpl`, a function that is not exported, so the compiler does not carry it.
