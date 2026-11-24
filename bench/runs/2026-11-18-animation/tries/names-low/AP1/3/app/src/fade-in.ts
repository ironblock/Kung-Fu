import {
  type AnimationManager,
  type AnimationGroup,
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  playAnimation,
} from "@babylonjs/lite";

export function fadeIn(
  manager: AnimationManager,
  panel: { alpha: number },
  durationMs: number
): AnimationGroup {
  const clip = createPropertyAnimationClip("fadeIn", [
    {
      path: "alpha",
      keys: [
        { time: 0, value: 0 },
        { time: durationMs, value: 1 },
      ],
      interpolation: "linear",
    },
  ]);

  const group = createPropertyAnimationGroup(manager, panel, clip, {
    loop: false,
  });

  playAnimation(group);

  return group;
}
