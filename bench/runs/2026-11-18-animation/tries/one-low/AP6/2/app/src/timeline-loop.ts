import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
  manager: AnimationManager,
  target: object,
  path: string,
  keys: readonly { frame: number; value: number }[],
  frameRate: number
): AnimationGroup {
  const clip = createPropertyAnimationClip(
    "looped-track",
    [
      {
        path,
        keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
        frameRate,
        interpolation: "linear",
      },
    ],
    { frameRate }
  );

  const firstTime = keys[0].frame / frameRate;
  const lastTime = keys[keys.length - 1].frame / frameRate;

  return createPropertyAnimationGroup(manager, target, clip, {
    loop: true,
    fromTime: firstTime,
    toTime: lastTime,
  });
}
