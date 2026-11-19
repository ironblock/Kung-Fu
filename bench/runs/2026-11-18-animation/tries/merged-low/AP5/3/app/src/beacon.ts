import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
  manager: AnimationManager,
  lamp: { intensity: number },
  periodSeconds: number
): (strength: number) => void {
  let elapsed = 0;
  let strength = 1;

  const task = createAnimationTask((_mgr, deltaMs) => {
    elapsed += deltaMs / 1000;
    const phase = elapsed % periodSeconds;

    if (phase < 0.1) {
      lamp.intensity = (phase / 0.1) * strength;
    } else if (phase < 0.2) {
      lamp.intensity = (1 - (phase - 0.1) / 0.1) * strength;
    } else {
      lamp.intensity = 0;
    }
  });

  addAnimationTask(manager, task);

  return (newStrength: number) => {
    strength = Math.min(1, Math.max(0, newStrength));
  };
}
