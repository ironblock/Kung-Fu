import {
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  addAnimationGroup,
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
  const trackKeys = keys.map((k) => ({ frame: k.frame, value: k.value }));

  const clip = createPropertyAnimationClip(
    path,
    [{ path, keys: trackKeys, frameRate, interpolation: "linear" }],
    { frameRate }
  );

  const group = createPropertyAnimationGroup(
    manager,
    target,
    clip,
    {
      loop: true,
      fromFrame: keys[0].frame,
      toFrame: keys[keys.length - 1].frame,
    }
  );

  addAnimationGroup(manager, group);
  playAnimation(group);

  return group;
}
