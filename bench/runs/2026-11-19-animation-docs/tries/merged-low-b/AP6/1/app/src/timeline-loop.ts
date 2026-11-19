import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
  manager: AnimationManager,
  target: object,
  path: string,
  keys: readonly { frame: number; value: number }[],
  frameRate: number
): AnimationGroup {
  const firstTime = keys[0].frame / frameRate;
  const lastTime = keys[keys.length - 1].frame / frameRate;

  const trackKeys = keys.map((k) => ({
    time: k.frame / frameRate,
    value: k.value,
  }));

  const clip = createPropertyAnimationClip(path, [
    {
      path,
      keys: trackKeys,
      interpolation: "linear",
    },
  ]);

  return createPropertyAnimationGroup(manager, target, clip, {
    fromTime: firstTime,
    toTime: lastTime,
    loop: true,
  });
}
