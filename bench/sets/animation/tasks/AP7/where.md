# AP7 where

**Behaviour.** A four-number property track is interpolated as a rotation only if its path is `rotationQuaternion` or ends in `.rotationQuaternion`, or it has `quaternion: true`; on those paths `quaternion: false` does not turn it off, and on any other path the four numbers change component by component with no normalizing.

**What the reader would write, and why.** It would answer `false, 0.5 (or 0.7071), false, false, true`. In Babylon.js the interpolation follows the animation's data type (`ANIMATIONTYPE_QUATERNION`), which the caller chooses, never the property's name. Lite's `PropertyAnimationTrackOptions` has `quaternion?: boolean`, which reads as that type flag: off unless set, and `false` meaning plain. So the reader expects the `rotationQuaternion` paths to change component by component too, and `quaternion: false` to make them plain.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`, line 105: `quaternion: track.quaternion === true || track.path === "rotationQuaternion" || track.path.endsWith(".rotationQuaternion")`. `evaluate.ts` (`interpolateLinearSample`, lines 109-123) then slerps or interpolates each component.

**Makers' unit test.** For the name part, `tests/lite/unit/property-animation.test.ts`, "applies eased progress to quaternion slerp" (path `rotationQuaternion`, no option, expects the slerped value). None for the other path or for `quaternion: false`.

**comment: no.** `quaternion?` carries no comment in `PropertyAnimationTrackOptions` or `PropertyAnimationTrack`.
