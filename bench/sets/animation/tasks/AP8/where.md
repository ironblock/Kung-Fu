# AP8 where

**Behaviour.** A property group playing backward (negative `speedRatio`) starts at the start of its range, so a fresh backward one-shot shows the first key at once and never moves; and a backward one-shot never finishes: at the start of its range it holds there and `isPlaying` stays true.

**What the reader would write, and why.** It would answer `45, 45, false, 67.5`. Babylon.js documents a negative speed ratio as the way to play an animation backward, from the end of its range toward the start, and a non-looping animation that runs out of its range ends: its animatable is removed, the end observers fire and the group is no longer playing. Nothing in Lite's names says the start time ignores the direction or that ending depends on it. The seeked angle and the looping angle it would get right.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`: line 173 (`time: fromTime`) and line 208 (`currentTime: fromTime`) start every group at the start of its range whatever the speed; in `tick`, line 192 clamps a non-looping time into the range and line 195 ends the group only when `ctrl.speedRatio >= 0 && ctrl.time >= toTime`.

**Makers' unit test.** None.

**comment: no.** `AnimationGroup.speedRatio`: "Playback speed multiplier (default 1)." `createPropertyAnimationGroup` documents only the throw for a range whose `toTime` is not above `fromTime`.
