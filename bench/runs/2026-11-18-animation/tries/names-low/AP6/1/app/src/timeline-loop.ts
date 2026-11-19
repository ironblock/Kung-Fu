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
  const keyframes = keys.map((k) => ({ frame: k.frame, value: k.value }));

  const track = {
    path,
    keys: keyframes,
    interpolation: "linear" as const,
  };

  const clip = createPropertyAnimationClip(path, [track], { frameRate });

  const group = createPropertyAnimationGroup(manager, target, clip, {
    loop: true,
  });

  addAnimationGroup(manager, group);
  playAnimation(group);

  return group;
}
