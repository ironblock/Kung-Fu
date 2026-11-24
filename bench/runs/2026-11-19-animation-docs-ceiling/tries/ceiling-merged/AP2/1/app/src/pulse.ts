import {
  createPropertyAnimationClip,
  createPropertyAnimationGroup,
  playAnimation,
  stopAnimation,
} from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createPulse(
  manager: AnimationManager,
  button: { scale: number },
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
    // use the clip's own (float32-rounded) duration so the final write is exactly 1
    toTime: clip.duration,
  });

  // The group starts playing on creation; hold it still until the first press.
  stopAnimation(group);

  return () => {
    // Restart from the beginning, also when a pulse is running or has finished.
    stopAnimation(group);
    playAnimation(group);
  };
}
