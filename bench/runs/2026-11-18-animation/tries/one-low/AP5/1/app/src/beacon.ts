import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
  manager: AnimationManager,
  lamp: { intensity: number },
  periodSeconds: number
): (strength: number) => void {
  let strength = 1;
  let elapsedMs = 0;
  const periodMs = periodSeconds * 1000;

  const task = createAnimationTask((_mgr, deltaMs) => {
    elapsedMs += deltaMs;
    const t = (elapsedMs % periodMs) / 1000;

    if (t < 0.1) {
      lamp.intensity = (t / 0.1) * strength;
    } else if (t < 0.2) {
      lamp.intensity = (1 - (t - 0.1) / 0.1) * strength;
    } else {
      lamp.intensity = 0;
    }
  });

  addAnimationTask(manager, task);

  return (newStrength: number) => {
    strength = newStrength;
  };
}
