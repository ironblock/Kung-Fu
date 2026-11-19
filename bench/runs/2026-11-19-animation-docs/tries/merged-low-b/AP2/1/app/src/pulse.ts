import {
  AnimationManager,
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  stopAnimation,
  playAnimation,
} from "@babylonjs/lite";

export function createPulse(
  manager: AnimationManager,
  button: { scale: number }
): () => void {
  const clip = createPropertyAnimationClip("pulse", [
    {
      path: "scale",
      keys: [
        { time: 0, value: 1 },
        { time: 0.2, value: 1.5 },
        { time: 0.4, value: 1 },
      ],
    },
  ]);

  const group = createPropertyAnimationGroup(manager, button, clip, {
    loop: false,
    fromTime: 0,
    toTime: 0.4,
  });

  // Stop immediately so nothing moves before the first press.
  stopAnimation(group);

  return () => {
    stopAnimation(group);
    playAnimation(group);
  };
}
