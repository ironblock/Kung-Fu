import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
  manager: AnimationManager,
  lamp: { intensity: number },
  periodSeconds: number
): (strength: number) => void {
  let elapsed = 0;
  let strength = 1;
  let pendingStrength: number | null = null;

  const task = createAnimationTask((_mgr, deltaMs) => {
    if (pendingStrength !== null) {
      strength = pendingStrength;
      pendingStrength = null;
    }

    elapsed += deltaMs / 1000;
    const t = elapsed % periodSeconds;

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
    pendingStrength = Math.min(Math.max(newStrength, 0), 1);
  };
}
