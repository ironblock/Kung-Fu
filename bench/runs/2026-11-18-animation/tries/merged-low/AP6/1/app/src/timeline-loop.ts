import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
  manager: AnimationManager,
  target: object,
  path: string,
  keys: readonly { frame: number; value: number }[],
  frameRate: number
): AnimationGroup {
  const clip = createPropertyAnimationClip(
    "loop-track",
    [
      {
        path,
        keys,
        frameRate,
        interpolation: "linear",
      },
    ],
    { frameRate }
  );

  return createPropertyAnimationGroup(manager, target, clip, {
    loop: true,
    fromTime: keys[0].frame / frameRate,
    toTime: keys[keys.length - 1].frame / frameRate,
  });
}
