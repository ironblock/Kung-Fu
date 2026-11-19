import {
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  playAnimation,
} from "@babylonjs/lite";

import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
  manager: AnimationManager,
  target: object,
  path: string,
  keys: readonly { frame: number; value: number }[],
  frameRate: number
): AnimationGroup {
  const track = {
    path,
    keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
    frameRate,
    interpolation: "linear" as const,
  };

  const clip = createPropertyAnimationClip(path, [track], { frameRate });
  const group = createPropertyAnimationGroup(manager, target, clip, { loop: true });

  playAnimation(group);

  return group;
}
