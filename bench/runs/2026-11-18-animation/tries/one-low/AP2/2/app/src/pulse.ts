import type { AnimationManager } from "@babylonjs/lite";
import {
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  pauseAnimation,
  playAnimation,
} from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
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

  const group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
  pauseAnimation(group);

  return () => {
    group.currentTime = 0;
    playAnimation(group);
  };
}
