import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Groups currently frozen, mapped to their resume function, so a second
// freeze on the same group does not capture the reset time.
const frozen = new WeakMap<AnimationGroup, () => void>();

/**
 * Freezes a playing glTF clip at its current moment so hand-set node
 * transforms stay as set. Returns `resume`, which plays the clip on from the
 * frozen moment at its own speed and lets it drive the nodes again.
 *
 * Why stop rather than pause: a paused glTF group still writes its pose at
 * currentTime on every update, which would overwrite the user's edits. A
 * stopped group writes nothing. stopAnimation resets currentTime, so the
 * moment is saved and restored on resume. speedRatio, loopAnimation, weight
 * and mask are never touched.
 */
export function freezeForPosing(group: AnimationGroup): () => void {
  const existing = frozen.get(group);
  if (existing) return existing;

  const savedTime = group.currentTime;
  stopAnimation(group);

  let resumed = false;
  const resume = (): void => {
    if (resumed) return;
    resumed = true;
    frozen.delete(group);
    // A seek before playAnimation replays from the seek; the next update
    // adds its delta to this time.
    group.currentTime = savedTime;
    // Only playAnimation clears the stop (isPlaying = true would not).
    playAnimation(group);
  };

  frozen.set(group, resume);
  return resume;
}
