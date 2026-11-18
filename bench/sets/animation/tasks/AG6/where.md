# AG6 — where

**Behaviour.** `goToFrame` called without an engine on a stopped glTF clip (one that was never played, or one after `stopAnimation`) sets `currentTime` and pauses, but does not apply the pose; with an engine passed, or after `playAnimation` has cleared the stop, it does.

**What the reader would answer, and why.** It would answer `true, 0.5, true, true, true`: `goToFrame` reads as "seek and show", the engine argument looks optional and only needed for GPU work, and a plain node-translation clip needs no GPU. Two fields (`neverPlayedPosed`, `stoppedPosed`) are wrong under that model. A reader who leans on Babylon.js, where `goToFrame` does nothing on a group that is not started, may answer `false` for those two, but then answers `false` for `withEnginePosed` as well, since in Babylon.js no engine argument changes that; it is wrong there instead. Neither model predicts that the engine argument decides it.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 168-183, in particular line 178: a glTF clip (no `_evaluate`) is stepped only when `engine || !group._stopped || !group._gltfMixer`. A stopped glTF clip without an engine skips the step; `currentTime` is still set at line 171.
- same file, lines 195-219: `createAnimationGroups` starts every clip but the first with `_stopped: true` (line 219).
- same file, lines 111-115 and 122-127: `playAnimation` clears `_stopped`; `stopAnimation` sets it.

**Makers' unit test.** None pins the skipped pose. `tests/lite/unit/usd-materialize.test.ts`, "preserves a %s authored animation start in direct and manager playback", seeks a stopped clip with an engine and pins that it is posed.

**comment: no.** The doc comment of `goToFrame` reads "Seek to a specific frame, apply the pose, and pause." It says the pose is applied, with no exception for stopped clips.
