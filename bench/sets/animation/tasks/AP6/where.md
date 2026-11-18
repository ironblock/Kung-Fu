# AP6 where

**Behaviour.** A property clip's timeline starts at time 0, not at its first key: its duration is the last key's time, and a group's default play range is 0 to that time, so keys that start late are preceded by a hold on the first value in every loop.

**What the reader would write, and why.** It would build the clip from the frames and the frame rate and make a looping group with no `fromFrame` or `toFrame`. In Babylon.js an `AnimationGroup`'s range is taken from its animations' keys (`from` is the smallest first-key frame, `to` the largest last-key frame), so a group plays and loops just the keyed span. The d.ts shows `fromFrame?` and `toFrame?` as optional, which reads as "defaults to the clip's range". Here the property sits at the first key's value for `firstFrame / frameRate` seconds before it moves, and again after every loop.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`: lines 93-99 set the clip's duration to the largest last-key time, measured from 0; lines 140-141 default the range to `fromTime = 0` and `toTime = clip.duration`.

**Makers' unit test.** None. The looping cases in `tests/lite/unit/property-animation.test.ts` all have a first key at 0 or pass `fromFrame` themselves.

**comment: no.** `createPropertyAnimationClip`: "@returns The compiled clip, with its duration set to the longest track." It does not say the duration, or the default range, is counted from 0.
