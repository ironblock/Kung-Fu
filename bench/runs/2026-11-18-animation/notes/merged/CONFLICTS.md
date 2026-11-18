# Conflicts

Two cases. In both, members of one group disagreed. In both, the library was run through the
probes in `merged/probes/` (command in `MERGE.md`), one member's text matched what it did, and
that text was kept word for word. No new text was written.

## 1. What goToFrame sets currentTime to (merged note 6)

- an-2#6: "goToFrame sets currentTime to frame / group.frameRate, writes the pose at once
  without an update, and pauses the group".
- an-3#6: "goToFrame seeks to frame / group.frameRate seconds and pauses the group".
- an-1#16: on a property group the time is "clamped to 0..clip duration rather than to the play
  range".
- an-1#46 and an-3#32 (merged note 49): a stopped glTF group gets no pose from goToFrame unless an
  engine is passed. This goes against "writes the pose at once" in an-2#6.

What the library does:

- `goto-frame-property.test.ts`: a clip of 2 s at 10 fps. `goToFrame(group, 50)` gives
  currentTime 2, not 5, and writes 20. `goToFrame(group, -5)` gives currentTime 0. The play range
  (frames 5 to 10) does not limit it.
- `gltf-goto-frame.test.ts`: `goToFrame` on a glTF group that was never played, or was stopped,
  sets currentTime but leaves the node where it was. Passing `createNullEngine()` writes the pose.
- The library code agrees: `goToFrame` sets `frame / frameRate`, then a property group's
  evaluation clamps the time, and a stopped glTF group with no engine is not ticked.

Kept: an-1#16. Its probe is `goto-frame-property.test.ts`.

## 2. Which 4-value tracks are slerped (merged note 18)

- an-2#30: a rotationQuaternion path is slerped "without quaternion: true. Other size-4 tracks
  interpolate each component." Read as written, a track with `quaternion: true` on any other path
  is lerped.
- an-1#23 and an-3#22: a track slerps when its path is or ends in rotationQuaternion, or when it
  has `quaternion: true`.

What the library does:

- `quaternion-slerp-rule.test.ts`: a track on path `q2` with `quaternion: true` gives y of about
  0.7071 halfway from (0, 0, 0, 1) to (0, 1, 0, 0), which is a slerp. The same keys on path `q`
  with no flag give (0, 0.5, 0, 0.5), a per-component lerp that is not normalized. an-2's own probe
  `interp-quaternion.test.ts`, run in place with the other lists' probes, shows the same for its
  flagged track `r`.

Kept: an-3#22. Its probe is `quaternion-slerp-rule.test.ts`. The fact that the slerp takes the
short way (an-2#30) is not in the kept text.

## Looked like conflicts, but were not

These were checked against the probes. Each pair is true together, so nothing was changed.

- "A paused property group stops writing" (merged notes 7 and 54) and "under
  enablePropertyAnimationBlending a paused group of weight below 1 still writes" (merged note 32).
  The second names its condition. `group-pause-stop.test.ts` shows a paused group writing nothing
  with no blending. `blend-zero-paused.test.ts` shows a paused group at weight 0.5 still writing
  under blending.
- "The mix is the plain sum of value x weight" (merged note 12) and "a rotationQuaternion sum is
  normalized" (merged note 62). The second names its condition, and
  `blend-quaternion-normalized.test.ts` shows it.
- "addAnimationTask sets active to true" (merged note 66, an-2#54) and "addAnimationTask to its
  own manager does not set active back to true" (an-1#44). Adding a task its manager already holds
  does nothing, so both hold.
- "A task removed during an update does not run in it" (an-2#34) and "one removed during an
  update before its turn does not run" (an-1#31, kept). A task that removes itself has already run.
  The kept text is the exact one.
- "A group of weight below 1" (an-2#21, an-2#45) and "weight other than 1" (an-1#12, an-3#18,
  an-3#37). A weight above 1 can only be set by assigning group.weight, which is not checked
  (merged note 36). an-3's own probe `weight-validation.test.ts` shows weight 2 doubling a share.
  The kept texts say "other than 1" or "not 1".
- The signal reason on abort: an-1#34 says it is "wrapped as an Error", an-2#28 says the promise
  "rejects with signal.reason". The library passes the reason through when it is an Error, as an
  AbortError is, and wraps anything else. Both hold.
