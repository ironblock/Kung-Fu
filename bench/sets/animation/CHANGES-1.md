# Changes to AG1 to AG5, first mend

Made on 2026-11-18, after an adversary passed a wrong answer through each of these five checks. Its findings are in `bench/runs/2026-11-18-animation/before-any-try/reports.json`, under "attacks". Each wrong answer it reported is now in its task as a hollow answer. Each check was mended so that every hollow answer fails at an assertion. The reference and `other.ts` still pass, and `plain.ts` still fails at an assertion. No right answer was changed. No `where.md` was changed: each still holds.

`python3 bench/box.py check-tasks` on a copy of the set that holds only these five tasks ended with `window: stub; all as they must be`.

Some answers the adversary tried also pass, and it did not count them as wrong. They are not added: in AG2, unhooking `_ctrl` and a stand-in `_animationManager`; in AG3, a rate of 60 for glTF clips, an offset by `_startTime`, a rounded frame, and stop, seek and play; in AG4, `currentTime = 0`, a step back by the duration, and setting `_stopped`; in AG5, building an include list, and calling the factory once before assigning the saved object. Each passes the mended check too.

## AG1, skip to the end

**Check.** A third test. Its clip loops. Its translation track ends on a STEP key, and it has a rotation track. After the skip, for six frames, it requires the exact last keys: x is exactly 10, and the quaternion is the last key. It also requires `currentTime` to be the duration to 9 places, and the clip not playing. `loadModel` now also builds rotation tracks and STEP samplers. The first two tests are unchanged.

**Hollow answers added.**
- `hollow-eps.ts`: pauses and sets `currentTime` to 1e-6 before the end. On a STEP key it shows the key before the last (x = 4).
- `hollow-eps-goto.ts`: seeks with `goToFrame` to 1e-4 of a frame before the end. Same fault.
- `hollow-pos-only.ts`: stops the clip and writes the last translation keys by hand. Rotations stay where the clip was.

**Ask.** No change.

## AG2, posing mode

**Check.** A third test. It freezes after seven frames of 16.7 ms, at 0.1169 s, which is on no whole frame and no whole millisecond. After resume and one more frame it requires `currentTime` 0.1336 to 6 places and the matching pose.

**Hollow answers added.**
- `hollow-round-frame.ts`: keeps the frozen moment as a whole frame at 60 per second, and seeks back to it.
- `hollow-round-ms.ts`: keeps the frozen moment rounded to 1/30 s.

**Ask.** A fresh reader took "at its own speed" two ways: keep the clip's speed setting, or reset it to 1. The check keeps the setting. Now it says which.
- Before: "Calling it makes the clip play on from the moment where it was frozen, at its own speed, and drive the nodes again."
- After: "Calling it makes the clip play on from the moment where it was frozen, at its own speed (some clips have a speed setting), and drive the nodes again."

## AG3, jump to a frame

**Check.** Two more tests. In the first, a property clip that plays once jumps to frame 90. It must play on to frame 108, then stop at its end with value 120, and stay stopped. In the second, a glTF clip at speed 1.5 jumps to frame 30. Four frames of 25 ms later, `currentTime` must be 0.65 and the pose must match.

**Hollow answers added.**
- `hollow-force-loop.ts`: seeks, turns looping on, and plays. A clip that plays once then loops and never ends.
- `hollow-speed1-gltf.ts`: seeks and plays, but resets a glTF clip's speed to 1.

**Ask.** The ask did not say what a clip that plays once must do after the jump. The check now tests it.
- Before: "... so that the next frames carry on from that point."
- After: "... so that the next frames carry on from that point. Some clips loop and some play once; each must keep doing so after the jump."

## AG4, play again

**Check.** Two more tests. In the first, a property one-shot plays frames 30 to 90 of keys 0 to 120, and has run to its end. After `playAgain` and two updates of 100 ms it must be playing, with a value above 30 and below 90. It must then run to 90 and stop. The button is pressed twice. The check does not fix which frame is the first, 0 or 30: either passes. In the second, a glTF one-shot at speed 1.5 has run to its end. After `playAgain` and 0.2 s, `currentTime` must be 0.3 and the pose must match.

**Hollow answers added.**
- `hollow-guard-duration.ts`: rewinds only when `currentTime` has reached the duration. A clip with a play range ends before that, so it is not replayed.
- `hollow-speed-reset.ts`: rewinds and plays, but resets a glTF clip's speed to 1.

**Ask.** A fresh reader took "at its own speed" two ways, as in AG2. The check keeps the speed setting, and now tests it on a glTF clip too.
- Before: "After the call it must play again from its first frame, at its own speed, and run to its end once more."
- After: "After the call it must play again from its first frame, at its own speed (some clips have a speed setting), and run to its end once more."

## AG5, restore a saved mask

**Check.** Two more tests. In the first, on one clip, it restores an include mask, then a disabled mask (every node must move), then include [Head], then include [Hips] (only Hips must move). In the second, a model has two clips that play at once on different nodes, each with its own saved mask. Each clip must keep its own mask when the other clip gets one. The check still never makes a mask through the library itself.

**Hollow answers added.**
- `hollow-skip-disabled.ts`: does nothing for a disabled mask, so the mask before stays in force.
- `hollow-in-place.ts`: keeps one mask a clip and edits its names in place. A new mask with as many names is not picked up.
- `hollow-shared.ts`: one mask object for the whole model. A mask restored on one clip changes the other.

**Ask.** The ask listed a later call on the same clip, but not a call on another clip. The check now tests that.
- Before: "... and when a later call restores another mask on the same clip."
- After: "... and when a later call restores another mask on the same clip or on another clip."
