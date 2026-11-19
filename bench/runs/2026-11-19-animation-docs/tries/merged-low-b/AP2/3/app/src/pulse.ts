import {
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  goToFrame,
  playAnimation,
} from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

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
      interpolation: "linear",
    },
  ]);

  const group = createPropertyAnimationGroup(manager, button, clip, {
    loop: false,
  });

  // Pause immediately so nothing moves before the first press.
  goToFrame(group, 0);

  return () => {
    goToFrame(group, 0);
    playAnimation(group);
  };
}
